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
        try {
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
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Institution index validation failed', [
                'request_data' => $request->all(),
                'validation_errors' => $e->errors()
            ]);
            throw $e;
        }

        $query = Institution::with(['parent', 'children', 'departments' => function ($q) {
            $q->where('is_active', true)
              ->withCount(['users', 'users as active_users_count' => function ($subq) {
                  $subq->where('is_active', true);
              }])
              ->with(['children' => function ($childq) {
                  $childq->where('is_active', true)
                         ->withCount(['users', 'users as active_users_count' => function ($subsubq) {
                             $subsubq->where('is_active', true);
                         }]);
              }]);
        }]);

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
            'name' => 'required|string|max:200|min:3',
            'short_name' => 'nullable|string|max:50',
            'type' => 'required|string|in:ministry,region,sektor,school,vocational,university',
            'parent_id' => 'nullable|exists:institutions,id',
            'level' => 'required|integer|between:1,5',
            'region_code' => 'nullable|string|max:10',
            'institution_code' => 'nullable|string|max:20|unique:institutions|regex:/^[A-Z0-9_-]+$/',
            'contact_info' => 'nullable|array',
            'contact_info.phone' => 'nullable|string|max:20',
            'contact_info.email' => 'nullable|email|max:100',
            'contact_info.address' => 'nullable|string|max:500',
            'location' => 'nullable|array',
            'location.latitude' => 'nullable|numeric|between:-90,90',
            'location.longitude' => 'nullable|numeric|between:-180,180',
            'location.address' => 'nullable|string|max:500',
            'metadata' => 'nullable|array',
            'metadata.description' => 'nullable|string|max:1000',
            'metadata.website' => 'nullable|url|max:255',
            'is_active' => 'nullable|boolean',
            'established_date' => 'nullable|date|before_or_equal:today'
        ]);

        // Enhanced hierarchy validation
        $this->validateHierarchy($request);

        try {
            DB::beginTransaction();

            // Generate institution code if not provided
            if (!$request->institution_code) {
                $request->merge(['institution_code' => $this->generateInstitutionCode($request->type)]);
            }

            $institution = Institution::create([
                'name' => trim($request->name),
                'short_name' => $request->short_name ? trim($request->short_name) : null,
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

            // Update hierarchy path
            $this->updateHierarchyPath($institution);

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
        }, 'departments' => function ($q) use ($request) {
            if ($request->active_only) {
                $q->where('is_active', true);
            }
            $q->with(['children' => function ($subq) use ($request) {
                if ($request->active_only) {
                    $subq->where('is_active', true);
                }
            }]);
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
                'departments' => $institution->departments->map(function ($department) {
                    return [
                        'id' => $department->id,
                        'name' => $department->name,
                        'short_name' => $department->short_name,
                        'department_type' => $department->department_type,
                        'is_active' => $department->is_active,
                        'users_count' => $department->users_count ?? 0,
                        'active_users_count' => $department->active_users_count ?? 0,
                        'children' => $department->children->map(function ($child) {
                            return [
                                'id' => $child->id,
                                'name' => $child->name,
                                'short_name' => $child->short_name,
                                'department_type' => $child->department_type,
                                'is_active' => $child->is_active,
                                'users_count' => $child->users_count ?? 0,
                                'active_users_count' => $child->active_users_count ?? 0
                            ];
                        })
                    ];
                }),
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

    /**
     * Validate hierarchy constraints
     */
    private function validateHierarchy(Request $request): void
    {
        // Level 1 (Ministry) should not have parent
        if ($request->level == 1 && $request->parent_id) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], []),
                ['level' => 'Nazirlik səviyyəsi (Level 1) üçün ana təşkilat seçilə bilməz']
            );
        }

        // Level > 1 should have parent
        if ($request->level > 1 && !$request->parent_id) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], []),
                ['parent_id' => 'Bu səviyyə üçün ana təşkilat seçilməlidir']
            );
        }

        // Validate parent level
        if ($request->parent_id) {
            $parent = Institution::find($request->parent_id);
            if ($parent && $parent->level >= $request->level) {
                throw new \Illuminate\Validation\ValidationException(
                    validator([], []),
                    ['parent_id' => 'Ana təşkilatın səviyyəsi bu təşkilatdan aşağı olmalıdır']
                );
            }
        }

        // Validate type and level consistency
        $typeLevel = $this->getTypeLevelMapping();
        if (isset($typeLevel[$request->type]) && $typeLevel[$request->type] !== $request->level) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], []),
                ['type' => 'Təşkilat tipi və səviyyəsi uyğun deyil']
            );
        }
    }

    /**
     * Generate institution code
     */
    private function generateInstitutionCode(string $type): string
    {
        $prefixes = [
            'ministry' => 'MIN',
            'region' => 'REG',
            'sektor' => 'SEK',
            'school' => 'SCH',
            'vocational' => 'VOC',
            'university' => 'UNI'
        ];

        $prefix = $prefixes[$type] ?? 'INS';
        $timestamp = now()->format('ymd');
        $random = str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$timestamp}-{$random}";
    }

    /**
     * Update hierarchy path
     */
    private function updateHierarchyPath(Institution $institution): void
    {
        if ($institution->parent_id) {
            $parent = Institution::find($institution->parent_id);
            $hierarchyPath = $parent->hierarchy_path ? 
                $parent->hierarchy_path . '/' . $institution->id : 
                $institution->id;
        } else {
            $hierarchyPath = $institution->id;
        }

        $institution->update(['hierarchy_path' => $hierarchyPath]);
    }

    /**
     * Get type-level mapping
     */
    private function getTypeLevelMapping(): array
    {
        return [
            'ministry' => 1,
            'region' => 2,
            'sektor' => 3,
            'school' => 4,
            'vocational' => 4,
            'university' => 4
        ];
    }

    /**
     * Bulk operations for institutions
     */
    public function bulkActivate(Request $request): JsonResponse
    {
        $request->validate([
            'institution_ids' => 'required|array|min:1|max:100',
            'institution_ids.*' => 'integer|exists:institutions,id'
        ]);

        try {
            DB::beginTransaction();

            $institutions = Institution::whereIn('id', $request->institution_ids)->get();
            $updatedCount = 0;

            foreach ($institutions as $institution) {
                if (!$institution->is_active) {
                    $institution->update(['is_active' => true]);
                    $updatedCount++;

                    // Log activity
                    // ActivityLog::logActivity([
                    //     'user_id' => $request->user()->id,
                    //     'activity_type' => 'bulk_institution_activated',
                    //     'entity_type' => 'Institution',
                    //     'entity_id' => $institution->id,
                    //     'description' => "Institution activated via bulk operation: {$institution->name}",
                    //     'institution_id' => $request->user()->institution_id
                    // ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => "{$updatedCount} təşkilat uğurla aktivləşdirildi",
                'updated_count' => $updatedCount,
                'total_requested' => count($request->institution_ids)
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
            'institution_ids' => 'required|array|min:1|max:100',
            'institution_ids.*' => 'integer|exists:institutions,id'
        ]);

        try {
            DB::beginTransaction();

            $institutions = Institution::whereIn('id', $request->institution_ids)->get();
            $updatedCount = 0;

            foreach ($institutions as $institution) {
                // Check if institution has active children
                $activeChildren = $institution->children()->where('is_active', true)->count();
                if ($activeChildren > 0) {
                    continue; // Skip this institution
                }

                // Check if institution has active users
                $activeUsers = $institution->users()->where('is_active', true)->count();
                if ($activeUsers > 0) {
                    continue; // Skip this institution
                }

                if ($institution->is_active) {
                    $institution->update(['is_active' => false]);
                    
                    // Deactivate all departments
                    $institution->departments()->update(['is_active' => false]);
                    
                    $updatedCount++;

                    // Log activity
                    // ActivityLog::logActivity([
                    //     'user_id' => $request->user()->id,
                    //     'activity_type' => 'bulk_institution_deactivated',
                    //     'entity_type' => 'Institution',
                    //     'entity_id' => $institution->id,
                    //     'description' => "Institution deactivated via bulk operation: {$institution->name}",
                    //     'institution_id' => $request->user()->institution_id
                    // ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => "{$updatedCount} təşkilat uğurla deaktiv edildi",
                'updated_count' => $updatedCount,
                'total_requested' => count($request->institution_ids),
                'note' => 'Aktiv istifadəçiləri və ya alt təşkilatları olan təşkilatlar deaktiv edilmədi'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Bulk deaktiv etmə zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkAssignParent(Request $request): JsonResponse
    {
        $request->validate([
            'institution_ids' => 'required|array|min:1|max:50',
            'institution_ids.*' => 'integer|exists:institutions,id',
            'parent_id' => 'required|integer|exists:institutions,id'
        ]);

        try {
            DB::beginTransaction();

            $parentInstitution = Institution::findOrFail($request->parent_id);
            $institutions = Institution::whereIn('id', $request->institution_ids)->get();
            $updatedCount = 0;

            foreach ($institutions as $institution) {
                // Prevent self-parenting
                if ($institution->id === $request->parent_id) {
                    continue;
                }

                // Prevent circular references
                if ($institution->isAncestorOf($parentInstitution)) {
                    continue;
                }

                // Check level compatibility
                if ($institution->level <= $parentInstitution->level) {
                    continue;
                }

                if ($institution->parent_id !== $request->parent_id) {
                    $institution->update(['parent_id' => $request->parent_id]);
                    $this->updateHierarchyPath($institution);
                    $updatedCount++;

                    // Log activity
                    // ActivityLog::logActivity([
                    //     'user_id' => $request->user()->id,
                    //     'activity_type' => 'bulk_parent_assigned',
                    //     'entity_type' => 'Institution',
                    //     'entity_id' => $institution->id,
                    //     'description' => "Parent institution assigned via bulk operation: {$institution->name} -> {$parentInstitution->name}",
                    //     'institution_id' => $request->user()->institution_id
                    // ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => "{$updatedCount} təşkilata ana təşkilat təyin edildi",
                'updated_count' => $updatedCount,
                'total_requested' => count($request->institution_ids),
                'parent_institution' => $parentInstitution->name,
                'note' => 'Uyğunsuz təşkilatlar atlandı (dövrvi əlaqə, səviyyə uyğunsuzluğu)'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Bulk ana təşkilat təyinatı zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkUpdateType(Request $request): JsonResponse
    {
        $request->validate([
            'institution_ids' => 'required|array|min:1|max:50',
            'institution_ids.*' => 'integer|exists:institutions,id',
            'type' => 'required|string|in:ministry,region,sektor,school,vocational,university'
        ]);

        try {
            DB::beginTransaction();

            $typeLevel = $this->getTypeLevelMapping();
            $newLevel = $typeLevel[$request->type];
            
            $institutions = Institution::whereIn('id', $request->institution_ids)->get();
            $updatedCount = 0;

            foreach ($institutions as $institution) {
                if ($institution->type !== $request->type) {
                    $institution->update([
                        'type' => $request->type,
                        'level' => $newLevel
                    ]);
                    $updatedCount++;

                    // Log activity
                    // ActivityLog::logActivity([
                    //     'user_id' => $request->user()->id,
                    //     'activity_type' => 'bulk_type_updated',
                    //     'entity_type' => 'Institution',
                    //     'entity_id' => $institution->id,
                    //     'description' => "Institution type updated via bulk operation: {$institution->name} -> {$request->type}",
                    //     'institution_id' => $request->user()->institution_id
                    // ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => "{$updatedCount} təşkilatın tipi yeniləndi",
                'updated_count' => $updatedCount,
                'total_requested' => count($request->institution_ids),
                'new_type' => $request->type,
                'new_level' => $newLevel
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Bulk tip yeniləməsi zamanı xəta baş verdi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function exportInstitutions(Request $request): JsonResponse
    {
        $request->validate([
            'format' => 'required|string|in:csv,json',
            'filters' => 'nullable|array',
            'include_hierarchy' => 'nullable|boolean'
        ]);

        try {
            $query = Institution::with(['parent']);

            // Apply filters if provided
            if ($request->filters) {
                if (isset($request->filters['type'])) {
                    $query->where('type', $request->filters['type']);
                }
                if (isset($request->filters['level'])) {
                    $query->where('level', $request->filters['level']);
                }
                if (isset($request->filters['is_active'])) {
                    $query->where('is_active', $request->filters['is_active']);
                }
                if (isset($request->filters['region_code'])) {
                    $query->where('region_code', $request->filters['region_code']);
                }
            }

            $institutions = $query->get();

            $exportData = $institutions->map(function ($institution) use ($request) {
                $data = [
                    'id' => $institution->id,
                    'name' => $institution->name,
                    'short_name' => $institution->short_name,
                    'type' => $institution->type,
                    'level' => $institution->level,
                    'institution_code' => $institution->institution_code,
                    'region_code' => $institution->region_code,
                    'is_active' => $institution->is_active,
                    'established_date' => $institution->established_date?->toDateString(),
                    'created_at' => $institution->created_at?->toDateTimeString()
                ];

                if ($request->include_hierarchy) {
                    $data = array_merge($data, [
                        'parent_name' => $institution->parent?->name,
                        'hierarchy_path' => $institution->hierarchy_path
                    ]);
                }

                return $data;
            });

            // Log export activity
            // ActivityLog::logActivity([
            //     'user_id' => $request->user()->id,
            //     'activity_type' => 'institutions_export',
            //     'entity_type' => 'Institution',
            //     'description' => "Exported {$institutions->count()} institutions in {$request->format} format",
            //     'event_data' => [
            //         'format' => $request->format,
            //         'count' => $institutions->count(),
            //         'include_hierarchy' => $request->include_hierarchy ?? false
            //     ]
            // ]);

            return response()->json([
                'message' => 'Təşkilatlar uğurla export edildi',
                'format' => $request->format,
                'count' => $institutions->count(),
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
     * Get bulk operation statistics for institutions
     */
    public function getBulkStatistics(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total_institutions' => Institution::count(),
                'active_institutions' => Institution::where('is_active', true)->count(),
                'inactive_institutions' => Institution::where('is_active', false)->count(),
                'by_type' => Institution::selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray(),
                'by_level' => Institution::selectRaw('level, COUNT(*) as count')
                    ->groupBy('level')
                    ->pluck('count', 'level')
                    ->toArray(),
                'by_region' => Institution::selectRaw('region_code, COUNT(*) as count')
                    ->whereNotNull('region_code')
                    ->groupBy('region_code')
                    ->orderBy('count', 'desc')
                    ->pluck('count', 'region_code')
                    ->toArray(),
                'hierarchy_stats' => [
                    'root_institutions' => Institution::whereNull('parent_id')->count(),
                    'max_level' => Institution::max('level'),
                    'institutions_with_children' => Institution::has('children')->count()
                ],
                'recent_activity' => [
                    'today' => Institution::whereDate('created_at', today())->count(),
                    'this_week' => Institution::where('created_at', '>=', now()->startOfWeek())->count(),
                    'this_month' => Institution::where('created_at', '>=', now()->startOfMonth())->count()
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
}