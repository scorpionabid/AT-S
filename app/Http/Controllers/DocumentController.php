<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentShare;
use App\Models\DocumentDownload;
use App\Models\UserStorageQuota;
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
}