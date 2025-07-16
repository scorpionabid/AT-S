<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InstitutionController extends Controller
{
    /**
     * Get institutions list with filtering
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

        $query = Institution::with(['parent', 'children.parent']);

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

        $institutions = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'institutions' => $institutions->items(),
            'meta' => [
                'current_page' => $institutions->currentPage(),
                'last_page' => $institutions->lastPage(),
                'per_page' => $institutions->perPage(),
                'total' => $institutions->total(),
                'from' => $institutions->firstItem(),
                'to' => $institutions->lastItem(),
            ]
        ]);
    }

    /**
     * Display the specified institution
     */
    public function show(Institution $institution): JsonResponse
    {
        $institution->load([
            'parent', 
            'children' => function ($query) {
                $query->active()->with(['children' => function ($subQuery) {
                    $subQuery->active();
                }]);
            },
            'departments' => function ($query) {
                $query->active();
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => $institution,
        ]);
    }

    /**
     * Store a newly created institution
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->hasRole(['superadmin', 'regionadmin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Bu əməliyyat üçün icazəniz yoxdur.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:ministry,region,sektor,school,vocational,university',
            'level' => 'required|integer|between:1,5',
            'parent_id' => 'nullable|integer|exists:institutions,id',
            'region_code' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'director_name' => 'nullable|string|max:255',
            'established_date' => 'nullable|date',
            'student_capacity' => 'nullable|integer|min:0',
            'staff_count' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $institution = Institution::create($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Təşkilat uğurla yaradıldı.',
                'data' => $institution->load(['parent', 'children']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Təşkilat yaradılarkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Update the specified institution
     */
    public function update(Request $request, Institution $institution): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->hasRole(['superadmin', 'regionadmin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Bu əməliyyat üçün icazəniz yoxdur.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'type' => 'string|in:ministry,region,sektor,school,vocational,university',
            'level' => 'integer|between:1,5',
            'parent_id' => 'nullable|integer|exists:institutions,id',
            'region_code' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'director_name' => 'nullable|string|max:255',
            'established_date' => 'nullable|date',
            'student_capacity' => 'nullable|integer|min:0',
            'staff_count' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $institution->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Təşkilat məlumatları yeniləndi.',
                'data' => $institution->fresh(['parent', 'children']),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Təşkilat yenilənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Remove the specified institution
     */
    public function destroy(Institution $institution): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->hasRole(['superadmin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Bu əməliyyat üçün icazəniz yoxdur.',
            ], 403);
        }

        try {
            // Check if institution has children
            if ($institution->children()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bu təşkilatın alt təşkilatları var. Əvvəlcə onları silin.',
                ], 400);
            }

            // Check if institution has users
            if ($institution->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bu təşkilata aid istifadəçilər var. Əvvəlcə onları başqa təşkilata köçürün.',
                ], 400);
            }

            $institution->delete();

            return response()->json([
                'success' => true,
                'message' => 'Təşkilat silindi.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Təşkilat silinərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Get institution types
     */
    public function getTypes(): JsonResponse
    {
        $types = [
            'ministry' => 'Nazirlik',
            'region' => 'Regional İdarə',
            'sektor' => 'Sektor Şöbəsi',
            'school' => 'Məktəb',
            'vocational' => 'Peşə Məktəbi',
            'university' => 'Universitet',
        ];

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    /**
     * Get institution statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                'total_institutions' => Institution::count(),
                'active_institutions' => Institution::active()->count(),
                'by_type' => Institution::select('type', DB::raw('count(*) as count'))
                                       ->groupBy('type')
                                       ->pluck('count', 'type'),
                'by_level' => Institution::select('level', DB::raw('count(*) as count'))
                                        ->groupBy('level')
                                        ->pluck('count', 'level'),
                'hierarchy_depth' => Institution::max('level'),
                'recently_created' => Institution::where('created_at', '>=', now()->subDays(30))->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Statistikalar yüklənərkən xəta baş verdi.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }
}