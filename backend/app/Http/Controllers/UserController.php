<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\ActivityLog;
use App\Models\SecurityEvent;
use App\Models\Role;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Get users list with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'role' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
            'institution' => 'nullable|integer|exists:institutions,id',
            'institution_id' => 'nullable|integer|exists:institutions,id',
            'department' => 'nullable|string',
            'sort' => 'nullable|string|in:username,email,created_at,last_login_at',
            'order' => 'nullable|string|in:asc,desc',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date',
            'last_login_from' => 'nullable|date',
            'last_login_to' => 'nullable|date'
        ]);

        $query = User::with(['role', 'institution', 'profile']);

        // Apply filters
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%")
                  ->orWhereHas('profile', function ($pq) use ($search) {
                      $pq->where('first_name', 'ILIKE', "%{$search}%")
                         ->orWhere('last_name', 'ILIKE', "%{$search}%");
                  })
                  ->orWhereHas('institution', function ($iq) use ($search) {
                      $iq->where('name', 'ILIKE', "%{$search}%");
                  });
            });
        }

        if ($request->role) {
            $query->whereHas('role', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        if ($request->status === 'active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($request->institution || $request->institution_id) {
            $institutionId = $request->institution ?? $request->institution_id;
            $query->where('institution_id', $institutionId);
        }

        if ($request->department) {
            $query->whereJsonContains('departments', $request->department);
        }

        // Date range filters
        if ($request->created_from) {
            $query->whereDate('created_at', '>=', $request->created_from);
        }
        if ($request->created_to) {
            $query->whereDate('created_at', '<=', $request->created_to);
        }
        if ($request->last_login_from) {
            $query->whereDate('last_login_at', '>=', $request->last_login_from);
        }
        if ($request->last_login_to) {
            $query->whereDate('last_login_at', '<=', $request->last_login_to);
        }

        // Apply sorting
        $sortBy = $request->sort ?? 'username';
        $sortDirection = $request->order ?? 'asc';
        $allowedSorts = ['username', 'email', 'created_at', 'last_login_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $users = $query->paginate($request->per_page ?? 15);

        // Log activity
        ActivityLog::logActivity([
            'user_id' => $request->user()->id,
            'activity_type' => 'users_list',
            'description' => 'Accessed users list',
            'properties' => [
                'filters' => $request->only(['search', 'role', 'institution_id', 'department', 'is_active']),
                'pagination' => [
                    'per_page' => $request->per_page ?? 15,
                    'page' => $request->page ?? 1
                ]
            ],
            'institution_id' => $request->user()->institution_id
        ]);

        return response()->json([
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => [
                        'id' => $user->role?->id,
                        'name' => $user->role?->name,
                        'display_name' => $user->role?->display_name,
                        'level' => $user->role?->level
                    ],
                    'institution' => [
                        'id' => $user->institution?->id,
                        'name' => $user->institution?->name,
                        'type' => $user->institution?->type
                    ],
                    'departments' => $user->departments,
                    'is_active' => $user->is_active,
                    'last_login_at' => $user->last_login_at,
                    'created_at' => $user->created_at,
                    'profile' => $user->profile ? [
                        'first_name' => $user->profile->first_name,
                        'last_name' => $user->profile->last_name,
                        'full_name' => $user->profile->full_name,
                        'contact_phone' => $user->profile->contact_phone
                    ] : null
                ];
            }),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem()
            ]
        ]);
    }

    /**
     * Get specific user
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $user->load(['role.permissions', 'institution', 'department', 'profile']);

        // Log activity
        ActivityLog::logActivity([
            'user_id' => $request->user()->id,
            'activity_type' => 'user_view',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Viewed user: {$user->username}",
            'institution_id' => $request->user()->institution_id
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role?->id,
                'institution_id' => $user->institution?->id,
                'department_id' => $user->department?->id,
                'departments' => $user->departments ?? [],
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at,
                'password_changed_at' => $user->password_changed_at,
                'failed_login_attempts' => $user->failed_login_attempts,
                'locked_until' => $user->locked_until,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'first_name' => $user->profile?->first_name,
                'last_name' => $user->profile?->last_name,
                'patronymic' => $user->profile?->patronymic,
                'birth_date' => $user->profile?->birth_date,
                'gender' => $user->profile?->gender,
                'contact_phone' => $user->profile?->contact_phone,
                'role' => [
                    'id' => $user->role?->id,
                    'name' => $user->role?->name,
                    'display_name' => $user->role?->display_name,
                    'level' => $user->role?->level,
                    'department_access' => $user->role?->department_access
                ],
                'institution' => [
                    'id' => $user->institution?->id,
                    'name' => $user->institution?->name,
                    'type' => $user->institution?->type,
                    'level' => $user->institution?->level
                ],
                'department' => [
                    'id' => $user->department?->id,
                    'name' => $user->department?->name,
                    'department_type' => $user->department?->department_type
                ]
            ],
            'permissions' => $user->role?->permissions->pluck('name') ?? []
        ]);
    }

    /**
     * Create new user
     */
    public function store(StoreUserRequest $request): JsonResponse
    {

        try {
            DB::beginTransaction();

            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $request->role_id,
                'institution_id' => $request->institution_id,
                'department_id' => $request->department_id,
                'departments' => $request->departments ?? [],
                'is_active' => $request->is_active ?? true,
                'password_changed_at' => now(),
            ]);

            // Assign role using Spatie's role management
            $role = Role::find($request->role_id);
            if ($role) {
                $user->assignRole($role->name);
                
                // Log role assignment
                Log::info("Assigned role {$role->name} to user {$user->id}");
            } else {
                Log::warning("Role not found for ID: " . $request->role_id);
            }

            // Create profile if profile data provided
            if ($request->hasAny(['first_name', 'last_name', 'patronymic', 'birth_date', 'gender', 'national_id', 'contact_phone', 'emergency_contact', 'address'])) {
                UserProfile::create([
                    'user_id' => $user->id,
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'patronymic' => $request->patronymic,
                    'birth_date' => $request->birth_date,
                    'gender' => $request->gender,
                    'national_id' => $request->national_id,
                    'contact_phone' => $request->contact_phone,
                    'emergency_contact' => $request->emergency_contact,
                    'address' => $request->address ?? []
                ]);
            }

            $user->load(['role', 'institution', 'department', 'profile']);

            DB::commit();

            // Log activity
            $activityData = [
                'user_id' => $request->user()->id,
                'activity_type' => 'user_create',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Created user: {$user->username} with role: " . ($role->name ?? 'none'),
                'after_state' => $user->toArray(),
                'institution_id' => $request->user()->institution_id
            ];

            ActivityLog::logActivity($activityData);
            
            Log::info('User created successfully', [
                'user_id' => $user->id,
                'role_assigned' => $role->name ?? null,
                'assigned_by' => $request->user()->id
            ]);

            SecurityEvent::logEvent([
                'event_type' => 'user_created',
                'severity' => 'info',
                'user_id' => $request->user()->id,
                'target_user_id' => $user->id,
                'description' => 'New user created by admin',
                'event_data' => [
                    'created_username' => $user->username,
                    'role' => $user->role?->name,
                    'institution_id' => $user->institution_id
                ]
            ]);

            return response()->json([
                'message' => 'User created successfully',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'department_id' => $user->department?->id,
                    'role' => [
                        'id' => $user->role?->id,
                        'name' => $user->role?->name,
                        'display_name' => $user->role?->display_name
                    ],
                    'institution' => [
                        'id' => $user->institution?->id,
                        'name' => $user->institution?->name,
                        'type' => $user->institution?->type
                    ],
                    'department' => [
                        'id' => $user->department?->id,
                        'name' => $user->department?->name,
                        'department_type' => $user->department?->department_type
                    ],
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('User creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);
            
            return response()->json([
                'message' => 'User creation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {

        try {
            DB::beginTransaction();

            $oldData = $user->toArray();

            $updateData = $request->only([
                'username', 'email', 'role_id', 'institution_id', 'department_id',
                'departments', 'is_active'
            ]);

            // Handle password update if provided
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
                $updateData['password_changed_at'] = now();
            }

            $user->update($updateData);

            // Update or create profile
            if ($request->hasAny(['first_name', 'last_name', 'patronymic', 'birth_date', 'gender', 'national_id', 'contact_phone', 'emergency_contact', 'address'])) {
                $profileData = array_filter($request->only([
                    'first_name', 'last_name', 'patronymic', 'birth_date', 
                    'gender', 'national_id', 'contact_phone', 'emergency_contact', 'address'
                ]), fn($value) => $value !== null);

                if ($user->profile) {
                    $user->profile->update($profileData);
                } else {
                    UserProfile::create(array_merge(['user_id' => $user->id], $profileData));
                }
            }

            $user->load(['role', 'institution', 'department', 'profile']);

            DB::commit();

            // Log activity
            ActivityLog::logActivity([
                'user_id' => $request->user()->id,
                'activity_type' => 'user_update',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Updated user: {$user->username}",
                'before_state' => $oldData,
                'after_state' => $user->toArray(),
                'institution_id' => $request->user()->institution_id
            ]);

            // Log role change if role was updated
            if ($request->has('role_id') && $oldData['role_id'] !== $user->role_id) {
                SecurityEvent::logEvent([
                    'event_type' => 'role_change',
                    'severity' => 'warning',
                    'user_id' => $request->user()->id,
                    'target_user_id' => $user->id,
                    'description' => 'User role changed',
                    'event_data' => [
                        'username' => $user->username,
                        'old_role_id' => $oldData['role_id'],
                        'new_role_id' => $user->role_id
                    ]
                ]);
            }

            return response()->json([
                'message' => 'User updated successfully',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'department_id' => $user->department?->id,
                    'role' => [
                        'id' => $user->role?->id,
                        'name' => $user->role?->name,
                        'display_name' => $user->role?->display_name
                    ],
                    'institution' => [
                        'id' => $user->institution?->id,
                        'name' => $user->institution?->name,
                        'type' => $user->institution?->type
                    ],
                    'department' => [
                        'id' => $user->department?->id,
                        'name' => $user->department?->name,
                        'department_type' => $user->department?->department_type
                    ],
                    'is_active' => $user->is_active,
                    'updated_at' => $user->updated_at
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'User update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user (soft delete by deactivating or hard delete by removal)
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Cannot delete your own account'
            ], 422);
        }

        $deleteType = $request->query('type', 'soft');
        $oldData = $user->toArray();

        try {
            DB::beginTransaction();

            if ($deleteType === 'hard') {
                // Hard delete - permanently remove user
                // Revoke all tokens first
                $user->tokens()->delete();

                // Delete user profile if exists
                if ($user->profile) {
                    $user->profile->delete();
                }

                // Delete user permanently
                $user->delete();

                // Log activity for hard delete
                ActivityLog::logActivity([
                    'user_id' => $request->user()->id,
                    'activity_type' => 'user_hard_delete',
                    'entity_type' => 'User',
                    'entity_id' => $user->id,
                    'description' => "Permanently deleted user: {$user->username}",
                    'before_state' => $oldData,
                    'institution_id' => $request->user()->institution_id
                ]);

                SecurityEvent::logEvent([
                    'event_type' => 'user_hard_deleted',
                    'severity' => 'high',
                    'user_id' => $request->user()->id,
                    'target_user_id' => $user->id,
                    'description' => 'User account permanently deleted',
                    'event_data' => [
                        'deleted_username' => $user->username
                    ]
                ]);

                $message = 'User permanently deleted successfully';
            } else {
                // Soft delete - deactivate user
                $user->update([
                    'is_active' => false,
                    'locked_until' => now()->addYears(10), // Effectively permanent lock
                    'deleted_at' => now()
                ]);

                // Revoke all tokens
                $user->tokens()->delete();

                // Log activity for soft delete
                ActivityLog::logActivity([
                    'user_id' => $request->user()->id,
                    'activity_type' => 'user_soft_delete',
                    'entity_type' => 'User',
                    'entity_id' => $user->id,
                    'description' => "Deactivated user: {$user->username}",
                    'before_state' => $oldData,
                    'after_state' => $user->toArray(),
                    'institution_id' => $request->user()->institution_id
                ]);

                SecurityEvent::logEvent([
                    'event_type' => 'user_deactivated',
                    'severity' => 'warning',
                    'user_id' => $request->user()->id,
                    'target_user_id' => $user->id,
                    'description' => 'User account deactivated',
                    'event_data' => [
                        'deactivated_username' => $user->username
                    ]
                ]);

                $message = 'User deactivated successfully';
            }

            DB::commit();

            return response()->json([
                'message' => $message
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'User deletion failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset user password
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'new_password' => 'required|string|min:8',
        ]);

        $oldData = $user->toArray();

        $user->update([
            'password' => Hash::make($request->new_password),
            'password_changed_at' => now(),
            'failed_login_attempts' => 0,
            'locked_until' => null
        ]);

        // Revoke all user tokens to force re-login
        $user->tokens()->delete();

        // Log activity
        ActivityLog::logActivity([
            'user_id' => $request->user()->id,
            'activity_type' => 'password_reset',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Reset password for user: {$user->username}",
            'institution_id' => $request->user()->institution_id
        ]);

        SecurityEvent::logEvent([
            'event_type' => 'password_reset_by_admin',
            'severity' => 'warning',
            'user_id' => $request->user()->id,
            'target_user_id' => $user->id,
            'description' => 'Password reset by administrator',
            'event_data' => [
                'target_username' => $user->username
            ]
        ]);

        return response()->json([
            'message' => 'Password reset successfully'
        ]);
    }

    /**
     * Toggle user active status
     */
    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Cannot modify your own account status'
            ], 422);
        }

        $oldStatus = $user->is_active;
        $user->update([
            'is_active' => !$user->is_active,
            'locked_until' => $user->is_active ? null : now()->addYears(10)
        ]);

        // Revoke tokens if deactivating
        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        // Log activity
        ActivityLog::logActivity([
            'user_id' => $request->user()->id,
            'activity_type' => 'user_status_toggle',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => $user->is_active ? "Activated user: {$user->username}" : "Deactivated user: {$user->username}",
            'institution_id' => $request->user()->institution_id
        ]);

        SecurityEvent::logEvent([
            'event_type' => $user->is_active ? 'user_activated' : 'user_deactivated',
            'severity' => 'info',
            'user_id' => $request->user()->id,
            'target_user_id' => $user->id,
            'description' => $user->is_active ? 'User account activated' : 'User account deactivated',
            'event_data' => [
                'target_username' => $user->username,
                'old_status' => $oldStatus,
                'new_status' => $user->is_active
            ]
        ]);

        return response()->json([
            'message' => $user->is_active ? 'User activated successfully' : 'User deactivated successfully',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'is_active' => $user->is_active
            ]
        ]);
    }

    /**
     * Bulk operations for users
     */
    public function bulkActivate(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array|min:1|max:100',
            'user_ids.*' => 'integer|exists:users,id'
        ]);

        try {
            DB::beginTransaction();

            $users = User::whereIn('id', $request->user_ids)->get();
            $updatedCount = 0;

            foreach ($users as $user) {
                if (!$user->is_active) {
                    $user->update(['is_active' => true]);
                    $updatedCount++;

                    // Log security event
                    SecurityEvent::logEvent([
                        'event_type' => 'bulk_user_activated',
                        'severity' => 'info',
                        'user_id' => $request->user()->id,
                        'target_user_id' => $user->id,
                        'description' => 'User activated via bulk operation',
                        'event_data' => [
                            'target_username' => $user->username,
                            'bulk_operation' => true
                        ]
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => "{$updatedCount} istifadəçi uğurla aktivləşdirildi",
                'updated_count' => $updatedCount,
                'total_requested' => count($request->user_ids)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Bulk aktivləşdirmə zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkDeactivate(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array|min:1|max:100',
            'user_ids.*' => 'integer|exists:users,id'
        ]);

        try {
            DB::beginTransaction();

            // Prevent deactivating current user
            if (in_array($request->user()->id, $request->user_ids)) {
                return response()->json([
                    'message' => 'Öz hesabınızı deaktiv edə bilməzsiniz'
                ], 422);
            }

            $users = User::whereIn('id', $request->user_ids)->get();
            $updatedCount = 0;

            foreach ($users as $user) {
                if ($user->is_active) {
                    $user->update(['is_active' => false]);
                    $updatedCount++;

                    // Log security event
                    SecurityEvent::logEvent([
                        'event_type' => 'bulk_user_deactivated',
                        'severity' => 'warning',
                        'user_id' => $request->user()->id,
                        'target_user_id' => $user->id,
                        'description' => 'User deactivated via bulk operation',
                        'event_data' => [
                            'target_username' => $user->username,
                            'bulk_operation' => true
                        ]
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => "{$updatedCount} istifadəçi uğurla deaktiv edildi",
                'updated_count' => $updatedCount,
                'total_requested' => count($request->user_ids)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Bulk deaktiv etmə zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkAssignRole(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array|min:1|max:100',
            'user_ids.*' => 'integer|exists:users,id',
            'role_id' => 'required|integer|exists:roles,id'
        ]);

        try {
            DB::beginTransaction();

            $users = User::whereIn('id', $request->user_ids)->get();
            $updatedCount = 0;

            foreach ($users as $user) {
                if ($user->role_id !== $request->role_id) {
                    $oldRole = $user->role?->name;
                    $user->update(['role_id' => $request->role_id]);
                    $newRole = $user->fresh()->role?->name;
                    $updatedCount++;

                    // Log security event
                    SecurityEvent::logEvent([
                        'event_type' => 'bulk_role_assigned',
                        'severity' => 'info',
                        'user_id' => $request->user()->id,
                        'target_user_id' => $user->id,
                        'description' => 'User role changed via bulk operation',
                        'event_data' => [
                            'target_username' => $user->username,
                            'old_role' => $oldRole,
                            'new_role' => $newRole,
                            'bulk_operation' => true
                        ]
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => "{$updatedCount} istifadəçiyə rol təyin edildi",
                'updated_count' => $updatedCount,
                'total_requested' => count($request->user_ids)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Bulk rol təyinatı zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkAssignInstitution(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array|min:1|max:100',
            'user_ids.*' => 'integer|exists:users,id',
            'institution_id' => 'required|integer|exists:institutions,id'
        ]);

        try {
            DB::beginTransaction();

            $users = User::whereIn('id', $request->user_ids)->get();
            $updatedCount = 0;

            foreach ($users as $user) {
                if ($user->institution_id !== $request->institution_id) {
                    $user->update(['institution_id' => $request->institution_id]);
                    $updatedCount++;

                    // Log security event
                    SecurityEvent::logEvent([
                        'event_type' => 'bulk_institution_assigned',
                        'severity' => 'info',
                        'user_id' => $request->user()->id,
                        'target_user_id' => $user->id,
                        'description' => 'User institution changed via bulk operation',
                        'event_data' => [
                            'target_username' => $user->username,
                            'new_institution_id' => $request->institution_id,
                            'bulk_operation' => true
                        ]
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => "{$updatedCount} istifadəçiyə təşkilat təyin edildi",
                'updated_count' => $updatedCount,
                'total_requested' => count($request->user_ids)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Bulk təşkilat təyinatı zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array|min:1|max:50', // Smaller limit for safety
            'user_ids.*' => 'integer|exists:users,id',
            'confirm' => 'required|boolean|accepted' // Extra confirmation required
        ]);

        try {
            DB::beginTransaction();

            // Prevent deleting current user
            if (in_array($request->user()->id, $request->user_ids)) {
                return response()->json([
                    'message' => 'Öz hesabınızı silə bilməzsiniz'
                ], 422);
            }

            // Prevent deleting SuperAdmins
            $superAdmins = User::whereIn('id', $request->user_ids)
                ->whereHas('role', function ($q) {
                    $q->where('name', 'superadmin');
                })->count();

            if ($superAdmins > 0) {
                return response()->json([
                    'message' => 'SuperAdmin hesablarını silə bilməzsiniz'
                ], 422);
            }

            $users = User::whereIn('id', $request->user_ids)->get();
            $deletedCount = 0;

            foreach ($users as $user) {
                // Log before deletion
                SecurityEvent::logEvent([
                    'event_type' => 'bulk_user_deleted',
                    'severity' => 'critical',
                    'user_id' => $request->user()->id,
                    'target_user_id' => $user->id,
                    'description' => 'User permanently deleted via bulk operation',
                    'event_data' => [
                        'target_username' => $user->username,
                        'target_email' => $user->email,
                        'bulk_operation' => true
                    ]
                ]);

                $user->delete();
                $deletedCount++;
            }

            DB::commit();

            return response()->json([
                'message' => "{$deletedCount} istifadəçi uğurla silindi",
                'deleted_count' => $deletedCount,
                'total_requested' => count($request->user_ids)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Bulk silmə zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function exportUsers(Request $request): JsonResponse
    {
        $request->validate([
            'format' => 'required|string|in:csv,json',
            'filters' => 'nullable|array',
            'include_profiles' => 'nullable|boolean'
        ]);

        try {
            $query = User::with(['role', 'institution']);
            
            if ($request->include_profiles) {
                $query->with('profile');
            }

            // Apply filters if provided
            if ($request->filters) {
                if (isset($request->filters['role'])) {
                    $query->byRole($request->filters['role']);
                }
                if (isset($request->filters['institution_id'])) {
                    $query->where('institution_id', $request->filters['institution_id']);
                }
                if (isset($request->filters['is_active'])) {
                    $query->where('is_active', $request->filters['is_active']);
                }
            }

            $users = $query->get();

            $exportData = $users->map(function ($user) use ($request) {
                $data = [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'institution' => $user->institution?->name,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at?->toDateTimeString(),
                    'last_login_at' => $user->last_login_at?->toDateTimeString()
                ];

                if ($request->include_profiles && $user->profile) {
                    $data = array_merge($data, [
                        'first_name' => $user->profile->first_name,
                        'last_name' => $user->profile->last_name,
                        'contact_phone' => $user->profile->contact_phone
                    ]);
                }

                return $data;
            });

            // Log export activity
            ActivityLog::logActivity([
                'user_id' => $request->user()->id,
                'activity_type' => 'users_export',
                'entity_type' => 'User',
                'description' => "Exported {$users->count()} users in {$request->format} format",
                'event_data' => [
                    'format' => $request->format,
                    'count' => $users->count(),
                    'include_profiles' => $request->include_profiles ?? false
                ]
            ]);

            return response()->json([
                'message' => 'İstifadəçilər uğurla export edildi',
                'format' => $request->format,
                'count' => $users->count(),
                'data' => $exportData,
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Export zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bulk operation statistics
     */
    public function getBulkStatistics(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'by_role' => User::join('roles', 'users.role_id', '=', 'roles.id')
                    ->selectRaw('roles.name as role, COUNT(*) as count')
                    ->groupBy('roles.name')
                    ->pluck('count', 'role')
                    ->toArray(),
                'by_institution' => User::join('institutions', 'users.institution_id', '=', 'institutions.id')
                    ->selectRaw('institutions.name as institution, COUNT(*) as count')
                    ->groupBy('institutions.name')
                    ->orderBy('count', 'desc')
                    ->take(10)
                    ->pluck('count', 'institution')
                    ->toArray(),
                'recent_activity' => [
                    'today' => User::whereDate('created_at', today())->count(),
                    'this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
                    'this_month' => User::where('created_at', '>=', now()->startOfMonth())->count()
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Statistika yüklənərkən xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available institutions for user selection
     */
    public function getAvailableInstitutions(Request $request): JsonResponse
    {
        try {
            $institutions = \App\Models\Institution::select(['id', 'name', 'type', 'level'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            return response()->json([
                'institutions' => $institutions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Təşkilatlar yüklənərkən xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}