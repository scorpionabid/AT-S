<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Department;
use App\Services\InstitutionService;
use App\Services\DepartmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InstitutionControllerRefactored extends Controller
{
    protected InstitutionService $institutionService;
    protected DepartmentService $departmentService;

    public function __construct(
        InstitutionService $institutionService,
        DepartmentService $departmentService
    ) {
        $this->institutionService = $institutionService;
        $this->departmentService = $departmentService;
    }

    /**
     * Get institutions list with hierarchy and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validator = $this->validateInstitutionIndex($request);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = $this->institutionService->getInstitutions($request);

            if ($request->hierarchy && !$request->parent_id) {
                return response()->json([
                    'success' => true,
                    'institutions' => $result
                ]);
            } else {
                return response()->json([
                    'success' => true,
                    'data' => $result->items(),
                    'pagination' => [
                        'current_page' => $result->currentPage(),
                        'total_pages' => $result->lastPage(),
                        'per_page' => $result->perPage(),
                        'total' => $result->total()
                    ]
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Təşkilatlar yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Store a newly created institution
     */
    public function store(Request $request): JsonResponse
    {
        $validator = $this->validateInstitutionStore($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $institution = $this->institutionService->createInstitution($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Təşkilat uğurla yaradıldı.',
                'data' => $institution
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Display the specified institution
     */
    public function show(Institution $institution): JsonResponse
    {
        try {
            $institution->load([
                'parent', 
                'children' => function ($query) {
                    $query->where('is_active', true)->orderBy('name');
                },
                'departments' => function ($query) {
                    $query->where('is_active', true)
                          ->withCount(['users', 'users as active_users_count' => function ($q) {
                              $q->where('is_active', true);
                          }]);
                },
                'users' => function ($query) {
                    $query->where('is_active', true)->with('roles');
                }
            ]);

            return response()->json([
                'success' => true,
                'data' => $institution
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Təşkilat yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Update the specified institution
     */
    public function update(Request $request, Institution $institution): JsonResponse
    {
        $validator = $this->validateInstitutionUpdate($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updatedInstitution = $this->institutionService->updateInstitution(
                $institution,
                $validator->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Təşkilat uğurla yeniləndi.',
                'data' => $updatedInstitution
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Remove the specified institution
     */
    public function destroy(Institution $institution): JsonResponse
    {
        try {
            $this->institutionService->deleteInstitution($institution);

            return response()->json([
                'success' => true,
                'message' => 'Təşkilat deaktiv edildi.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get institution statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $institutionId = $request->get('institution_id');
            $stats = $this->institutionService->getInstitutionStatistics($institutionId);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Statistikalar yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get institution hierarchy tree
     */
    public function hierarchy(): JsonResponse
    {
        try {
            $tree = $this->institutionService->getHierarchyTree();

            return response()->json([
                'success' => true,
                'data' => $tree
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'İerarxiya yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get departments for institution
     */
    public function departments(Institution $institution, Request $request): JsonResponse
    {
        try {
            $result = $this->departmentService->getDepartmentsForInstitution(
                $institution->id,
                $request
            );

            if ($request->hierarchy && !$request->parent_id) {
                return response()->json([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                return response()->json([
                    'success' => true,
                    'data' => $result->items(),
                    'pagination' => [
                        'current_page' => $result->currentPage(),
                        'total_pages' => $result->lastPage(),
                        'per_page' => $result->perPage(),
                        'total' => $result->total()
                    ]
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Departamentlər yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Store department for institution
     */
    public function storeDepartment(Institution $institution, Request $request): JsonResponse
    {
        $validator = $this->validateDepartmentStore($request, $institution->id);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $validatedData = $validator->validated();
            $validatedData['institution_id'] = $institution->id;

            $department = $this->departmentService->createDepartment($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Departament uğurla yaradıldı.',
                'data' => $department
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Update department
     */
    public function updateDepartment(Request $request, Department $department): JsonResponse
    {
        $validator = $this->validateDepartmentUpdate($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updatedDepartment = $this->departmentService->updateDepartment(
                $department,
                $validator->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Departament uğurla yeniləndi.',
                'data' => $updatedDepartment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Delete department
     */
    public function destroyDepartment(Department $department): JsonResponse
    {
        try {
            $this->departmentService->deleteDepartment($department);

            return response()->json([
                'success' => true,
                'message' => 'Departament deaktiv edildi.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get department statistics for institution
     */
    public function departmentStatistics(Institution $institution): JsonResponse
    {
        try {
            $stats = $this->departmentService->getDepartmentStatistics($institution->id);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Departament statistikaları yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Validation methods
     */
    private function validateInstitutionIndex(Request $request)
    {
        return Validator::make($request->all(), [
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:ministry,region,sektor,school,vocational,university',
            'level' => 'nullable|integer|between:1,5',
            'parent_id' => 'nullable|integer|exists:institutions,id',
            'region_code' => 'nullable|string|max:10',
            'is_active' => 'nullable|boolean',
            'hierarchy' => 'nullable|boolean',
            'sort_by' => 'nullable|string|in:name,type,level,created_at,established_date',
            'sort_direction' => 'nullable|string|in:asc,desc'
        ]);
    }

    private function validateInstitutionStore(Request $request)
    {
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'type' => 'required|in:ministry,region,sektor,school,vocational,university',
            'parent_id' => 'nullable|exists:institutions,id',
            'region_code' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'established_date' => 'nullable|date',
            'capacity' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'default_departments' => 'nullable|array',
            'default_departments.*' => 'string|max:255'
        ]);
    }

    private function validateInstitutionUpdate(Request $request)
    {
        return Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'type' => 'sometimes|required|in:ministry,region,sektor,school,vocational,university',
            'parent_id' => 'nullable|exists:institutions,id',
            'region_code' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'established_date' => 'nullable|date',
            'capacity' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);
    }

    private function validateDepartmentStore(Request $request, int $institutionId)
    {
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|exists:departments,id',
            'is_active' => 'boolean'
        ]);
    }

    private function validateDepartmentUpdate(Request $request)
    {
        return Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|exists:departments,id',
            'is_active' => 'boolean'
        ]);
    }
}