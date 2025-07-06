<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Department;
// use App\Models\ActivityLog; // Activity logging disabled temporarily
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InstitutionController extends Controller
{
    /**
     * Get institutions list with hierarchy and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:ministry,region,sektor,school,vocational,university',
            'level' => 'nullable|integer|between:1,5',
            'parent_id' => 'nullable|integer|exists:institutions,id',
            'region_code' => 'nullable|string|max:10',
            'is_active' => 'nullable|boolean',
            'hierarchy' => 'nullable|boolean', // Return as nested hierarchy
            'sort_by' => 'nullable|string|in:name,type,level,created_at,established_date',
            'sort_direction' => 'nullable|string|in:asc,desc'
        ]);

        $query = Institution::with(['parent', 'children']);

        // Apply filters
        if ($request->search) {
            $query->searchByName($request->search);
        }

        if ($request->type) {
            $query->byType($request->type);
        }

        if ($request->level) {
            $query->byLevel($request->level);
        }

        if ($request->has('parent_id')) {
            if ($request->parent_id) {
                $query->where('parent_id', $request->parent_id);
            } else {
                $query->roots(); // Get root institutions
            }
        }

        if ($request->region_code) {
            $query->byRegionCode($request->region_code);
        }

        if ($request->has('is_active')) {
            if ($request->is_active) {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'name';
        $sortDirection = $request->sort_direction ?? 'asc';
        $query->orderBy($sortBy, $sortDirection);

        // Return as hierarchy or paginated list
        if ($request->hierarchy && !$request->parent_id) {
            $institutions = $query->roots()->get();
            $this->loadHierarchy($institutions);
            
            return response()->json([
                'institutions' => $this->formatHierarchy($institutions)
            ]);
        } else {
            $institutions = $query->paginate($request->per_page ?? 15);

            return response()->json([
                'institutions' => $institutions->map(function ($institution) {
                    return $this->formatInstitution($institution);
                }),
                'meta' => [
                    'current_page' => $institutions->currentPage(),
                    'last_page' => $institutions->lastPage(),
                    'per_page' => $institutions->perPage(),
                    'total' => $institutions->total(),
                    'from' => $institutions->firstItem(),
                    'to' => $institutions->lastItem()
                ]
            ]);
        }
    }

    /**
     * Get specific institution with full details
     */
    public function show(Request $request, Institution $institution): JsonResponse
    {
        $institution->load([
            'parent', 
            'children.children', 
            'departments', 
            'users.role', 
            'region', 
            'sector'
        ]);

        // Activity logging disabled temporarily
        // ActivityLog::logActivity([
        //     'user_id' => $request->user()->id,
        //     'activity_type' => 'institution_view',
        //     'entity_type' => 'Institution',
        //     'entity_id' => $institution->id,
        //     'description' => "Viewed institution: {$institution->name}",
        //     'institution_id' => $request->user()->institution_id
        // ]);

        return response()->json([
            'institution' => [
                'id' => $institution->id,
                'name' => $institution->name,
                'short_name' => $institution->short_name,
                'type' => $institution->type,
                'level' => $institution->level,
                'region_code' => $institution->region_code,
                'institution_code' => $institution->institution_code,
                'contact_info' => $institution->contact_info,
                'location' => $institution->location,
                'metadata' => $institution->metadata,
                'is_active' => $institution->is_active,
                'established_date' => $institution->established_date,
                'hierarchy_path' => $institution->hierarchy_path,
                'created_at' => $institution->created_at,
                'updated_at' => $institution->updated_at,
                'parent' => $institution->parent ? [
                    'id' => $institution->parent->id,
                    'name' => $institution->parent->name,
                    'type' => $institution->parent->type,
                    'level' => $institution->parent->level
                ] : null,
                'children' => $institution->children->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'name' => $child->name,
                        'type' => $child->type,
                        'level' => $child->level,
                        'is_active' => $child->is_active,
                        'children_count' => $child->children->count()
                    ];
                }),
                'departments' => $institution->departments->map(function ($dept) {
                    return [
                        'id' => $dept->id,
                        'name' => $dept->name,
                        'short_name' => $dept->short_name,
                        'is_active' => $dept->is_active
                    ];
                }),
                'users_count' => $institution->users->count(),
                'active_users_count' => $institution->users->where('is_active', true)->count(),
                'region' => $institution->region ? [
                    'id' => $institution->region->id,
                    'code' => $institution->region->code,
                    'name' => $institution->region->name,
                    'area_km2' => $institution->region->area_km2,
                    'population' => $institution->region->population
                ] : null,
                'sector' => $institution->sector ? [
                    'id' => $institution->sector->id,
                    'code' => $institution->sector->code,
                    'name' => $institution->sector->name,
                    'region_id' => $institution->sector->region_id
                ] : null
            ]
        ]);
    }

    /**
     * Create new institution
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'short_name' => 'nullable|string|max:50',
            'type' => 'required|string|in:ministry,region,sektor,school,vocational,university',
            'parent_id' => 'nullable|exists:institutions,id',
            'level' => 'required|integer|between:1,5',
            'region_code' => 'nullable|string|max:10',
            'institution_code' => 'nullable|string|max:20|unique:institutions',
            'contact_info' => 'nullable|array',
            'location' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'established_date' => 'nullable|date'
        ]);

        try {
            DB::beginTransaction();

            $institution = Institution::create([
                'name' => $request->name,
                'short_name' => $request->short_name,
                'type' => $request->type,
                'parent_id' => $request->parent_id,
                'level' => $request->level,
                'region_code' => $request->region_code,
                'institution_code' => $request->institution_code,
                'contact_info' => $request->contact_info ?? [],
                'location' => $request->location ?? [],
                'metadata' => $request->metadata ?? [],
                'is_active' => $request->is_active ?? true,
                'established_date' => $request->established_date
            ]);

            $institution->load(['parent']);

            DB::commit();

            // Activity logging disabled temporarily
            // ActivityLog::logActivity([
            //     'user_id' => $request->user()->id,
            //     'activity_type' => 'institution_create',
            //     'entity_type' => 'Institution',
            //     'entity_id' => $institution->id,
            //     'description' => "Created institution: {$institution->name}",
            //     'after_state' => $institution->toArray(),
            //     'institution_id' => $request->user()->institution_id
            // ]);

            return response()->json([
                'message' => 'Institution created successfully',
                'institution' => $this->formatInstitution($institution)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Institution creation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update institution
     */
    public function update(Request $request, Institution $institution): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:200',
            'short_name' => 'nullable|string|max:50',
            'type' => 'sometimes|string|in:ministry,region,sektor,school,vocational,university',
            'parent_id' => 'nullable|exists:institutions,id',
            'level' => 'sometimes|integer|between:1,5',
            'region_code' => 'nullable|string|max:10',
            'institution_code' => 'nullable|string|max:20|unique:institutions,institution_code,' . $institution->id,
            'contact_info' => 'nullable|array',
            'location' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'established_date' => 'nullable|date'
        ]);

        // Prevent self-parenting and circular references
        if ($request->parent_id && $request->parent_id == $institution->id) {
            return response()->json([
                'message' => 'Institution cannot be its own parent'
            ], 422);
        }

        if ($request->parent_id) {
            $ancestors = $institution->getAncestors();
            if ($ancestors->contains('id', $request->parent_id)) {
                return response()->json([
                    'message' => 'Cannot create circular hierarchy'
                ], 422);
            }
        }

        try {
            DB::beginTransaction();

            $oldData = $institution->toArray();

            $institution->update($request->only([
                'name', 'short_name', 'type', 'parent_id', 'level',
                'region_code', 'institution_code', 'contact_info',
                'location', 'metadata', 'is_active', 'established_date'
            ]));

            $institution->load(['parent']);

            DB::commit();

            // Activity logging disabled temporarily
            // ActivityLog::logActivity([
            //     'user_id' => $request->user()->id,
            //     'activity_type' => 'institution_update',
            //     'entity_type' => 'Institution',
            //     'entity_id' => $institution->id,
            //     'description' => "Updated institution: {$institution->name}",
            //     'before_state' => $oldData,
            //     'after_state' => $institution->toArray(),
            //     'institution_id' => $request->user()->institution_id
            // ]);

            return response()->json([
                'message' => 'Institution updated successfully',
                'institution' => $this->formatInstitution($institution)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Institution update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete institution (soft delete by deactivating)
     */
    public function destroy(Request $request, Institution $institution): JsonResponse
    {
        // Check if institution has active children
        $activeChildren = $institution->children()->active()->count();
        if ($activeChildren > 0) {
            return response()->json([
                'message' => "Cannot delete institution with {$activeChildren} active child institutions"
            ], 422);
        }

        // Check if institution has active users
        $activeUsers = $institution->users()->active()->count();
        if ($activeUsers > 0) {
            return response()->json([
                'message' => "Cannot delete institution with {$activeUsers} active users"
            ], 422);
        }

        $oldData = $institution->toArray();

        $institution->update(['is_active' => false]);

        // Deactivate all departments
        $institution->departments()->update(['is_active' => false]);

        // Activity logging disabled temporarily
        // ActivityLog::logActivity([
        //     'user_id' => $request->user()->id,
        //     'activity_type' => 'institution_delete',
        //     'entity_type' => 'Institution',
        //     'entity_id' => $institution->id,
        //     'description' => "Deactivated institution: {$institution->name}",
        //     'before_state' => $oldData,
        //     'after_state' => $institution->toArray(),
        //     'institution_id' => $request->user()->institution_id
        // ]);

        return response()->json([
            'message' => 'Institution deactivated successfully'
        ]);
    }

    /**
     * Get institution hierarchy tree
     */
    public function hierarchy(Request $request): JsonResponse
    {
        $request->validate([
            'root_id' => 'nullable|exists:institutions,id',
            'type' => 'nullable|string|in:ministry,region,sektor,school,vocational,university',
            'active_only' => 'nullable|boolean'
        ]);

        $query = Institution::with(['children' => function ($q) use ($request) {
            if ($request->active_only) {
                $q->active();
            }
        }]);

        if ($request->root_id) {
            $institutions = collect([$query->findOrFail($request->root_id)]);
        } else {
            $query->roots();
            if ($request->type) {
                $query->byType($request->type);
            }
            if ($request->active_only) {
                $query->active();
            }
            $institutions = $query->get();
        }

        $this->loadHierarchy($institutions, $request->active_only ?? false);

        return response()->json([
            'hierarchy' => $this->formatHierarchy($institutions)
        ]);
    }

    /**
     * Get institution departments
     */
    public function departments(Request $request, Institution $institution): JsonResponse
    {
        $request->validate([
            'active_only' => 'nullable|boolean',
            'parent_id' => 'nullable|exists:departments,id'
        ]);

        $query = $institution->departments();

        if ($request->active_only) {
            $query->active();
        }

        if ($request->has('parent_id')) {
            if ($request->parent_id) {
                $query->where('parent_department_id', $request->parent_id);
            } else {
                $query->roots();
            }
        }

        $departments = $query->with(['parent', 'children'])->get();

        return response()->json([
            'departments' => $departments->map(function ($dept) {
                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'short_name' => $dept->short_name,
                    'description' => $dept->description,
                    'is_active' => $dept->is_active,
                    'parent' => $dept->parent ? [
                        'id' => $dept->parent->id,
                        'name' => $dept->parent->name
                    ] : null,
                    'children_count' => $dept->children->count(),
                    'created_at' => $dept->created_at
                ];
            })
        ]);
    }

    /**
     * Get institution statistics
     */
    public function statistics(Request $request, Institution $institution): JsonResponse
    {
        $stats = [
            'users' => [
                'total' => $institution->users()->count(),
                'active' => $institution->users()->active()->count(),
                'by_role' => $institution->users()
                    ->join('roles', 'users.role_id', '=', 'roles.id')
                    ->selectRaw('roles.name as role, COUNT(*) as count')
                    ->groupBy('roles.name')
                    ->pluck('count', 'role')
                    ->toArray()
            ],
            'children' => [
                'total' => $institution->children()->count(),
                'active' => $institution->children()->active()->count(),
                'by_type' => $institution->children()
                    ->selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray()
            ],
            'departments' => [
                'total' => $institution->departments()->count(),
                'active' => $institution->departments()->active()->count()
            ]
        ];

        // Add specific stats based on institution type
        if ($institution->type === 'school') {
            $stats['academic'] = [
                'grades' => $institution->grades()->count(),
                'active_grades' => $institution->grades()->active()->count(),
                'rooms' => $institution->rooms()->count(),
                'active_rooms' => $institution->rooms()->active()->count()
            ];
        }

        return response()->json(['statistics' => $stats]);
    }

    /**
     * Load hierarchy recursively
     */
    private function loadHierarchy($institutions, bool $activeOnly = false): void
    {
        foreach ($institutions as $institution) {
            if ($institution->children->isNotEmpty()) {
                if ($activeOnly) {
                    $institution->children = $institution->children->where('is_active', true);
                }
                $this->loadHierarchy($institution->children, $activeOnly);
            }
        }
    }

    /**
     * Format hierarchy for response
     */
    private function formatHierarchy($institutions): array
    {
        return $institutions->map(function ($institution) {
            return [
                'id' => $institution->id,
                'name' => $institution->name,
                'short_name' => $institution->short_name,
                'type' => $institution->type,
                'level' => $institution->level,
                'is_active' => $institution->is_active,
                'children' => $institution->children->isNotEmpty() 
                    ? $this->formatHierarchy($institution->children) 
                    : []
            ];
        })->toArray();
    }

    /**
     * Format single institution for response
     */
    private function formatInstitution($institution): array
    {
        return [
            'id' => $institution->id,
            'name' => $institution->name,
            'short_name' => $institution->short_name,
            'type' => $institution->type,
            'level' => $institution->level,
            'region_code' => $institution->region_code,
            'institution_code' => $institution->institution_code,
            'is_active' => $institution->is_active,
            'established_date' => $institution->established_date,
            'hierarchy_path' => $institution->hierarchy_path,
            'parent' => $institution->parent ? [
                'id' => $institution->parent->id,
                'name' => $institution->parent->name,
                'type' => $institution->parent->type
            ] : null,
            'children_count' => $institution->children->count(),
            'created_at' => $institution->created_at,
            'updated_at' => $institution->updated_at
        ];
    }
}