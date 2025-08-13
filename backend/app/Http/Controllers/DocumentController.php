<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentShare;
use App\Services\DocumentService;
use App\Services\DocumentDownloadService;
use App\Services\DocumentSharingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    protected DocumentService $documentService;
    protected DocumentDownloadService $downloadService;
    protected DocumentSharingService $sharingService;

    public function __construct(
        DocumentService $documentService,
        DocumentDownloadService $downloadService,
        DocumentSharingService $sharingService
    ) {
        $this->documentService = $documentService;
        $this->downloadService = $downloadService;
        $this->sharingService = $sharingService;
    }

    /**
     * Display a listing of documents
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $documents = $this->documentService->getDocuments($request);

            return response()->json([
                'success' => true,
                'data' => $documents,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sənədlər yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Store a newly uploaded document
     */
    public function store(Request $request): JsonResponse
    {
        $validator = $this->validateDocumentStore($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
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

            $document = $this->documentService->createDocument(
                $validator->validated(),
                $file
            );

            return response()->json([
                'success' => true,
                'message' => 'Sənəd uğurla yükləndi.',
                'data' => $document,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Display the specified document
     */
    public function show(Document $document): JsonResponse
    {
        try {
            // Log access
            $this->documentService->logAccess($document, 'view');

            $document->load([
                'uploader:id,first_name,last_name',
                'institution:id,name,name_en'
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sənəd yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Update the specified document
     */
    public function update(Request $request, Document $document): JsonResponse
    {
        $validator = $this->validateDocumentUpdate($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $updatedDocument = $this->documentService->updateDocument(
                $document,
                $validator->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Sənəd uğurla yeniləndi.',
                'data' => $updatedDocument,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Remove the specified document
     */
    public function destroy(Document $document): JsonResponse
    {
        try {
            $this->documentService->deleteDocument($document);

            return response()->json([
                'success' => true,
                'message' => 'Sənəd uğurla silindi.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Download document
     */
    public function download(Document $document): StreamedResponse
    {
        return $this->downloadService->downloadDocument($document);
    }

    /**
     * Preview document
     */
    public function preview(Document $document): StreamedResponse
    {
        return $this->downloadService->previewDocument($document);
    }

    /**
     * Get download statistics
     */
    public function downloadStats(Document $document): JsonResponse
    {
        try {
            $stats = $this->downloadService->getDownloadStatistics($document);

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Statistikalar yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Bulk download documents
     */
    public function bulkDownload(Request $request): StreamedResponse
    {
        $validator = Validator::make($request->all(), [
            'document_ids' => 'required|array|min:1',
            'document_ids.*' => 'integer|exists:documents,id'
        ]);

        if ($validator->fails()) {
            abort(422, 'Invalid document IDs provided.');
        }

        return $this->downloadService->bulkDownload($request->document_ids);
    }

    /**
     * Share document
     */
    public function share(Request $request, Document $document): JsonResponse
    {
        $validator = $this->validateDocumentShare($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $share = $this->sharingService->shareDocument(
                $document,
                $validator->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Sənəd uğurla paylaşıldı.',
                'data' => $share,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Create public link
     */
    public function createPublicLink(Request $request, Document $document): JsonResponse
    {
        $validator = $this->validatePublicLink($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $share = $this->sharingService->createPublicLink(
                $document,
                $validator->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'İctimai link yaradıldı.',
                'data' => [
                    'share_id' => $share->id,
                    'public_url' => url('/documents/public/' . $share->public_token),
                    'expires_at' => $share->expires_at,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Access document via public link
     */
    public function accessPublic(string $token, Request $request): JsonResponse
    {
        try {
            $document = $this->sharingService->accessViaPublicLink(
                $token,
                $request->get('password')
            );

            return response()->json([
                'success' => true,
                'data' => $document->load(['uploader:id,first_name,last_name']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Revoke document share
     */
    public function revokeShare(DocumentShare $share): JsonResponse
    {
        try {
            $this->sharingService->revokeShare($share);

            return response()->json([
                'success' => true,
                'message' => 'Paylaşım ləğv edildi.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Get sharing statistics
     */
    public function sharingStats(Document $document): JsonResponse
    {
        try {
            $stats = $this->sharingService->getShareStatistics($document);

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paylaşım statistikaları yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Get user's shared documents
     */
    public function myShares(): JsonResponse
    {
        try {
            $shares = $this->sharingService->getUserSharedDocuments(Auth::id());

            return response()->json([
                'success' => true,
                'data' => $shares,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paylaşımlar yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Get document statistics
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = $this->documentService->getDocumentStats();

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Statistikalar yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Validation for document store
     */
    private function validateDocumentStore(Request $request)
    {
        return Validator::make($request->all(), [
            'file' => 'required|file|max:10240',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|in:' . implode(',', array_keys(Document::CATEGORIES)),
            'access_level' => 'nullable|in:' . implode(',', array_keys(Document::ACCESS_LEVELS)),
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'allowed_users' => 'nullable|array',
            'allowed_users.*' => 'integer|exists:users,id',
            'allowed_roles' => 'nullable|array',
            'allowed_institutions' => 'nullable|array',
            'allowed_institutions.*' => 'integer|exists:institutions,id',
            'accessible_institutions' => 'nullable|array',
            'accessible_institutions.*' => 'integer|exists:institutions,id',
            'accessible_departments' => 'nullable|array',
            'accessible_departments.*' => 'integer|exists:departments,id',
            'is_public' => 'boolean',
            'is_downloadable' => 'boolean',
            'is_viewable_online' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);
    }

    /**
     * Validation for document update
     */
    private function validateDocumentUpdate(Request $request)
    {
        return Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'sometimes|required|in:' . implode(',', array_keys(Document::CATEGORIES)),
            'access_level' => 'sometimes|required|in:' . implode(',', array_keys(Document::ACCESS_LEVELS)),
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
    }

    /**
     * Validation for document sharing
     */
    private function validateDocumentShare(Request $request)
    {
        return Validator::make($request->all(), [
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer|exists:users,id',
            'role_names' => 'nullable|array',
            'institution_ids' => 'nullable|array',
            'institution_ids.*' => 'integer|exists:institutions,id',
            'share_type' => 'required|in:view,edit',
            'message' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:now',
            'allow_download' => 'boolean',
            'allow_reshare' => 'boolean',
        ]);
    }

    /**
     * Validation for public link creation
     */
    private function validatePublicLink(Request $request)
    {
        return Validator::make($request->all(), [
            'expires_at' => 'nullable|date|after:now',
            'allow_download' => 'boolean',
            'max_downloads' => 'nullable|integer|min:1',
            'password' => 'nullable|string|min:4|max:20',
        ]);
    }
}