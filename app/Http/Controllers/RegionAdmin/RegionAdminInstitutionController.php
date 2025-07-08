<?php

namespace App\Http\Controllers\RegionAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Institution;
use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class RegionAdminInstitutionController extends Controller
{
    /**
     * Get institution statistics for RegionAdmin
     */
    public function getInstitutionStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $userRegionId = $user->institution_id;
        
        // Get sectors in region
        $sectors = Institution::where('parent_id', $userRegionId)
            ->where('level', 3)
            ->with(['children' => function($query) {
                $query->where('level', 4); // Schools
            }])
            ->get()
            ->map(function($sector) {
                $schools = $sector->children;
                $schoolIds = $schools->pluck('id');
                
                // Get users in sector schools
                $totalUsers = User::whereIn('institution_id', $schoolIds)->count();
                $activeUsers = User::whereIn('institution_id', $schoolIds)
                    ->where('last_login_at', '>=', Carbon::now()->subDays(30))
                    ->count();
                
                // Get survey activity
                $surveys = Survey::whereHas('targeting', function($query) use ($schoolIds) {
                    $query->whereIn('institution_id', $schoolIds);
                })->count();
                
                return [
                    'id' => $sector->id,
                    'name' => $sector->name,
                    'schools_count' => $schools->count(),
                    'total_users' => $totalUsers,
                    'active_users' => $activeUsers,
                    'surveys_count' => $surveys,
                    'activity_rate' => $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 1) : 0,
                    'schools' => $schools->map(function($school) {
                        $userCount = User::where('institution_id', $school->id)->count();
                        $activeCount = User::where('institution_id', $school->id)
                            ->where('last_login_at', '>=', Carbon::now()->subDays(30))
                            ->count();
                        
                        return [
                            'id' => $school->id,
                            'name' => $school->name,
                            'user_count' => $userCount,
                            'active_users' => $activeCount,
                            'activity_rate' => $userCount > 0 ? round(($activeCount / $userCount) * 100, 1) : 0
                        ];
                    })
                ];
            });
        
        return response()->json([
            'sectors' => $sectors,
            'total_sectors' => $sectors->count(),
            'total_schools' => $sectors->sum('schools_count'),
            'total_users' => $sectors->sum('total_users'),
            'total_active_users' => $sectors->sum('active_users')
        ]);
    }

    /**
     * Get detailed institution hierarchy for the region
     */
    public function getInstitutionHierarchy(Request $request): JsonResponse
    {
        $user = $request->user();
        $userRegionId = $user->institution_id;
        
        $region = Institution::with(['children.children']) // Region -> Sectors -> Schools
            ->find($userRegionId);
            
        if (!$region) {
            return response()->json(['error' => 'Region not found'], 404);
        }
        
        $hierarchyData = [
            'region' => [
                'id' => $region->id,
                'name' => $region->name,
                'level' => $region->level,
                'sectors' => $region->children->map(function($sector) {
                    return [
                        'id' => $sector->id,
                        'name' => $sector->name,
                        'level' => $sector->level,
                        'schools_count' => $sector->children->count(),
                        'schools' => $sector->children->map(function($school) {
                            $userCount = User::where('institution_id', $school->id)->count();
                            return [
                                'id' => $school->id,
                                'name' => $school->name,
                                'level' => $school->level,
                                'user_count' => $userCount
                            ];
                        })
                    ];
                })
            ]
        ];
        
        return response()->json($hierarchyData);
    }

    /**
     * Get performance insights for institutions
     */
    public function getPerformanceInsights(Request $request): JsonResponse
    {
        $user = $request->user();
        $userRegionId = $user->institution_id;
        
        // Get sectors and calculate performance metrics
        $sectors = Institution::where('parent_id', $userRegionId)
            ->where('level', 3)
            ->with('children')
            ->get();
            
        $performanceData = [];
        $allSectorData = [];
        
        foreach ($sectors as $sector) {
            $schoolIds = $sector->children->pluck('id');
            
            $totalUsers = User::whereIn('institution_id', $schoolIds)->count();
            $activeUsers = User::whereIn('institution_id', $schoolIds)
                ->where('last_login_at', '>=', Carbon::now()->subDays(30))
                ->count();
            $surveys = Survey::whereHas('targeting', function($query) use ($schoolIds) {
                $query->whereIn('institution_id', $schoolIds);
            })->count();
            
            $activityRate = $totalUsers > 0 ? ($activeUsers / $totalUsers) * 100 : 0;
            
            $sectorData = [
                'id' => $sector->id,
                'name' => $sector->name,
                'schools_count' => $sector->children->count(),
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'activity_rate' => round($activityRate, 1),
                'surveys_count' => $surveys,
                'performance_score' => round(($activityRate + ($surveys > 0 ? 20 : 0)) / 2, 1)
            ];
            
            $allSectorData[] = $sectorData;
        }
        
        // Sort by performance score
        usort($allSectorData, function($a, $b) {
            return $b['performance_score'] <=> $a['performance_score'];
        });
        
        // Get top performer and attention needed
        $topPerformer = $allSectorData[0] ?? null;
        $attentionNeeded = array_filter($allSectorData, function($sector) {
            return $sector['activity_rate'] < 50;
        });
        
        return response()->json([
            'sectors_performance' => $allSectorData,
            'top_performer' => $topPerformer,
            'attention_needed' => array_values($attentionNeeded),
            'average_performance' => round(collect($allSectorData)->avg('performance_score'), 1),
            'total_institutions' => collect($allSectorData)->sum('schools_count') + count($allSectorData) // schools + sectors
        ]);
    }
}