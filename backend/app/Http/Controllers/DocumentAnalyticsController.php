<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentDownload;
use App\Models\DocumentAccessLog;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DocumentAnalyticsController extends Controller
{
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
     * Get download analytics for a period
     */
    public function getDownloadAnalytics(Request $request): JsonResponse
    {
        $user = Auth::user();
        $userRole = $user->roles->first();
        
        // Only allow analytics for admin roles
        if (!$userRole || !in_array($userRole->name, ['superadmin', 'regionadmin', 'sektoradmin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Bu statistikaya baxmaq icazəniz yoxdur.',
            ], 403);
        }

        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $query = DocumentDownload::query()
                                ->with(['document', 'user'])
                                ->whereBetween('downloaded_at', [$startDate, $endDate]);

        // Apply user scope filtering
        $this->applyDownloadScopeFilter($query, $user);

        $analytics = [
            'total_downloads' => $query->count(),
            'unique_users' => $query->whereNotNull('user_id')->distinct('user_id')->count(),
            'anonymous_downloads' => $query->whereNull('user_id')->count(),
            'by_file_type' => $query->join('documents', 'document_downloads.document_id', '=', 'documents.id')
                                   ->groupBy('documents.file_type')
                                   ->selectRaw('documents.file_type, count(*) as count')
                                   ->pluck('count', 'file_type'),
            'by_category' => $query->join('documents', 'document_downloads.document_id', '=', 'documents.id')
                                  ->groupBy('documents.category')
                                  ->selectRaw('documents.category, count(*) as count')
                                  ->pluck('count', 'category'),
            'daily_downloads' => $query->selectRaw('DATE(downloaded_at) as date, count(*) as count')
                                      ->groupBy('date')
                                      ->orderBy('date')
                                      ->get(),
            'top_documents' => $query->with(['document'])
                                    ->groupBy('document_id')
                                    ->selectRaw('document_id, count(*) as downloads')
                                    ->orderByDesc('downloads')
                                    ->limit(10)
                                    ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Get access logs for document
     */
    public function getAccessLogs(Document $document, Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$document->canEdit($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu sənədin giriş qeydlərini görmək icazəniz yoxdur.',
            ], 403);
        }

        $query = DocumentAccessLog::where('document_id', $document->id)
                                 ->with(['user'])
                                 ->orderBy('created_at', 'desc');

        if ($request->filled('access_type')) {
            $query->where('access_type', $request->access_type);
        }

        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->end_date);
        }

        $logs = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Generate comprehensive report
     */
    public function generateReport(Request $request): JsonResponse
    {
        $user = Auth::user();
        $userRole = $user->roles->first();
        
        // Only allow reports for admin roles
        if (!$userRole || !in_array($userRole->name, ['superadmin', 'regionadmin', 'sektoradmin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Hesabat yaratmaq icazəniz yoxdur.',
            ], 403);
        }

        $reportType = $request->get('type', 'summary');
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        switch ($reportType) {
            case 'detailed':
                $report = $this->generateDetailedReport($user, $startDate, $endDate);
                break;
            case 'usage':
                $report = $this->generateUsageReport($user, $startDate, $endDate);
                break;
            default:
                $report = $this->generateSummaryReport($user, $startDate, $endDate);
        }

        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString(),
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
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

    /**
     * Apply download scope filter for analytics
     */
    private function applyDownloadScopeFilter($query, $user): void
    {
        $userRole = $user->roles->first();
        
        if (!$userRole || $userRole->name === 'superadmin') {
            return; // SuperAdmin sees everything
        }

        $userInstitution = $user->institution;
        if (!$userInstitution) {
            $query->where('id', -1);
            return;
        }

        // Filter downloads based on user's accessible documents
        $accessibleDocumentIds = Document::query()
                                        ->where(function($q) use ($user, $userInstitution, $userRole) {
                                            $this->applyRegionalFilter($q, $user);
                                        })
                                        ->pluck('id');

        $query->whereIn('document_id', $accessibleDocumentIds);
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
     * Generate summary report
     */
    private function generateSummaryReport($user, $startDate, $endDate): array
    {
        $query = Document::query();
        $this->applyRegionalFilter($query, $user);

        return [
            'type' => 'summary',
            'documents' => [
                'total' => $query->where('status', 'active')->count(),
                'uploaded_in_period' => $query->where('status', 'active')
                                              ->whereBetween('created_at', [$startDate, $endDate])
                                              ->count(),
                'by_category' => $query->where('status', 'active')
                                      ->groupBy('category')
                                      ->selectRaw('category, count(*) as count')
                                      ->pluck('count', 'category'),
            ],
            'storage' => [
                'total_size_mb' => round($query->where('status', 'active')->sum('file_size') / 1024 / 1024, 2),
                'average_file_size_mb' => round($query->where('status', 'active')->avg('file_size') / 1024 / 1024, 2),
            ],
        ];
    }

    /**
     * Generate usage report
     */
    private function generateUsageReport($user, $startDate, $endDate): array
    {
        $downloadQuery = DocumentDownload::whereBetween('downloaded_at', [$startDate, $endDate]);
        $this->applyDownloadScopeFilter($downloadQuery, $user);

        return [
            'type' => 'usage',
            'downloads' => [
                'total' => $downloadQuery->count(),
                'unique_users' => $downloadQuery->whereNotNull('user_id')->distinct('user_id')->count(),
                'by_day' => $downloadQuery->selectRaw('DATE(downloaded_at) as date, count(*) as count')
                                         ->groupBy('date')
                                         ->orderBy('date')
                                         ->get(),
            ],
            'top_documents' => $downloadQuery->with(['document'])
                                            ->groupBy('document_id')
                                            ->selectRaw('document_id, count(*) as downloads')
                                            ->orderByDesc('downloads')
                                            ->limit(10)
                                            ->get(),
        ];
    }

    /**
     * Generate detailed report
     */
    private function generateDetailedReport($user, $startDate, $endDate): array
    {
        return array_merge(
            $this->generateSummaryReport($user, $startDate, $endDate),
            $this->generateUsageReport($user, $startDate, $endDate),
            [
                'type' => 'detailed',
                'access_logs' => DocumentAccessLog::whereBetween('created_at', [$startDate, $endDate])
                                                 ->groupBy('access_type')
                                                 ->selectRaw('access_type, count(*) as count')
                                                 ->pluck('count', 'access_type'),
            ]
        );
    }
}