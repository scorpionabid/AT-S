<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * Get roles list
     */
    public function index(Request $request): JsonResponse
    {
        $guard = $request->get('guard', 'api');
        $roles = Role::with('permissions')->where('guard_name', $guard)->get();

        return response()->json([
            'roles' => $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name ?? $role->name,
                    'description' => $role->description,
                    'level' => $role->level ?? 1,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->pluck('name'),
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at
                ];
            })
        ]);
    }

    /**
     * Get specific role
     */
    public function show(Role $role): JsonResponse
    {
        $role->load('permissions');

        return response()->json([
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?? $role->name,
                'description' => $role->description,
                'level' => $role->level ?? 1,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->pluck('name'),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at
            ]
        ]);
    }

    /**
     * Create new role
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'display_name' => 'nullable|string',
            'description' => 'nullable|string',
            'level' => 'nullable|integer|min:1|max:10',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        $role = Role::create([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'description' => $request->description,
            'level' => $request->level ?? 1,
            'guard_name' => 'api' // Use API guard for consistency
        ]);

        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json([
            'message' => 'Role created successfully',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?? $role->name,
                'description' => $role->description,
                'level' => $role->level ?? 1,
                'permissions' => $role->permissions->pluck('name')
            ]
        ], 201);
    }

    /**
     * Update role
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'display_name' => 'nullable|string',
            'description' => 'nullable|string',
            'level' => 'nullable|integer|min:1|max:10',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        $role->update($request->only(['display_name', 'description', 'level']));

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?? $role->name,
                'permissions' => $role->permissions->pluck('name')
            ]
        ]);
    }

    /**
     * Delete role
     */
    public function destroy(Role $role): JsonResponse
    {
        // Prevent deletion of system roles
        $systemRoles = ['superadmin', 'regionadmin', 'schooladmin', 'müəllim'];
        
        if (in_array($role->name, $systemRoles)) {
            return response()->json([
                'message' => 'Cannot delete system roles'
            ], 422);
        }

        // Check if role is assigned to users
        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete role that is assigned to users'
            ], 422);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully'
        ]);
    }

    /**
     * Get all permissions
     */
    public function permissions(Request $request): JsonResponse
    {
        $guard = $request->get('guard', 'api');
        $permissions = Permission::where('guard_name', $guard)->get();

        return response()->json([
            'permissions' => $permissions->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'guard_name' => $permission->guard_name,
                    'created_at' => $permission->created_at,
                    'updated_at' => $permission->updated_at
                ];
            })
        ]);
    }
}