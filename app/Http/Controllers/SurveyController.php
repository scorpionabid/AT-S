<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\SurveyVersion;
use App\Models\SurveyAuditLog;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SurveyController extends Controller
{
    /**
     * Get surveys list with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:draft,published,closed,archived',
            'survey_type' => 'nullable|string|in:form,poll,assessment,feedback',
            'creator_id' => 'nullable|integer|exists:users,id',
            'institution_id' => 'nullable|integer|exists:institutions,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'my_surveys' => 'nullable|boolean', // Only surveys I can respond to
            'sort_by' => 'nullable|string|in:title,status,created_at,published_at,start_date,end_date',
            'sort_direction' => 'nullable|string|in:asc,desc'
        ]);

        $query = Survey::with(['creator.profile']);

        // Apply filters
        if ($request->search) {
            $query->searchByTitle($request->search);
        }

        if ($request->status) {
            $query->byStatus($request->status);
        }

        if ($request->survey_type) {
            $query->byType($request->survey_type);
        }

        if ($request->creator_id) {
            $query->createdBy($request->creator_id);
        }

        if ($request->institution_id) {
            $query->forInstitution($request->institution_id);
        }

        if ($request->start_date) {
            $query->where('start_date', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->where('end_date', '<=', $request->end_date);
        }

        // Filter for surveys user can respond to
        if ($request->my_surveys) {
            $userInstitutionId = $request->user()->institution_id;
            if ($userInstitutionId) {
                $query->forInstitution($userInstitutionId);
            }
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);

        $surveys = $query->paginate($request->per_page ?? 15);

        // Log activity
        // ActivityLog::logActivity([
        //     'user_id' => $request->user()->id,
        //     'activity_type' => 'surveys_list',
        //     'description' => 'Accessed surveys list',
        //     'properties' => [
        //         'filters' => $request->only(['search', 'status', 'survey_type', 'my_surveys']),
        //         'pagination' => [
        //             'per_page' => $request->per_page ?? 15,
        //             'page' => $request->page ?? 1
        //         ]
        //     ],
        //     'institution_id' => $request->user()->institution_id
        // ]);

        return response()->json([
            'surveys' => $surveys->map(function ($survey) {
                return $this->formatSurvey($survey);
            }),
            'meta' => [
                'current_page' => $surveys->currentPage(),
                'last_page' => $surveys->lastPage(),
                'per_page' => $surveys->perPage(),
                'total' => $surveys->total(),
                'from' => $surveys->firstItem(),
                'to' => $surveys->lastItem()
            ]
        ]);
    }

    /**
     * Get specific survey with full details
     */
    public function show(Request $request, Survey $survey): JsonResponse
    {
        $survey->load(['creator.profile', 'responses', 'versions', 'auditLogs']);

        // Check if user can view this survey
        $userInstitutionId = $request->user()->institution_id;
        $canView = $survey->status === 'published' || 
                   $survey->creator_id === $request->user()->id ||
                   ($userInstitutionId && in_array($userInstitutionId, $survey->target_institutions ?? []));

        if (!$canView) {
            return response()->json([
                'message' => 'You do not have permission to view this survey'
            ], 403);
        }

        // Log activity
        // ActivityLog::logActivity([
        //     'user_id' => $request->user()->id,
        //     'activity_type' => 'survey_view',
        //     'entity_type' => 'Survey',
        //     'entity_id' => $survey->id,
        //     'description' => "Viewed survey: {$survey->title}",
        //     'institution_id' => $request->user()->institution_id
        // ]);

        return response()->json([
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'status' => $survey->status,
                'survey_type' => $survey->survey_type,
                'is_anonymous' => $survey->is_anonymous,
                'allow_multiple_responses' => $survey->allow_multiple_responses,
                'structure' => $survey->structure,
                'target_institutions' => $survey->target_institutions,
                'target_departments' => $survey->target_departments,
                'start_date' => $survey->start_date,
                'end_date' => $survey->end_date,
                'published_at' => $survey->published_at,
                'archived_at' => $survey->archived_at,
                'response_count' => $survey->response_count,
                'completion_threshold' => $survey->completion_threshold,
                'completion_percentage' => $survey->completion_percentage,
                'metadata' => $survey->metadata,
                'is_active' => $survey->isActive(),
                'is_open_for_responses' => $survey->isOpenForResponses(),
                'has_expired' => $survey->hasExpired(),
                'can_respond' => $userInstitutionId ? $survey->canInstitutionRespond($userInstitutionId) : false,
                'created_at' => $survey->created_at,
                'updated_at' => $survey->updated_at,
                'creator' => [
                    'id' => $survey->creator->id,
                    'username' => $survey->creator->username,
                    'name' => $survey->creator->profile?->full_name ?? $survey->creator->username
                ],
                'responses_summary' => [
                    'total' => $survey->responses->count(),
                    'completed' => $survey->responses->where('is_complete', true)->count(),
                    'draft' => $survey->responses->where('status', 'draft')->count(),
                    'submitted' => $survey->responses->where('status', 'submitted')->count(),
                    'approved' => $survey->responses->where('status', 'approved')->count()
                ],
                'versions_count' => $survey->versions->count()
            ]
        ]);
    }

    /**
     * Create new survey
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'survey_type' => 'required|string|in:form,poll,assessment,feedback',
            'is_anonymous' => 'nullable|boolean',
            'allow_multiple_responses' => 'nullable|boolean',
            'structure' => 'required|array',
            'structure.sections' => 'required|array|min:1',
            'structure.sections.*.title' => 'required|string',
            'structure.sections.*.questions' => 'required|array|min:1',
            'structure.sections.*.questions.*.question' => 'required|string',
            'structure.sections.*.questions.*.type' => 'required|string',
            'target_institutions' => 'required|array|min:1',
            'target_institutions.*' => 'integer|exists:institutions,id',
            'target_departments' => 'nullable|array',
            'target_departments.*' => 'string',
            'start_date' => 'nullable|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'completion_threshold' => 'nullable|integer|between:1,100',
            'metadata' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            $survey = Survey::create([
                'title' => $request->title,
                'description' => $request->description,
                'creator_id' => $request->user()->id,
                'status' => 'draft',
                'survey_type' => $request->survey_type,
                'is_anonymous' => $request->is_anonymous ?? false,
                'allow_multiple_responses' => $request->allow_multiple_responses ?? false,
                'structure' => $request->structure,
                'target_institutions' => $request->target_institutions,
                'target_departments' => $request->target_departments ?? [],
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'completion_threshold' => $request->completion_threshold,
                'metadata' => $request->metadata ?? []
            ]);

            // Create initial version
            SurveyVersion::create([
                'survey_id' => $survey->id,
                'version_number' => 1,
                'structure' => $request->structure,
                'created_by' => $request->user()->id,
                'created_at' => now()
            ]);

            $survey->load(['creator.profile']);

            DB::commit();

            // Log activity
            // ActivityLog::logActivity([
            //     'user_id' => $request->user()->id,
            //     'activity_type' => 'survey_create',
            //     'entity_type' => 'Survey',
            //     'entity_id' => $survey->id,
            //     'description' => "Created survey: {$survey->title}",
            //     'after_state' => $survey->toArray(),
            //     'institution_id' => $request->user()->institution_id
            // ]);

            // Log audit
            // SurveyAuditLog::create([
            //     'survey_id' => $survey->id,
            //     'user_id' => $request->user()->id,
            //     'action' => 'created',
            //     'details' => [
            //         'title' => $survey->title,
            //         'survey_type' => $survey->survey_type,
            //         'target_institutions_count' => count($survey->target_institutions)
            //     ],
            //     'ip_address' => $request->ip(),
            //     'created_at' => now()
            // ]);

            return response()->json([
                'message' => 'Survey created successfully',
                'survey' => $this->formatSurvey($survey)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Survey creation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update survey
     */
    public function update(Request $request, Survey $survey): JsonResponse
    {
        // Check permissions
        if ($survey->creator_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You can only update your own surveys'
            ], 403);
        }

        // Cannot update published surveys with responses
        if ($survey->status !== 'draft' && $survey->responses()->count() > 0) {
            return response()->json([
                'message' => 'Cannot update survey that already has responses'
            ], 422);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'survey_type' => 'sometimes|string|in:form,poll,assessment,feedback',
            'is_anonymous' => 'nullable|boolean',
            'allow_multiple_responses' => 'nullable|boolean',
            'structure' => 'sometimes|array',
            'structure.sections' => 'required_with:structure|array|min:1',
            'target_institutions' => 'sometimes|array|min:1',
            'target_institutions.*' => 'integer|exists:institutions,id',
            'target_departments' => 'nullable|array',
            'target_departments.*' => 'string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'completion_threshold' => 'nullable|integer|between:1,100',
            'metadata' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            $oldData = $survey->toArray();
            $structureChanged = false;

            // Check if structure changed
            if ($request->has('structure') && $survey->structure !== $request->structure) {
                $structureChanged = true;
            }

            $survey->update($request->only([
                'title', 'description', 'survey_type', 'is_anonymous',
                'allow_multiple_responses', 'structure', 'target_institutions',
                'target_departments', 'start_date', 'end_date',
                'completion_threshold', 'metadata'
            ]));

            // Create new version if structure changed
            if ($structureChanged) {
                $lastVersion = $survey->versions()->orderBy('version_number', 'desc')->first();
                $newVersionNumber = $lastVersion ? $lastVersion->version_number + 1 : 1;

                SurveyVersion::create([
                    'survey_id' => $survey->id,
                    'version_number' => $newVersionNumber,
                    'structure' => $request->structure,
                    'created_by' => $request->user()->id,
                    'created_at' => now()
                ]);
            }

            DB::commit();

            // Log activity
            ActivityLog::logActivity([
                'user_id' => $request->user()->id,
                'activity_type' => 'survey_update',
                'entity_type' => 'Survey',
                'entity_id' => $survey->id,
                'description' => "Updated survey: {$survey->title}",
                'before_state' => $oldData,
                'after_state' => $survey->toArray(),
                'institution_id' => $request->user()->institution_id
            ]);

            // Log audit
            SurveyAuditLog::create([
                'survey_id' => $survey->id,
                'user_id' => $request->user()->id,
                'action' => 'updated',
                'details' => [
                    'structure_changed' => $structureChanged,
                    'changes' => array_keys($request->only([
                        'title', 'description', 'structure', 'target_institutions'
                    ]))
                ],
                'ip_address' => $request->ip(),
                'created_at' => now()
            ]);

            return response()->json([
                'message' => 'Survey updated successfully',
                'survey' => $this->formatSurvey($survey)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Survey update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete survey
     */
    public function destroy(Request $request, Survey $survey): JsonResponse
    {
        // Check permissions
        if ($survey->creator_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You can only delete your own surveys'
            ], 403);
        }

        // Cannot delete published surveys with responses
        if ($survey->status !== 'draft' && $survey->responses()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete survey that has responses'
            ], 422);
        }

        $oldData = $survey->toArray();

        $survey->delete();

        // Log activity
        ActivityLog::logActivity([
            'user_id' => $request->user()->id,
            'activity_type' => 'survey_delete',
            'entity_type' => 'Survey',
            'entity_id' => $survey->id,
            'description' => "Deleted survey: {$survey->title}",
            'before_state' => $oldData,
            'institution_id' => $request->user()->institution_id
        ]);

        return response()->json([
            'message' => 'Survey deleted successfully'
        ]);
    }

    /**
     * Publish survey
     */
    public function publish(Request $request, Survey $survey): JsonResponse
    {
        // Check permissions
        if ($survey->creator_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You can only publish your own surveys'
            ], 403);
        }

        if ($survey->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft surveys can be published'
            ], 422);
        }

        $survey->update([
            'status' => 'published',
            'published_at' => now()
        ]);

        // Log activity
        ActivityLog::logActivity([
            'user_id' => $request->user()->id,
            'activity_type' => 'survey_publish',
            'entity_type' => 'Survey',
            'entity_id' => $survey->id,
            'description' => "Published survey: {$survey->title}",
            'institution_id' => $request->user()->institution_id
        ]);

        // Log audit
        SurveyAuditLog::create([
            'survey_id' => $survey->id,
            'user_id' => $request->user()->id,
            'action' => 'published',
            'details' => [
                'published_at' => $survey->published_at,
                'target_institutions_count' => count($survey->target_institutions)
            ],
            'ip_address' => $request->ip(),
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Survey published successfully',
            'survey' => $this->formatSurvey($survey)
        ]);
    }

    /**
     * Close survey
     */
    public function close(Request $request, Survey $survey): JsonResponse
    {
        // Check permissions
        if ($survey->creator_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You can only close your own surveys'
            ], 403);
        }

        if ($survey->status !== 'published') {
            return response()->json([
                'message' => 'Only published surveys can be closed'
            ], 422);
        }

        $survey->update(['status' => 'closed']);

        // Log activity
        ActivityLog::logActivity([
            'user_id' => $request->user()->id,
            'activity_type' => 'survey_close',
            'entity_type' => 'Survey',
            'entity_id' => $survey->id,
            'description' => "Closed survey: {$survey->title}",
            'institution_id' => $request->user()->institution_id
        ]);

        // Log audit
        SurveyAuditLog::create([
            'survey_id' => $survey->id,
            'user_id' => $request->user()->id,
            'action' => 'closed',
            'details' => [
                'response_count' => $survey->responses()->count(),
                'completion_rate' => $survey->completion_percentage
            ],
            'ip_address' => $request->ip(),
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Survey closed successfully',
            'survey' => $this->formatSurvey($survey)
        ]);
    }

    /**
     * Get survey statistics
     */
    public function statistics(Request $request, Survey $survey): JsonResponse
    {
        $userInstitutionId = $request->user()->institution_id;
        $canView = $survey->status === 'published' || 
                   $survey->creator_id === $request->user()->id ||
                   ($userInstitutionId && in_array($userInstitutionId, $survey->target_institutions ?? []));

        if (!$canView) {
            return response()->json([
                'message' => 'You do not have permission to view this survey statistics'
            ], 403);
        }

        $stats = [
            'overview' => [
                'total_targets' => count($survey->target_institutions),
                'total_responses' => $survey->responses()->count(),
                'completed_responses' => $survey->responses()->completed()->count(),
                'completion_rate' => $survey->completion_percentage,
                'average_progress' => $survey->responses()->avg('progress_percentage') ?? 0
            ],
            'by_status' => $survey->responses()
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray(),
            'by_institution' => $survey->responses()
                ->join('institutions', 'survey_responses.institution_id', '=', 'institutions.id')
                ->selectRaw('institutions.name, COUNT(*) as responses, AVG(survey_responses.progress_percentage) as avg_progress')
                ->groupBy('institutions.id', 'institutions.name')
                ->get()
                ->toArray(),
            'timeline' => $survey->responses()
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->toArray()
        ];

        return response()->json(['statistics' => $stats]);
    }

    /**
     * Estimate survey recipients based on targeting
     */
    public function estimateRecipients(Request $request): JsonResponse
    {
        $request->validate([
            'target_institutions' => 'required|array',
            'target_institutions.*' => 'integer|exists:institutions,id',
            'target_departments' => 'nullable|array',
            'target_departments.*' => 'integer|exists:departments,id',
            'target_user_types' => 'nullable|array',
            'target_user_types.*' => 'string'
        ]);

        try {
            $estimatedUsers = 0;
            $targetInstitutions = $request->target_institutions;
            $targetDepartments = $request->target_departments ?? [];
            $targetUserTypes = $request->target_user_types ?? [];

            // Count users in target institutions
            $institutionUserQuery = \App\Models\User::whereIn('institution_id', $targetInstitutions)
                ->where('is_active', true);

            // Filter by departments if specified
            if (!empty($targetDepartments)) {
                $institutionUserQuery->whereHas('departments', function ($query) use ($targetDepartments) {
                    $query->whereIn('departments.id', $targetDepartments);
                });
            }

            // Filter by user types/roles if specified
            if (!empty($targetUserTypes)) {
                $institutionUserQuery->whereHas('roles', function ($query) use ($targetUserTypes) {
                    $query->whereIn('name', $targetUserTypes);
                });
            }

            $estimatedUsers = $institutionUserQuery->count();

            // Get breakdown by institution
            $institutionBreakdown = [];
            foreach ($targetInstitutions as $institutionId) {
                $institutionQuery = \App\Models\User::where('institution_id', $institutionId)
                    ->where('is_active', true);

                if (!empty($targetDepartments)) {
                    $institutionQuery->whereHas('departments', function ($query) use ($targetDepartments) {
                        $query->whereIn('departments.id', $targetDepartments);
                    });
                }

                if (!empty($targetUserTypes)) {
                    $institutionQuery->whereHas('roles', function ($query) use ($targetUserTypes) {
                        $query->whereIn('name', $targetUserTypes);
                    });
                }

                $userCount = $institutionQuery->count();
                $institution = \App\Models\Institution::find($institutionId);

                $institutionBreakdown[] = [
                    'institution_id' => $institutionId,
                    'institution_name' => $institution->name,
                    'estimated_users' => $userCount
                ];
            }

            // Get breakdown by role
            $roleBreakdown = [];
            if (!empty($targetUserTypes)) {
                foreach ($targetUserTypes as $roleName) {
                    $roleUserQuery = \App\Models\User::whereIn('institution_id', $targetInstitutions)
                        ->where('is_active', true)
                        ->whereHas('roles', function ($query) use ($roleName) {
                            $query->where('name', $roleName);
                        });

                    if (!empty($targetDepartments)) {
                        $roleUserQuery->whereHas('departments', function ($query) use ($targetDepartments) {
                            $query->whereIn('departments.id', $targetDepartments);
                        });
                    }

                    $roleBreakdown[] = [
                        'role' => $roleName,
                        'estimated_users' => $roleUserQuery->count()
                    ];
                }
            }

            return response()->json([
                'estimated_users' => $estimatedUsers,
                'breakdown' => [
                    'by_institution' => $institutionBreakdown,
                    'by_role' => $roleBreakdown,
                    'total_institutions' => count($targetInstitutions),
                    'total_departments' => count($targetDepartments)
                ],
                'targeting_summary' => [
                    'institutions' => count($targetInstitutions),
                    'departments' => count($targetDepartments),
                    'user_types' => count($targetUserTypes)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error estimating recipients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format survey for response
     */
    private function formatSurvey($survey): array
    {
        return [
            'id' => $survey->id,
            'title' => $survey->title,
            'description' => $survey->description,
            'status' => $survey->status,
            'survey_type' => $survey->survey_type,
            'is_anonymous' => $survey->is_anonymous,
            'allow_multiple_responses' => $survey->allow_multiple_responses,
            'start_date' => $survey->start_date,
            'end_date' => $survey->end_date,
            'published_at' => $survey->published_at,
            'response_count' => $survey->response_count,
            'completion_percentage' => $survey->completion_percentage,
            'is_active' => $survey->isActive(),
            'is_open_for_responses' => $survey->isOpenForResponses(),
            'has_expired' => $survey->hasExpired(),
            'created_at' => $survey->created_at,
            'updated_at' => $survey->updated_at,
            'creator' => [
                'id' => $survey->creator->id,
                'username' => $survey->creator->username,
                'name' => $survey->creator->profile?->full_name ?? $survey->creator->username
            ]
        ];
    }
}