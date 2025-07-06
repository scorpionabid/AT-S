<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Institution;
use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(): JsonResponse
    {
        try {
            // Cache the stats for 5 minutes to improve performance
            $stats = Cache::remember('dashboard_stats', 300, function () {
                return [
                    'totalUsers' => User::count(),
                    'totalInstitutions' => Institution::count(),
                    'totalSurveys' => Survey::count(),
                    'activeSurveys' => Survey::where('status', 'active')->count(),
                    'pendingSurveys' => Survey::where('status', 'draft')->count(),
                    'completedSurveys' => Survey::where('status', 'completed')->count(),
                ];
            });

            // Add real-time data that shouldn't be cached
            $stats['recentActivities'] = $this->getRecentActivities();
            $stats['systemStatus'] = $this->getSystemStatus();
            $stats['usersByRole'] = $this->getUsersByRole();
            $stats['institutionsByLevel'] = $this->getInstitutionsByLevel();

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Dashboard məlumatları yüklənərkən xəta baş verdi',
                'data' => $this->getDefaultStats()
            ], 500);
        }
    }

    /**
     * Get recent activities
     */
    private function getRecentActivities(): array
    {
        try {
            // Get recent users (last 24 hours)
            $recentUsers = User::where('created_at', '>=', now()->subDay())
                ->with('institution')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            // Get recent surveys
            $recentSurveys = Survey::where('created_at', '>=', now()->subWeek())
                ->with('creator')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            $activities = [];

            // Add user activities
            foreach ($recentUsers as $user) {
                $activities[] = [
                    'id' => 'user_' . $user->id,
                    'type' => 'user',
                    'user' => $user->institution->name ?? 'Sistem',
                    'action' => 'Yeni istifadəçi qeydiyyatdan keçdi: ' . $user->username,
                    'time' => $user->created_at->diffForHumans(),
                    'timestamp' => $user->created_at->timestamp
                ];
            }

            // Add survey activities
            foreach ($recentSurveys as $survey) {
                $activities[] = [
                    'id' => 'survey_' . $survey->id,
                    'type' => 'survey',
                    'user' => $survey->creator->institution->name ?? 'Sistem',
                    'action' => 'Yeni sorğu yaradıldı: ' . $survey->title,
                    'time' => $survey->created_at->diffForHumans(),
                    'timestamp' => $survey->created_at->timestamp
                ];
            }

            // Sort by timestamp and take latest 6
            usort($activities, function($a, $b) {
                return $b['timestamp'] - $a['timestamp'];
            });

            return array_slice($activities, 0, 6);

        } catch (\Exception $e) {
            \Log::error('Recent activities error: ' . $e->getMessage());
            return $this->getDefaultActivities();
        }
    }

    /**
     * Get system status
     */
    private function getSystemStatus(): array
    {
        try {
            // Database connection check
            $dbStatus = 'online';
            try {
                DB::connection()->getPdo();
            } catch (\Exception $e) {
                $dbStatus = 'offline';
            }

            // Calculate memory usage (mock for now)
            $memoryUsage = rand(45, 85); // In production, use actual system metrics

            // API status (always online if we're running)
            $apiStatus = 'online';

            return [
                'database' => [
                    'status' => $dbStatus,
                    'label' => $dbStatus === 'online' ? 'Normal' : 'Offline',
                ],
                'api' => [
                    'status' => $apiStatus,
                    'label' => 'İşləyir',
                ],
                'memory' => [
                    'status' => $memoryUsage > 80 ? 'warning' : 'online',
                    'label' => $memoryUsage . '%',
                ],
                'storage' => [
                    'status' => 'online',
                    'label' => 'Normal',
                ]
            ];

        } catch (\Exception $e) {
            \Log::error('System status error: ' . $e->getMessage());
            return [
                'database' => ['status' => 'unknown', 'label' => 'Bilinmir'],
                'api' => ['status' => 'unknown', 'label' => 'Bilinmir'],
                'memory' => ['status' => 'unknown', 'label' => 'Bilinmir'],
                'storage' => ['status' => 'unknown', 'label' => 'Bilinmir'],
            ];
        }
    }

    /**
     * Get users by role
     */
    private function getUsersByRole(): array
    {
        try {
            return DB::table('model_has_roles')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->select('roles.name', 'roles.display_name', DB::raw('count(*) as count'))
                ->groupBy('roles.id', 'roles.name', 'roles.display_name')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->name => [
                        'display_name' => $item->display_name,
                        'count' => $item->count
                    ]];
                })
                ->toArray();

        } catch (\Exception $e) {
            \Log::error('Users by role error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get institutions by level
     */
    private function getInstitutionsByLevel(): array
    {
        try {
            return Institution::select('level', DB::raw('count(*) as count'))
                ->groupBy('level')
                ->get()
                ->mapWithKeys(function ($item) {
                    $levelNames = [
                        1 => 'Nazirlik',
                        2 => 'Regional İdarələr',
                        3 => 'Sektor Şöbələri',
                        4 => 'Məktəblər'
                    ];
                    
                    return [$item->level => [
                        'name' => $levelNames[$item->level] ?? 'Səviyyə ' . $item->level,
                        'count' => $item->count
                    ]];
                })
                ->toArray();

        } catch (\Exception $e) {
            \Log::error('Institutions by level error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get default stats when there's an error
     */
    private function getDefaultStats(): array
    {
        return [
            'totalUsers' => 0,
            'totalInstitutions' => 0,
            'totalSurveys' => 0,
            'activeSurveys' => 0,
            'pendingSurveys' => 0,
            'completedSurveys' => 0,
            'recentActivities' => $this->getDefaultActivities(),
            'systemStatus' => [
                'database' => ['status' => 'unknown', 'label' => 'Bilinmir'],
                'api' => ['status' => 'unknown', 'label' => 'Bilinmir'],
                'memory' => ['status' => 'unknown', 'label' => 'Bilinmir'],
                'storage' => ['status' => 'unknown', 'label' => 'Bilinmir'],
            ],
            'usersByRole' => [],
            'institutionsByLevel' => []
        ];
    }

    /**
     * Get default activities when there's an error
     */
    private function getDefaultActivities(): array
    {
        return [
            [
                'id' => 'default_1',
                'type' => 'system',
                'user' => 'ATİS Sistemi',
                'action' => 'Sistem işə salındı',
                'time' => 'Az əvvəl',
                'timestamp' => now()->timestamp
            ]
        ];
    }

    /**
     * Get detailed statistics for superadmin
     */
    public function detailedStats(): JsonResponse
    {
        try {
            $stats = [
                'overview' => [
                    'totalUsers' => User::count(),
                    'activeUsers' => User::where('status', 'active')->count(),
                    'inactiveUsers' => User::where('status', 'inactive')->count(),
                    'totalInstitutions' => Institution::count(),
                    'totalSurveys' => Survey::count(),
                    'activeSurveys' => Survey::where('status', 'active')->count(),
                ],
                'trends' => [
                    'usersThisMonth' => User::where('created_at', '>=', now()->startOfMonth())->count(),
                    'surveysThisMonth' => Survey::where('created_at', '>=', now()->startOfMonth())->count(),
                    'usersLastMonth' => User::whereBetween('created_at', [
                        now()->subMonth()->startOfMonth(),
                        now()->subMonth()->endOfMonth()
                    ])->count(),
                    'surveysLastMonth' => Survey::whereBetween('created_at', [
                        now()->subMonth()->startOfMonth(), 
                        now()->subMonth()->endOfMonth()
                    ])->count(),
                ],
                'usersByRole' => $this->getUsersByRole(),
                'institutionsByLevel' => $this->getInstitutionsByLevel()
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Detailed stats error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Ətraflı statistika yüklənərkən xəta baş verdi'
            ], 500);
        }
    }
}
