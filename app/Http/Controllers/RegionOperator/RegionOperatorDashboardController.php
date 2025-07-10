<?php

namespace App\Http\Controllers\RegionOperator;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Institution;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class RegionOperatorDashboardController extends Controller
{
    /**
     * Get RegionOperator dashboard data
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Verify user has regionoperator role
        if (!$user->hasRole('regionoperator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Get user's department and institution
            $userDepartment = $user->department;
            $userInstitution = $user->institution;
            
            if (!$userDepartment || !$userInstitution) {
                return response()->json([
                    'message' => 'İstifadəçi departament və ya təşkilata təyin edilməyib'
                ], 400);
            }

            // Get department users count
            $departmentUsers = User::where('department_id', $userDepartment->id)
                ->where('is_active', true)
                ->count();

            // Mock task data for now (can be replaced with actual task model)
            $assignedTasks = 12;
            $completedTasks = 8;
            $pendingTasks = $assignedTasks - $completedTasks;

            // Get recent activities (mock data for now)
            $recentActivities = $this->getRecentActivities($user, $userDepartment);

            // Department information
            $departmentInfo = [
                'name' => $userDepartment->name,
                'type' => $this->getDepartmentTypeDisplay($userDepartment->department_type),
                'institution' => $userInstitution->name
            ];

            return response()->json([
                'assignedTasks' => $assignedTasks,
                'completedTasks' => $completedTasks,
                'pendingTasks' => $pendingTasks,
                'departmentUsers' => $departmentUsers,
                'departmentInfo' => $departmentInfo,
                'recentActivities' => $recentActivities
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Dashboard məlumatları yüklənə bilmədi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's tasks (mock implementation for now)
     */
    public function getUserTasks(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->hasRole('regionoperator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Mock tasks data
        $tasks = [
            [
                'id' => 1,
                'title' => 'Büdcə hesabatı hazırlama',
                'description' => 'Mart ayı üçün departament büdcə hesabatının hazırlanması',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'assigned_by' => 'Regional İdarə',
                'created_at' => Carbon::now()->subDays(2)->format('Y-m-d H:i:s')
            ],
            [
                'id' => 2,
                'title' => 'Sənəd təsdiqi',
                'description' => 'Yeni maliyyə sənədlərinin nəzərdən keçirilməsi və təsdiqi',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
                'assigned_by' => 'Departament Rəhbəri',
                'created_at' => Carbon::now()->subDays(1)->format('Y-m-d H:i:s')
            ],
            [
                'id' => 3,
                'title' => 'Kadr təyinatı',
                'description' => 'Departamentə yeni əməkdaş seçimi prosesi',
                'status' => 'completed',
                'priority' => 'medium',
                'due_date' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'assigned_by' => 'İnsan Resursları',
                'created_at' => Carbon::now()->subDays(5)->format('Y-m-d H:i:s')
            ]
        ];

        return response()->json([
            'tasks' => $tasks,
            'total' => count($tasks),
            'completed' => count(array_filter($tasks, fn($t) => $t['status'] === 'completed')),
            'pending' => count(array_filter($tasks, fn($t) => $t['status'] === 'pending')),
            'in_progress' => count(array_filter($tasks, fn($t) => $t['status'] === 'in_progress'))
        ]);
    }

    /**
     * Get department team members
     */
    public function getDepartmentTeam(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->hasRole('regionoperator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $userDepartment = $user->department;
            
            if (!$userDepartment) {
                return response()->json([
                    'message' => 'İstifadəçi departamenta təyin edilməyib'
                ], 400);
            }

            $teamMembers = User::where('department_id', $userDepartment->id)
                ->with(['roles', 'institution'])
                ->get()
                ->map(function($member) {
                    return [
                        'id' => $member->id,
                        'username' => $member->username,
                        'email' => $member->email,
                        'first_name' => $member->first_name,
                        'last_name' => $member->last_name,
                        'full_name' => trim(($member->first_name ?? '') . ' ' . ($member->last_name ?? '')) ?: $member->username,
                        'role' => $member->roles->first()?->display_name ?? 'Rol yoxdur',
                        'is_active' => $member->is_active,
                        'last_login_at' => $member->last_login_at ? 
                            Carbon::parse($member->last_login_at)->diffForHumans() : 'Heç vaxt',
                        'created_at' => $member->created_at->format('Y-m-d')
                    ];
                });

            return response()->json([
                'team_members' => $teamMembers,
                'total_members' => $teamMembers->count(),
                'active_members' => $teamMembers->where('is_active', true)->count(),
                'department' => [
                    'name' => $userDepartment->name,
                    'type' => $this->getDepartmentTypeDisplay($userDepartment->department_type)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Komanda məlumatları yüklənə bilmədi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activities for the department
     */
    private function getRecentActivities($user, $department): array
    {
        // Mock activities - this would be replaced with actual activity logging
        return [
            [
                'id' => '1',
                'type' => 'task',
                'title' => 'Büdcə hesabatı hazırlama',
                'description' => 'Aylıq büdcə hesabatının tamamlanması',
                'time' => '2 saat əvvəl',
                'status' => 'in_progress'
            ],
            [
                'id' => '2',
                'type' => 'document',
                'title' => 'Maliyyə sənədləri təsdiq',
                'description' => 'Yeni maliyyə sənədlərinin təsdiq edilməsi',
                'time' => '1 gün əvvəl',
                'status' => 'completed'
            ],
            [
                'id' => '3',
                'type' => 'meeting',
                'title' => 'Departament toplantısı',
                'description' => 'Həftəlik iş planının müzakirəsi',
                'time' => '2 gün əvvəl',
                'status' => 'completed'
            ],
            [
                'id' => '4',
                'type' => 'report',
                'title' => 'Aylıq hesabat təqdim',
                'description' => 'Fevral ayı fəaliyyət hesabatı',
                'time' => '3 gün əvvəl',
                'status' => 'completed'
            ]
        ];
    }

    /**
     * Get department type display name
     */
    private function getDepartmentTypeDisplay(string $type): string
    {
        $types = [
            'maliyyə' => 'Maliyyə Şöbəsi',
            'inzibati' => 'İnzibati Şöbəsi',
            'təsərrüfat' => 'Təsərrüfat Şöbəsi',
            'müavin' => 'Müavin Şöbəsi',
            'ubr' => 'UBR Şöbəsi',
            'psixoloq' => 'Psixoloji Dəstək Şöbəsi',
            'müəllim' => 'Fənn Müəllimləri Şöbəsi',
            'general' => 'Ümumi Şöbə',
            'other' => 'Digər'
        ];

        return $types[$type] ?? $type;
    }
}