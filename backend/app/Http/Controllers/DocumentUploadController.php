<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentAccessLog;
use App\Models\DocumentAuthorityMatrix;
use App\Models\UserStorageQuota;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class DocumentUploadController extends Controller
{
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
}