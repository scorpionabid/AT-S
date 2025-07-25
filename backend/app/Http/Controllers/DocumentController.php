<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentCollection;
use App\Models\UserStorageQuota;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

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
}