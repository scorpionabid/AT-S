<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentShare;
use App\Models\DocumentDownload;
use App\Models\DocumentCollection;
use App\Models\DocumentAccessLog;
use App\Models\DocumentAuthorityMatrix;
use App\Models\UserStorageQuota;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\Response;

class DocumentController extends Controller
{
    /**
     * Display a listing of documents
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Document::with(['uploader', 'institution'])
                        ->accessibleBy($user)
                        ->active()
                        ->latestVersions();

        // Filtering
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('file_type')) {
            $query->byFileType($request->file_type);
        }

        if ($request->filled('access_level')) {
            $query->byAccessLevel($request->access_level);
        }

        if ($request->filled('institution_id')) {
            $query->where('institution_id', $request->institution_id);
        }

        if ($request->filled('uploaded_by')) {
            $query->where('uploaded_by', $request->uploaded_by);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('content_preview', 'like', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $documents = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Store a newly uploaded document
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max (PRD-2)
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|in:' . implode(',', array_keys(Document::CATEGORIES)),
            'access_level' => 'required|in:' . implode(',', array_keys(Document::ACCESS_LEVELS)),
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'allowed_users' => 'nullable|array',
            'allowed_users.*' => 'integer|exists:users,id',
            'allowed_roles' => 'nullable|array',
            'allowed_institutions' => 'nullable|array',
            'allowed_institutions.*' => 'integer|exists:institutions,id',
            'is_public' => 'boolean',
            'is_downloadable' => 'boolean',
            'is_viewable_online' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');

        // Validate file according to PRD-2 restrictions
        $fileValidationErrors = Document::validateFile($file);
        if (!empty($fileValidationErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'File validation failed',
                'errors' => $fileValidationErrors,
            ], 422);
        }

        // Check user storage quota
        $quota = UserStorageQuota::getOrCreateForUser($user);
        if (!$quota->canUpload($file->getSize())) {
            return response()->json([
                'success' => false,
                'message' => 'Yüklənən fayl ölçüsü aylıq kvotanızı aşır.',
                'quota_info' => $quota->getStatistics(),
            ], 413);
        }

        try {
            // Generate unique stored filename
            $storedFilename = Document::generateStoredFilename($file->getClientOriginalName());
            $filePath = 'documents/' . now()->format('Y/m') . '/' . $storedFilename;

            // Store file
            $file->storeAs('documents/' . now()->format('Y/m'), $storedFilename, 'local');

            // Calculate file hash for duplicate detection
            $fileHash = hash_file('sha256', $file->getPathname());

            // Determine file type from MIME
            $fileType = Document::getFileTypeFromMime($file->getMimeType());

            // Create document record
            $document = Document::create([
                'title' => $request->title,
                'description' => $request->description,
                'original_filename' => $file->getClientOriginalName(),
                'stored_filename' => $storedFilename,
                'file_path' => $filePath,
                'file_extension' => $file->getClientOriginalExtension(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'file_hash' => $fileHash,
                'file_type' => $fileType,
                'access_level' => $request->access_level,
                'uploaded_by' => $user->id,
                'institution_id' => $user->institution_id,
                'allowed_users' => $request->allowed_users,
                'allowed_roles' => $request->allowed_roles,
                'allowed_institutions' => $request->allowed_institutions,
                'category' => $request->category,
                'tags' => $request->tags,
                'is_public' => $request->boolean('is_public', false),
                'is_downloadable' => $request->boolean('is_downloadable', true),
                'is_viewable_online' => $request->boolean('is_viewable_online', true),
                'expires_at' => $request->expires_at,
                'published_at' => now(),
                'status' => 'active',
            ]);

            // Update user quota
            $quota->addUpload($file->getSize());

            return response()->json([
                'success' => true,
                'message' => 'Sənəd uğurla yükləndi.',
                'data' => $document->load(['uploader', 'institution']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sənəd yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Display the specified document
     */
    public function show(Document $document): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canAccess($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədə giriş icazəniz yoxdur.',
            ], 403);
        }

        $document->load(['uploader', 'institution', 'versions', 'shares' => function ($query) {
            $query->active();
        }]);

        // Add analytics if user can edit
        $analytics = null;
        if ($document->canEdit($user)) {
            $analytics = $document->getAnalytics();
        }

        return response()->json([
            'success' => true,
            'data' => $document,
            'analytics' => $analytics,
        ]);
    }

    /**
     * Update the specified document
     */
    public function update(Request $request, Document $document): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canEdit($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədi dəyişdirmək icazəniz yoxdur.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'in:' . implode(',', array_keys(Document::CATEGORIES)),
            'access_level' => 'in:' . implode(',', array_keys(Document::ACCESS_LEVELS)),
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'allowed_users' => 'nullable|array',
            'allowed_users.*' => 'integer|exists:users,id',
            'allowed_roles' => 'nullable|array',
            'allowed_institutions' => 'nullable|array',
            'allowed_institutions.*' => 'integer|exists:institutions,id',
            'is_public' => 'boolean',
            'is_downloadable' => 'boolean',
            'is_viewable_online' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $document->update($request->only([
            'title', 'description', 'category', 'access_level', 'tags',
            'allowed_users', 'allowed_roles', 'allowed_institutions',
            'is_public', 'is_downloadable', 'is_viewable_online', 'expires_at'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Sənəd məlumatları yeniləndi.',
            'data' => $document->fresh(['uploader', 'institution']),
        ]);
    }

    /**
     * Remove the specified document
     */
    public function destroy(Document $document): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canEdit($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədi silmək icazəniz yoxdur.',
            ], 403);
        }

        try {
            // Update user quota
            $quota = UserStorageQuota::getOrCreateForUser($document->uploader);
            $quota->removeFile($document->file_size);

            // Delete physical file
            if (Storage::exists($document->file_path)) {
                Storage::delete($document->file_path);
            }

            // Soft delete or mark as deleted
            $document->update([
                'status' => 'deleted',
                'archived_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sənəd silindi.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sənəd silinərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Download document
     */
    public function download(Document $document): Response
    {
        $user = Auth::user();

        if (!$document->canDownload($user)) {
            abort(403, 'Bu sənədi endirmək icazəniz yoxdur.');
        }

        if (!Storage::exists($document->file_path)) {
            abort(404, 'Fayl tapılmadı.');
        }

        // Record download
        DocumentDownload::recordDownload($document, $user, null, 'direct');

        return Storage::download(
            $document->file_path,
            $document->original_filename,
            ['Content-Type' => $document->mime_type]
        );
    }

    /**
     * Preview document online
     */
    public function preview(Document $document): Response
    {
        $user = Auth::user();

        if (!$document->canAccess($user) || !$document->is_viewable_online) {
            abort(403, 'Bu sənədi önizləmək icazəniz yoxdur.');
        }

        if (!Storage::exists($document->file_path)) {
            abort(404, 'Fayl tapılmadı.');
        }

        // Record view
        DocumentDownload::recordDownload($document, $user, null, 'preview');

        return Storage::response(
            $document->file_path,
            $document->original_filename,
            ['Content-Type' => $document->mime_type]
        );
    }

    /**
     * Create new version of document
     */
    public function createVersion(Request $request, Document $document): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canEdit($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədin yeni versiyasını yaratmaq icazəniz yoxdur.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240',
            'version_notes' => 'nullable|string|max:500',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');

        // Validate file
        $fileValidationErrors = Document::validateFile($file);
        if (!empty($fileValidationErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'File validation failed',
                'errors' => $fileValidationErrors,
            ], 422);
        }

        // Check user quota
        $quota = UserStorageQuota::getOrCreateForUser($user);
        if (!$quota->canUpload($file->getSize())) {
            return response()->json([
                'success' => false,
                'message' => 'Yüklənən fayl ölçüsü aylıq kvotanızı aşır.',
                'quota_info' => $quota->getStatistics(),
            ], 413);
        }

        try {
            // Store new file
            $storedFilename = Document::generateStoredFilename($file->getClientOriginalName());
            $filePath = 'documents/' . now()->format('Y/m') . '/' . $storedFilename;
            $file->storeAs('documents/' . now()->format('Y/m'), $storedFilename, 'local');

            // Create new version
            $newVersion = $document->createNewVersion([
                'original_filename' => $file->getClientOriginalName(),
                'stored_filename' => $storedFilename,
                'file_path' => $filePath,
                'file_extension' => $file->getClientOriginalExtension(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'file_hash' => hash_file('sha256', $file->getPathname()),
                'file_type' => Document::getFileTypeFromMime($file->getMimeType()),
                'version_notes' => $request->version_notes,
                'title' => $request->title,
                'description' => $request->description,
                'uploaded_by' => $user->id,
            ]);

            // Update quota
            $quota->addUpload($file->getSize());

            return response()->json([
                'success' => true,
                'message' => 'Sənədin yeni versiyası yaradıldı.',
                'data' => $newVersion->load(['uploader', 'institution']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Yeni versiya yaradılarkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Get all versions of a document
     */
    public function versions(Document $document): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canAccess($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədə giriş icazəniz yoxdur.',
            ], 403);
        }

        $versions = $document->getAllVersions()->load(['uploader']);

        return response()->json([
            'success' => true,
            'data' => $versions,
        ]);
    }

    /**
     * Create share link for document
     */
    public function createShare(Request $request, Document $document): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canAccess($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədi paylaşmaq icazəniz yoxdur.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'expires_at' => 'nullable|date|after:now|before:' . now()->addDays(30)->toDateString(),
            'max_downloads' => 'nullable|integer|min:1|max:1000',
            'password' => 'nullable|string|min:4|max:50',
            'can_download' => 'boolean',
            'can_view_online' => 'boolean',
            'can_share' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $shareOptions = [
                'name' => $request->name,
                'expires_at' => $request->expires_at ? \Carbon\Carbon::parse($request->expires_at) : now()->addDays(7),
                'max_downloads' => $request->max_downloads,
                'requires_password' => $request->filled('password'),
                'password' => $request->password,
                'can_download' => $request->boolean('can_download', true),
                'can_view_online' => $request->boolean('can_view_online', true),
                'can_share' => $request->boolean('can_share', false),
            ];

            $share = DocumentShare::createShareLink($document, $user, $shareOptions);

            return response()->json([
                'success' => true,
                'message' => 'Paylaşım linki yaradıldı.',
                'data' => $share,
                'share_url' => $share->share_url,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paylaşım linki yaradılarkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Get user's storage quota information
     */
    public function getQuotaInfo(): JsonResponse
    {
        $user = Auth::user();
        $quota = UserStorageQuota::getOrCreateForUser($user);

        return response()->json([
            'success' => true,
            'data' => $quota->getStatistics(),
        ]);
    }

    /**
     * Get document analytics (admin only)
     */
    public function getAnalytics(Document $document): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canEdit($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədin analitikasını görmək icazəniz yoxdur.',
            ], 403);
        }

        $analytics = $document->getAnalytics();
        $downloadStats = DocumentDownload::getDocumentStats($document);

        return response()->json([
            'success' => true,
            'data' => [
                'document_analytics' => $analytics,
                'download_statistics' => $downloadStats,
            ],
        ]);
    }

    /**
     * Upload document with regional hierarchy authority checking
     */
    public function uploadWithAuthority(Request $request): JsonResponse
    {
        $user = Auth::user();
        $userRole = $user->roles->first();
        
        if (!$userRole) {
            return response()->json([
                'success' => false,
                'message' => 'İstifadəçi rolunuz müəyyən edilməyib.',
            ], 403);
        }

        // Get authority matrix for user's role
        $authority = DocumentAuthorityMatrix::getForRole($userRole->name);
        
        if (!$authority) {
            // Use default authority for role
            $defaultAuthority = DocumentAuthorityMatrix::getDefaultForRole($userRole->name);
            $authority = (object) $defaultAuthority;
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|in:administrative,financial,educational,hr,technical,legal,reports,forms,other',
            'regional_scope' => 'required|in:own_region,own_sector,specific_institutions,cross_regional',
            'target_institutions' => 'nullable|array',
            'target_institutions.*' => 'integer|exists:institutions,id',
            'target_roles' => 'nullable|array',
            'target_roles.*' => 'string',
            'cascade_to_children' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasiya xətası',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');

        // Check file type permission
        $fileType = Document::getFileTypeFromMime($file->getMimeType());
        if (!$authority->isFileTypeAllowed($fileType)) {
            return response()->json([
                'success' => false,
                'message' => "Bu fayl tipi ({$fileType}) sizin rolunuz üçün icazə verilmir.",
            ], 403);
        }

        // Check file size permission
        if (!$authority->isFileSizeAllowed($file->getSize())) {
            $maxSizeMB = is_object($authority) ? $authority->max_file_size_mb : $authority['max_file_size_mb'];
            return response()->json([
                'success' => false,
                'message' => "Fayl ölçüsü maksimum icazə verilən ölçüdən ({$maxSizeMB}MB) böyükdür.",
            ], 413);
        }

        // Check regional scope permission
        $uploadScope = is_object($authority) ? $authority->upload_scope : $authority['upload_scope'];
        if (!$this->canUploadWithScope($user, $request->regional_scope, $uploadScope)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu paylaşım əhatəsi üçün səlahiyyətiniz yoxdur.',
            ], 403);
        }

        // Validate target institutions based on authority
        if ($request->target_institutions) {
            $allowedInstitutions = $this->getUserTargetableInstitutions($user);
            $invalidInstitutions = array_diff($request->target_institutions, $allowedInstitutions);
            
            if (!empty($invalidInstitutions)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seçilən təşkilatlara fayl yükləmə səlahiyyətiniz yoxdur.',
                ], 403);
            }
        }

        try {
            // Store file
            $storedFilename = Document::generateStoredFilename($file->getClientOriginalName());
            $filePath = 'documents/' . now()->format('Y/m') . '/' . $storedFilename;
            $file->storeAs('documents/' . now()->format('Y/m'), $storedFilename, 'local');

            // Create document with regional hierarchy features
            $document = Document::create([
                'title' => $request->title,
                'description' => $request->description,
                'original_filename' => $file->getClientOriginalName(),
                'stored_filename' => $storedFilename,
                'file_path' => $filePath,
                'file_extension' => $file->getClientOriginalExtension(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'file_hash' => hash_file('sha256', $file->getPathname()),
                'file_type' => $fileType,
                'category' => $request->category,
                'uploaded_by' => $user->id,
                'institution_id' => $user->institution_id,
                'creator_role' => $userRole->name,
                'creator_institution_id' => $user->institution_id,
                'regional_scope' => $request->regional_scope,
                'target_institutions' => $request->target_institutions,
                'target_roles' => $request->target_roles,
                'cascade_to_children' => $request->boolean('cascade_to_children', false),
                'tags' => $request->tags,
                'expires_at' => $request->expires_at,
                'published_at' => now(),
                'status' => 'active',
            ]);

            // Log the upload
            DocumentAccessLog::create([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'access_type' => 'upload',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'access_metadata' => [
                    'file_size' => $file->getSize(),
                    'regional_scope' => $request->regional_scope,
                    'target_count' => count($request->target_institutions ?? []),
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sənəd uğurla yükləndi və paylaşıldı.',
                'data' => $document->load(['uploader', 'institution']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sənəd yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Create regional share with time limits and authority control
     */
    public function createRegionalShare(Request $request, Document $document): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canAccess($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədi paylaşmaq səlahiyyətiniz yoxdur.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'share_scope' => 'required|in:public,regional,sectoral,institutional,specific_users',
            'target_institutions' => 'nullable|array',
            'target_institutions.*' => 'integer|exists:institutions,id',
            'target_roles' => 'nullable|array',
            'target_roles.*' => 'string',
            'expires_at' => 'nullable|date|after:now',
            'access_start_time' => 'nullable|date_format:H:i',
            'access_end_time' => 'nullable|date_format:H:i',
            'access_days_of_week' => 'nullable|array',
            'access_days_of_week.*' => 'integer|between:0,6',
            'max_downloads' => 'nullable|integer|min:1',
            'notify_on_access' => 'boolean',
            'notify_on_download' => 'boolean',
            'access_message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasiya xətası',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check sharing authority
        $userRole = $user->roles->first();
        $authority = DocumentAuthorityMatrix::getForRole($userRole->name);
        
        if (!$authority) {
            $defaultAuthority = DocumentAuthorityMatrix::getDefaultForRole($userRole->name);
            $authority = (object) $defaultAuthority;
        }

        // Check if user can create public links
        if ($request->share_scope === 'public') {
            $canCreatePublic = is_object($authority) ? $authority->can_create_public_links : $authority['can_create_public_links'];
            if (!$canCreatePublic) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sizin rolunuz üçün açıq linklər yaratmaq icazə verilmir.',
                ], 403);
            }
        }

        try {
            $share = DocumentShare::create([
                'document_id' => $document->id,
                'shared_by' => $user->id,
                'share_token' => Str::random(32),
                'share_scope' => $request->share_scope,
                'target_institutions' => $request->target_institutions,
                'target_roles' => $request->target_roles,
                'expires_at' => $request->expires_at ?? now()->addDays(30),
                'access_start_time' => $request->access_start_time,
                'access_end_time' => $request->access_end_time,
                'access_days_of_week' => $request->access_days_of_week,
                'max_downloads' => $request->max_downloads,
                'notify_on_access' => $request->boolean('notify_on_access', false),
                'notify_on_download' => $request->boolean('notify_on_download', false),
                'access_message' => $request->access_message,
                'can_download' => true,
                'can_view_online' => true,
                'is_active' => true,
            ]);

            // Log the share creation
            DocumentAccessLog::create([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'share_id' => $share->id,
                'access_type' => 'share',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'access_metadata' => [
                    'share_scope' => $request->share_scope,
                    'target_count' => count($request->target_institutions ?? []),
                    'has_time_restrictions' => !empty($request->access_start_time) || !empty($request->access_end_time),
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Regional paylaşım uğurla yaradıldı.',
                'data' => $share,
                'share_url' => route('documents.shared', ['token' => $share->share_token]),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paylaşım yaradılarkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Get user's authority matrix and upload permissions
     */
    public function getUserAuthority(): JsonResponse
    {
        $user = Auth::user();
        $userRole = $user->roles->first();
        
        if (!$userRole) {
            return response()->json([
                'success' => false,
                'message' => 'İstifadəçi rolunuz müəyyən edilməyib.',
            ], 403);
        }

        $authority = DocumentAuthorityMatrix::getForRole($userRole->name);
        
        if (!$authority) {
            $authority = DocumentAuthorityMatrix::getDefaultForRole($userRole->name);
        }

        $targetableInstitutions = $this->getUserTargetableInstitutions($user);
        $institutions = Institution::whereIn('id', $targetableInstitutions)
                                  ->where('is_active', true)
                                  ->get(['id', 'name', 'type', 'level', 'parent_id']);

        return response()->json([
            'success' => true,
            'data' => [
                'authority_matrix' => $authority,
                'targetable_institutions' => $institutions,
                'role' => $userRole->name,
                'upload_scopes' => [
                    'own_institution' => 'Yalnız öz təşkilatımda',
                    'own_sector' => 'Öz sektorumda',
                    'own_region' => 'Öz regionumda',
                    'cross_regional' => 'Bütün regionlarda',
                ],
                'share_scopes' => [
                    'institutional' => 'Təşkilat daxili',
                    'sectoral' => 'Sektor daxili',
                    'regional' => 'Regional',
                    'specific_users' => 'Xüsusi istifadəçilər',
                    'public' => 'Açıq',
                ],
            ],
        ]);
    }

    /**
     * Get accessible documents with regional hierarchy filtering
     */
    public function getAccessibleDocuments(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Document::query()->with(['uploader', 'institution']);

        // Apply regional hierarchy filtering
        $this->applyRegionalFilter($query, $user);

        // Apply additional filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('file_type')) {
            $query->where('file_type', $request->file_type);
        }

        if ($request->filled('regional_scope')) {
            $query->where('regional_scope', $request->regional_scope);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        // Only active documents
        $query->where('status', 'active');

        // Sort by latest
        $query->orderBy('created_at', 'desc');

        $documents = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Get document statistics for user's accessible scope
     */
    public function getDocumentStatistics(): JsonResponse
    {
        $user = Auth::user();
        $query = Document::query();

        // Apply regional hierarchy filtering
        $this->applyRegionalFilter($query, $user);

        $stats = [
            'total_documents' => $query->where('status', 'active')->count(),
            'total_size_mb' => round($query->where('status', 'active')->sum('file_size') / 1024 / 1024, 2),
            'by_category' => $query->where('status', 'active')
                                  ->groupBy('category')
                                  ->selectRaw('category, count(*) as count')
                                  ->pluck('count', 'category'),
            'by_file_type' => $query->where('status', 'active')
                                   ->groupBy('file_type')
                                   ->selectRaw('file_type, count(*) as count')
                                   ->pluck('count', 'file_type'),
            'recent_uploads' => $query->where('status', 'active')
                                     ->where('created_at', '>=', now()->subDays(7))
                                     ->count(),
            'expiring_soon' => $query->where('status', 'active')
                                    ->whereNotNull('expires_at')
                                    ->where('expires_at', '<=', now()->addDays(7))
                                    ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Check if user can upload with specified scope
     */
    private function canUploadWithScope($user, $requestedScope, $userUploadScope): bool
    {
        $hierarchy = [
            'own_institution' => 1,
            'own_sector' => 2,
            'own_region' => 3,
            'cross_regional' => 4,
        ];

        $userLevel = $hierarchy[$userUploadScope] ?? 1;
        $requestedLevel = $hierarchy[$requestedScope] ?? 1;

        return $requestedLevel <= $userLevel;
    }

    /**
     * Get institutions user can target for document sharing
     */
    private function getUserTargetableInstitutions($user): array
    {
        $userRole = $user->roles->first();
        if (!$userRole) return [];

        $userInstitution = $user->institution;
        if (!$userInstitution) return [];

        switch ($userRole->name) {
            case 'superadmin':
                return Institution::where('is_active', true)->pluck('id')->toArray();
                
            case 'regionadmin':
                return Institution::where('region_code', $userInstitution->region_code)
                                 ->where('is_active', true)
                                 ->pluck('id')->toArray();
                                 
            case 'regionoperator':
                return Institution::where('region_code', $userInstitution->region_code)
                                 ->where('type', 'school')
                                 ->where('is_active', true)
                                 ->pluck('id')->toArray();
                                 
            case 'sektoradmin':
                return Institution::where(function($q) use ($userInstitution) {
                    $q->where('id', $userInstitution->id)
                      ->orWhere('parent_id', $userInstitution->id);
                })->where('is_active', true)->pluck('id')->toArray();
                
            case 'sektoroperator':
                $userSector = $userInstitution->type === 'sektor' ? $userInstitution : $userInstitution->parent;
                if (!$userSector) return [$userInstitution->id];
                
                return Institution::where('parent_id', $userSector->id)
                                 ->where('type', 'school')
                                 ->where('is_active', true)
                                 ->pluck('id')->toArray();
                                 
            default:
                return [$userInstitution->id];
        }
    }

    /**
     * Apply regional hierarchy filter to query
     */
    private function applyRegionalFilter($query, $user): void
    {
        $userRole = $user->roles->first();
        
        if (!$userRole || $userRole->name === 'superadmin') {
            return; // SuperAdmin sees everything
        }

        $userInstitution = $user->institution;
        if (!$userInstitution) {
            $query->where('id', -1); // No access if no institution
            return;
        }

        $query->where(function($q) use ($user, $userInstitution, $userRole) {
            // Documents uploaded by user
            $q->where('uploaded_by', $user->id)
              
              // Documents targeted to user's institution
              ->orWhereJsonContains('target_institutions', $userInstitution->id)
              
              // Documents targeted to user's role
              ->orWhereJsonContains('target_roles', $userRole->name)
              
              // Regional scope documents
              ->orWhere(function($subQ) use ($userInstitution, $userRole) {
                  $subQ->where('regional_scope', 'own_region')
                       ->where('institution_id', '!=', null)
                       ->whereHas('institution', function($instQ) use ($userInstitution) {
                           $instQ->where('region_code', $userInstitution->region_code);
                       });
              })
              
              // Sectoral scope documents
              ->orWhere(function($subQ) use ($userInstitution) {
                  if ($userInstitution->type === 'school') {
                      $subQ->where('regional_scope', 'own_sector')
                           ->whereHas('institution', function($instQ) use ($userInstitution) {
                               $instQ->where('id', $userInstitution->parent_id);
                           });
                  }
              })
              
              // Institution scope documents
              ->orWhere(function($subQ) use ($userInstitution) {
                  $subQ->where('regional_scope', 'specific_institutions')
                       ->where('institution_id', $userInstitution->id);
              });
        });
    }
}