<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    /**
     * Get departments list with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'institution_id' => 'nullable|integer|exists:institutions,id',
            'parent_id' => 'nullable|integer|exists:departments,id',
            'is_active' => 'nullable|boolean',
            'sort_by' => 'nullable|string|in:name,short_name,created_at',
            'sort_direction' => 'nullable|string|in:asc,desc'
        ]);

        $query = Department::with(['institution', 'parent', 'children']);

        // Apply filters
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ILIKE', "%{$request->search}%")
                  ->orWhere('short_name', 'ILIKE', "%{$request->search}%");
            });
        }

        if ($request->institution_id) {
            $query->where('institution_id', $request->institution_id);
        }

        if ($request->has('parent_id')) {
            if ($request->parent_id) {
                $query->where('parent_department_id', $request->parent_id);
            } else {
                $query->whereNull('parent_department_id');
            }
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'name';
        $sortDirection = $request->sort_direction ?? 'asc';
        $query->orderBy($sortBy, $sortDirection);

        $departments = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'departments' => $departments->map(function ($department) {
                return $this->formatDepartment($department);
            }),
            'meta' => [
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total(),
                'from' => $departments->firstItem(),
                'to' => $departments->lastItem()
            ]
        ]);
    }

    /**
     * Get specific department
     */
    public function show(Department $department): JsonResponse
    {
        $department->load(['institution', 'parent', 'children', 'users']);

        return response()->json([
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'short_name' => $department->short_name,
                'description' => $department->description,
                'is_active' => $department->is_active,
                'institution' => $department->institution ? [
                    'id' => $department->institution->id,
                    'name' => $department->institution->name,
                    'type' => $department->institution->type
                ] : null,
                'parent' => $department->parent ? [
                    'id' => $department->parent->id,
                    'name' => $department->parent->name
                ] : null,
                'children' => $department->children->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'name' => $child->name,
                        'short_name' => $child->short_name,
                        'is_active' => $child->is_active
                    ];
                }),
                'users_count' => $department->users->count(),
                'active_users_count' => $department->users->where('is_active', true)->count(),
                'created_at' => $department->created_at,
                'updated_at' => $department->updated_at
            ]
        ]);
    }

    /**
     * Create new department
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'short_name' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'institution_id' => 'required|exists:institutions,id',
            'parent_department_id' => 'nullable|exists:departments,id',
            'is_active' => 'nullable|boolean'
        ]);

        $department = Department::create([
            'name' => $request->name,
            'short_name' => $request->short_name,
            'description' => $request->description,
            'institution_id' => $request->institution_id,
            'parent_department_id' => $request->parent_department_id,
            'is_active' => $request->is_active ?? true
        ]);

        $department->load(['institution', 'parent']);

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $this->formatDepartment($department)
        ], 201);
    }

    /**
     * Update department
     */
    public function update(Request $request, Department $department): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:100',
            'short_name' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'parent_department_id' => 'nullable|exists:departments,id',
            'is_active' => 'sometimes|boolean'
        ]);

        // Prevent self-parenting
        if ($request->parent_department_id && $request->parent_department_id == $department->id) {
            return response()->json([
                'message' => 'Department cannot be its own parent'
            ], 422);
        }

        $department->update($request->only([
            'name', 'short_name', 'description', 
            'parent_department_id', 'is_active'
        ]));

        $department->load(['institution', 'parent']);

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $this->formatDepartment($department)
        ]);
    }

    /**
     * Delete department (soft delete by deactivating)
     */
    public function destroy(Department $department): JsonResponse
    {
        // Check if department has active children
        $activeChildren = $department->children()->where('is_active', true)->count();
        if ($activeChildren > 0) {
            return response()->json([
                'message' => "Cannot delete department with {$activeChildren} active child departments"
            ], 422);
        }

        // Check if department has active users
        $activeUsers = $department->users()->where('is_active', true)->count();
        if ($activeUsers > 0) {
            return response()->json([
                'message' => "Cannot delete department with {$activeUsers} active users"
            ], 422);
        }

        $department->update(['is_active' => false]);

        return response()->json([
            'message' => 'Department deactivated successfully'
        ]);
    }

    /**
     * Format department for response
     */
    private function formatDepartment($department): array
    {
        return [
            'id' => $department->id,
            'name' => $department->name,
            'short_name' => $department->short_name,
            'description' => $department->description,
            'is_active' => $department->is_active,
            'institution_id' => $department->institution_id,
            'institution' => $department->institution ? [
                'id' => $department->institution->id,
                'name' => $department->institution->name,
                'type' => $department->institution->type
            ] : null,
            'parent' => $department->parent ? [
                'id' => $department->parent->id,
                'name' => $department->parent->name
            ] : null,
            'children_count' => $department->children ? $department->children->count() : 0,
            'created_at' => $department->created_at,
            'updated_at' => $department->updated_at
        ];
    }
}