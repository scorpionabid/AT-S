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
            'department_type' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'hierarchy' => 'nullable|boolean',
            'sort_by' => 'nullable|string|in:name,short_name,department_type,created_at',
            'sort_direction' => 'nullable|string|in:asc,desc'
        ]);

        $query = Department::with(['institution', 'parent', 'children']);

        // Apply filters
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                  ->orWhere('short_name', 'LIKE', "%{$request->search}%");
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

        if ($request->department_type) {
            $query->where('department_type', $request->department_type);
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'name';
        $sortDirection = $request->sort_direction ?? 'asc';
        $query->orderBy($sortBy, $sortDirection);

        // Return as hierarchy or paginated list
        if ($request->hierarchy && !$request->parent_id) {
            $departments = $query->roots()->get();
            $this->loadDepartmentHierarchy($departments);
            
            return response()->json([
                'departments' => $departments->map(function ($department) {
                    return $this->formatDepartmentWithChildren($department);
                })
            ]);
        } else {
            $departments = $query->paginate($request->per_page ?? 15);
        }

        return response()->json([
            'data' => $departments->map(function ($department) {
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
            'id' => $department->id,
            'name' => $department->name,
            'short_name' => $department->short_name,
            'department_type' => $department->department_type,
            'institution_id' => $department->institution_id,
            'description' => $department->description,
            'capacity' => $department->capacity,
            'budget_allocation' => $department->budget_allocation,
            'functional_scope' => $department->functional_scope,
            'metadata' => $department->metadata,
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
        ]);
    }

    /**
     * Create new department
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:100',
            'short_name' => 'nullable|string|max:20',
            'department_type' => 'required|string|max:50',
            'description' => 'nullable|string|max:500',
            'institution_id' => 'required|exists:institutions,id',
            'parent_department_id' => 'nullable|exists:departments,id',
            'metadata' => 'nullable|array',
            'capacity' => 'nullable|integer|min:1|max:1000',
            'budget_allocation' => 'nullable|numeric|min:0',
            'functional_scope' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean'
        ]);

        // Validate department type against institution type
        $institution = \App\Models\Institution::find($request->institution_id);
        $allowedTypes = Department::getAllowedTypesForInstitution($institution->type);
        
        if (!in_array($request->department_type, $allowedTypes)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'department_type' => ['Department type not allowed for this institution type.']
                ]
            ], 422);
        }

        // Check institution access for non-superadmin users
        if (!auth()->user()->hasRole('superadmin')) {
            $userInstitution = auth()->user()->institution;
            if (!$userInstitution) {
                return response()->json(['message' => 'User not assigned to any institution'], 403);
            }

            // Get all accessible institution IDs (user's institution and its children)
            $accessibleInstitutions = $userInstitution->getAllChildrenIds();
            
            if (!in_array($request->institution_id, $accessibleInstitutions)) {
                return response()->json(['message' => 'Access denied to this institution'], 403);
            }
        }

        $department = Department::create([
            'name' => $validatedData['name'],
            'short_name' => $validatedData['short_name'] ?? null,
            'department_type' => $validatedData['department_type'],
            'description' => $validatedData['description'] ?? null,
            'institution_id' => $validatedData['institution_id'],
            'parent_department_id' => $validatedData['parent_department_id'] ?? null,
            'metadata' => $validatedData['metadata'] ?? [],
            'capacity' => $validatedData['capacity'] ?? null,
            'budget_allocation' => $validatedData['budget_allocation'] ?? null,
            'functional_scope' => $validatedData['functional_scope'] ?? null,
            'is_active' => $validatedData['is_active'] ?? true
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
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:100',
            'short_name' => 'nullable|string|max:20',
            'department_type' => 'sometimes|string|max:50',
            'description' => 'nullable|string|max:500',
            'parent_department_id' => 'nullable|exists:departments,id',
            'metadata' => 'nullable|array',
            'capacity' => 'nullable|integer|min:1|max:1000',
            'budget_allocation' => 'nullable|numeric|min:0',
            'functional_scope' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean'
        ]);

        // Prevent self-parenting
        if ($request->parent_department_id && $request->parent_department_id == $department->id) {
            return response()->json([
                'message' => 'Department cannot be its own parent'
            ], 422);
        }

        // Validate department type if provided
        if ($request->has('department_type')) {
            $allowedTypes = Department::getAllowedTypesForInstitution($department->institution->type);
            if (!in_array($request->department_type, $allowedTypes)) {
                return response()->json([
                    'message' => 'Department type not allowed for this institution type',
                    'allowed_types' => $allowedTypes
                ], 422);
            }
        }

        $department->update($validatedData);

        $department->load(['institution', 'parent']);

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $this->formatDepartment($department)
        ]);
    }

    /**
     * Delete department (soft delete by deactivating or hard delete by removal)
     */
    public function destroy(Request $request, Department $department): JsonResponse
    {
        // Check institution access for non-superadmin users
        if (!auth()->user()->hasRole('superadmin')) {
            $userInstitution = auth()->user()->institution;
            if (!$userInstitution) {
                return response()->json(['message' => 'User not assigned to any institution'], 403);
            }

            // Get all accessible institution IDs (user's institution and its children)
            $accessibleInstitutions = $userInstitution->getAllChildrenIds();
            
            if (!in_array($department->institution_id, $accessibleInstitutions)) {
                return response()->json(['message' => 'Access denied to this institution'], 403);
            }
        }

        $deleteType = $request->query('type', 'soft');

        try {
            DB::beginTransaction();

            if ($deleteType === 'hard') {
                // Hard delete - permanent removal
                // Check if department has any children (active or inactive)
                $childrenCount = $department->children()->count();
                if ($childrenCount > 0) {
                    return response()->json([
                        'message' => "Cannot permanently delete department with {$childrenCount} child departments"
                    ], 422);
                }

                // Check if department has any users (active or inactive)
                $usersCount = $department->users()->count();
                if ($usersCount > 0) {
                    return response()->json([
                        'message' => "Cannot permanently delete department with {$usersCount} users"
                    ], 422);
                }

                $departmentName = $department->name;
                $department->delete();

                $message = "Department '{$departmentName}' permanently deleted successfully";
            } else {
                // Soft delete - deactivate department
                // Check if department has active children
                $activeChildren = $department->children()->where('is_active', true)->count();
                if ($activeChildren > 0) {
                    return response()->json([
                        'message' => "Cannot deactivate department with {$activeChildren} active child departments"
                    ], 422);
                }

                // Check if department has active users
                $activeUsers = $department->users()->where('is_active', true)->count();
                if ($activeUsers > 0) {
                    return response()->json([
                        'message' => "Cannot deactivate department with {$activeUsers} active users"
                    ], 422);
                }

                $department->update([
                    'is_active' => false,
                    'deleted_at' => now()
                ]);

                $message = "Department '{$department->name}' deactivated successfully";
            }

            DB::commit();

            return response()->json([
                'message' => $message
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Department deletion failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get department types for institution
     */
    public function getTypesForInstitution(Request $request): JsonResponse
    {
        $request->validate([
            'institution_id' => 'required|exists:institutions,id'
        ]);

        $institution = \App\Models\Institution::find($request->institution_id);
        $allowedTypes = Department::getAllowedTypesForInstitution($institution->type);
        $typesList = [];

        foreach ($allowedTypes as $type) {
            $typesList[$type] = Department::TYPES[$type] ?? $type;
        }

        return response()->json([
            'types' => $typesList,
            'institution_type' => $institution->type
        ]);
    }

    /**
     * Load department hierarchy recursively
     */
    private function loadDepartmentHierarchy($departments): void
    {
        foreach ($departments as $department) {
            $department->load(['children' => function ($query) {
                $query->with('children');
            }]);
            
            if ($department->children->isNotEmpty()) {
                $this->loadDepartmentHierarchy($department->children);
            }
        }
    }

    /**
     * Format department with children for hierarchy view
     */
    private function formatDepartmentWithChildren($department): array
    {
        $formatted = $this->formatDepartment($department);
        $formatted['children'] = $department->children->map(function ($child) {
            return $this->formatDepartmentWithChildren($child);
        });
        return $formatted;
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
            'department_type' => $department->department_type,
            'department_type_display' => $department->getTypeDisplayName(),
            'description' => $department->description,
            'metadata' => $department->metadata,
            'capacity' => $department->capacity,
            'budget_allocation' => $department->budget_allocation,
            'functional_scope' => $department->functional_scope,
            'is_active' => $department->is_active,
            'institution_id' => $department->institution_id,
            'institution' => $department->institution ? [
                'id' => $department->institution->id,
                'name' => $department->institution->name,
                'type' => $department->institution->type
            ] : null,
            'parent' => $department->parent ? [
                'id' => $department->parent->id,
                'name' => $department->parent->name,
                'department_type' => $department->parent->department_type
            ] : null,
            'children_count' => $department->children ? $department->children->count() : 0,
            'created_at' => $department->created_at,
            'updated_at' => $department->updated_at
        ];
    }
}