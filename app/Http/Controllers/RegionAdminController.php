<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Institution;
use App\Models\Survey;
use App\Models\Task;
use App\Models\Notification;
use App\Models\SurveyResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RegionAdminController extends Controller
{
    /**
     * Get RegionAdmin dashboard statistics
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get user's region - assuming regionadmin is assigned to a specific region
        $userRegionId = $user->institution_id; // Region institution ID
        
        // Get all institutions in the region
        $regionInstitutions = Institution::where(function($query) use ($userRegionId) {
            $query->where('id', $userRegionId) // The region itself
                  ->orWhere('parent_id', $userRegionId); // Sectors in region
        })->get();
        
        // Get all institutions including schools under sectors
        $allRegionInstitutions = Institution::where(function($query) use ($regionInstitutions) {
            $query->whereIn('id', $regionInstitutions->pluck('id'))
                  ->orWhereIn('parent_id', $regionInstitutions->pluck('id'));
        })->get();
        
        $institutionIds = $allRegionInstitutions->pluck('id');
        
        // Count sectors and schools
        $sectors = $regionInstitutions->where('level', 3)->count(); // Sectors
        $schools = $allRegionInstitutions->where('level', 4)->count(); // Schools
        
        // Count users in region
        $totalUsers = User::whereIn('institution_id', $institutionIds)->count();
        $activeUsers = User::whereIn('institution_id', $institutionIds)
            ->where('last_login_at', '>=', Carbon::now()->subDays(30))
            ->count();
        
        // Survey statistics
        $totalSurveys = Survey::where('created_by', $user->id)
            ->orWhereHas('targeting', function($query) use ($institutionIds) {
                $query->whereIn('institution_id', $institutionIds);
            })->count();
            
        $activeSurveys = Survey::where('status', 'published')
            ->where(function($query) use ($user, $institutionIds) {
                $query->where('created_by', $user->id)
                      ->orWhereHas('targeting', function($q) use ($institutionIds) {
                          $q->whereIn('institution_id', $institutionIds);
                      });
            })->count();
            
        // Survey response rates
        $surveyResponses = SurveyResponse::whereHas('survey', function($query) use ($user, $institutionIds) {
            $query->where('created_by', $user->id)
                  ->orWhereHas('targeting', function($q) use ($institutionIds) {
                      $q->whereIn('institution_id', $institutionIds);
                  });
        })->count();
        
        // Task statistics
        $totalTasks = Task::where('created_by', $user->id)
            ->orWhereIn('assigned_to_institution', $institutionIds)
            ->count();
            
        $completedTasks = Task::where('status', 'completed')
            ->where(function($query) use ($user, $institutionIds) {
                $query->where('created_by', $user->id)
                      ->orWhereIn('assigned_to_institution', $institutionIds);
            })->count();
            
        $pendingTasks = Task::where('status', 'pending')
            ->where(function($query) use ($user, $institutionIds) {
                $query->where('created_by', $user->id)
                      ->orWhereIn('assigned_to_institution', $institutionIds);
            })->count();
        
        // Performance metrics by sector
        $sectorPerformance = Institution::where('parent_id', $userRegionId)
            ->where('level', 3)
            ->get()
            ->map(function($sector) {
                $sectorSchools = Institution::where('parent_id', $sector->id)->get();
                $schoolIds = $sectorSchools->pluck('id');
                
                $users = User::whereIn('institution_id', $schoolIds)->count();
                $surveys = Survey::whereHas('targeting', function($query) use ($schoolIds) {
                    $query->whereIn('institution_id', $schoolIds);
                })->count();
                $tasks = Task::whereIn('assigned_to_institution', $schoolIds)->count();
                $completedTasks = Task::where('status', 'completed')
                    ->whereIn('assigned_to_institution', $schoolIds)->count();
                
                return [
                    'sector_name' => $sector->name,
                    'schools_count' => $sectorSchools->count(),
                    'users_count' => $users,
                    'surveys_count' => $surveys,
                    'tasks_count' => $tasks,
                    'completion_rate' => $tasks > 0 ? round(($completedTasks / $tasks) * 100, 1) : 0
                ];
            });
        
        // Recent activities in region
        $recentActivities = collect();
        
        // Recent surveys
        $recentSurveys = Survey::where('created_by', $user->id)
            ->orWhereHas('targeting', function($query) use ($institutionIds) {
                $query->whereIn('institution_id', $institutionIds);
            })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($survey) {
                return [
                    'id' => $survey->id,
                    'type' => 'survey',
                    'action' => 'sorğu yaradıldı: ' . $survey->title,
                    'user' => $survey->creator->username ?? 'System',
                    'time' => $survey->created_at->diffForHumans(),
                    'timestamp' => $survey->created_at
                ];
            });
        
        // Recent tasks
        $recentTasks = Task::where('created_by', $user->id)
            ->orWhereIn('assigned_to_institution', $institutionIds)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($task) {
                return [
                    'id' => $task->id,
                    'type' => 'task',
                    'action' => 'tapşırıq yaradıldı: ' . $task->title,
                    'user' => $task->creator->username ?? 'System',
                    'time' => $task->created_at->diffForHumans(),
                    'timestamp' => $task->created_at
                ];
            });
        
        $recentActivities = $recentSurveys->concat($recentTasks)
            ->sortByDesc('timestamp')
            ->take(10)
            ->values();
        
        // System notifications for region
        $notifications = Notification::where('user_id', $user->id)
            ->orWhere('user_id', null) // System-wide notifications
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'is_read' => (bool) $notification->read_at,
                    'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
                    'time_ago' => $notification->created_at->diffForHumans()
                ];
            });
        
        return response()->json([
            'region_overview' => [
                'region_name' => Institution::find($userRegionId)?->name ?? 'Unknown Region',
                'total_sectors' => $sectors,
                'total_schools' => $schools,
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'user_activity_rate' => $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 1) : 0
            ],
            'survey_metrics' => [
                'total_surveys' => $totalSurveys,
                'active_surveys' => $activeSurveys,
                'total_responses' => $surveyResponses,
                'response_rate' => $totalSurveys > 0 ? round(($surveyResponses / ($totalSurveys * 10)) * 100, 1) : 0 // Assuming avg 10 responses per survey
            ],
            'task_metrics' => [
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'pending_tasks' => $pendingTasks,
                'completion_rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0
            ],
            'sector_performance' => $sectorPerformance,
            'recent_activities' => $recentActivities,
            'notifications' => $notifications,
            'user_role' => $user->getRoleNames()->first(),
            'region_id' => $userRegionId
        ]);
    }
    
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
     * Get user management statistics for RegionAdmin
     */
    public function getUserStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $userRegionId = $user->institution_id;
        
        // Get all institutions in region
        $allRegionInstitutions = Institution::where(function($query) use ($userRegionId) {
            $query->where('id', $userRegionId)
                  ->orWhere('parent_id', $userRegionId)
                  ->orWhereHas('parent', function($q) use ($userRegionId) {
                      $q->where('parent_id', $userRegionId);
                  });
        })->get();
        
        $institutionIds = $allRegionInstitutions->pluck('id');
        
        // User statistics by role
        $usersByRole = User::whereIn('institution_id', $institutionIds)
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('model_has_roles.model_type', User::class)
            ->groupBy('roles.name', 'roles.display_name')
            ->selectRaw('roles.name, roles.display_name, COUNT(*) as count')
            ->get()
            ->keyBy('name');
        
        // User statistics by institution level
        $usersByLevel = User::whereIn('institution_id', $institutionIds)
            ->join('institutions', 'users.institution_id', '=', 'institutions.id')
            ->groupBy('institutions.level')
            ->selectRaw('institutions.level, COUNT(*) as count')
            ->get()
            ->mapWithKeys(function($item) {
                $levelNames = [
                    2 => 'Regional',
                    3 => 'Sector', 
                    4 => 'School'
                ];
                return [$levelNames[$item->level] ?? 'Unknown' => $item->count];
            });
        
        // Recent user activities
        $recentUsers = User::whereIn('institution_id', $institutionIds)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->with(['institution', 'roles'])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->roles->first()?->display_name ?? 'No Role',
                    'institution' => $user->institution?->name ?? 'No Institution',
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'last_login' => $user->last_login_at ? Carbon::parse($user->last_login_at)->diffForHumans() : 'Never'
                ];
            });
        
        return response()->json([
            'users_by_role' => $usersByRole,
            'users_by_level' => $usersByLevel,
            'recent_users' => $recentUsers,
            'total_users' => User::whereIn('institution_id', $institutionIds)->count(),
            'active_users' => User::whereIn('institution_id', $institutionIds)
                ->where('last_login_at', '>=', Carbon::now()->subDays(30))
                ->count(),
            'new_users_this_month' => User::whereIn('institution_id', $institutionIds)
                ->where('created_at', '>=', Carbon::now()->startOfMonth())
                ->count()
        ]);
    }
    
    /**
     * Get survey analytics for RegionAdmin
     */
    public function getSurveyAnalytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $userRegionId = $user->institution_id;
        
        $allRegionInstitutions = Institution::where(function($query) use ($userRegionId) {
            $query->where('id', $userRegionId)
                  ->orWhere('parent_id', $userRegionId)
                  ->orWhereHas('parent', function($q) use ($userRegionId) {
                      $q->where('parent_id', $userRegionId);
                  });
        })->get();
        
        $institutionIds = $allRegionInstitutions->pluck('id');
        
        // Survey statistics
        $totalSurveys = Survey::where('created_by', $user->id)->count();
        $publishedSurveys = Survey::where('created_by', $user->id)
            ->where('status', 'published')->count();
        $draftSurveys = Survey::where('created_by', $user->id)
            ->where('status', 'draft')->count();
        
        // Response statistics
        $totalResponses = SurveyResponse::whereHas('survey', function($query) use ($user) {
            $query->where('created_by', $user->id);
        })->count();
        
        // Survey performance by sector
        $surveysBySector = Institution::where('parent_id', $userRegionId)
            ->where('level', 3)
            ->with(['children'])
            ->get()
            ->map(function($sector) use ($user) {
                $schoolIds = $sector->children->pluck('id');
                
                $surveys = Survey::where('created_by', $user->id)
                    ->whereHas('targeting', function($query) use ($schoolIds) {
                        $query->whereIn('institution_id', $schoolIds);
                    })->count();
                
                $responses = SurveyResponse::whereHas('survey', function($query) use ($user, $schoolIds) {
                    $query->where('created_by', $user->id)
                          ->whereHas('targeting', function($q) use ($schoolIds) {
                              $q->whereIn('institution_id', $schoolIds);
                          });
                })->count();
                
                return [
                    'sector_name' => $sector->name,
                    'surveys_count' => $surveys,
                    'responses_count' => $responses,
                    'response_rate' => $surveys > 0 ? round(($responses / ($surveys * 10)) * 100, 1) : 0
                ];
            });
        
        return response()->json([
            'survey_totals' => [
                'total' => $totalSurveys,
                'published' => $publishedSurveys,
                'draft' => $draftSurveys,
                'total_responses' => $totalResponses
            ],
            'surveys_by_sector' => $surveysBySector,
            'average_response_rate' => $surveysBySector->avg('response_rate') ?? 0,
            'most_active_sector' => $surveysBySector->sortByDesc('responses_count')->first()
        ]);
    }
}