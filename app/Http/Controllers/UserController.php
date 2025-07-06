<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\ActivityLog;
use App\Models\SecurityEvent;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
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
            'institution_id' => 'nullable|integer|exists:institutions,id',
            'department' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'sort_by' => 'nullable|string|in:username,email,created_at,last_login_at',
            'sort_direction' => 'nullable|string|in:asc,desc'
        ]);

        $query = User::with(['role', 'institution', 'profile']);

        // Apply filters
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhereHas('profile', function ($pq) use ($search) {
                      $pq->searchByName($search);
                  });
            });
        }

        if ($request->role) {
            $query->byRole($request->role);
        }

        if ($request->institution_id) {
            $query->byInstitution($request->institution_id);
        }

        if ($request->department) {
            $query->whereJsonContains('departments', $request->department);
        }

        if ($request->has('is_active')) {
            if ($request->is_active) {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);

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
        $user->load(['role.permissions', 'institution', 'profile']);

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
                'departments' => $request->departments ?? [],
                'is_active' => $request->is_active ?? true,
                'password_changed_at' => now(),
            ]);

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

            $user->load(['role', 'institution', 'profile']);

            DB::commit();

            // Log activity
            ActivityLog::logActivity([
                'user_id' => $request->user()->id,
                'activity_type' => 'user_create',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Created user: {$user->username}",
                'after_state' => $user->toArray(),
                'institution_id' => $request->user()->institution_id
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
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
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
                'username', 'email', 'role_id', 'institution_id', 
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

            $user->load(['role', 'institution', 'profile']);

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
     * Delete user (soft delete by deactivating)
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Cannot delete your own account'
            ], 422);
        }

        $oldData = $user->toArray();

        $user->update([
            'is_active' => false,
            'locked_until' => now()->addYears(10) // Effectively permanent lock
        ]);

        // Revoke all tokens
        $user->tokens()->delete();

        // Log activity
        ActivityLog::logActivity([
            'user_id' => $request->user()->id,
            'activity_type' => 'user_delete',
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

        return response()->json([
            'message' => 'User deactivated successfully'
        ]);
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
}