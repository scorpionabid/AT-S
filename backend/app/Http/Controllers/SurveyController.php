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
     * Delete survey (soft delete by deactivating or hard delete by removal)
     */
    public function destroy(Request $request, Survey $survey): JsonResponse
    {
        // Check permissions
        if ($survey->creator_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You can only delete your own surveys'
            ], 403);
        }

        $deleteType = $request->query('type', 'soft');
        $oldData = $survey->toArray();

        try {
            DB::beginTransaction();

            if ($deleteType === 'hard') {
                // Hard delete - permanent removal
                // Cannot permanently delete surveys with responses
                if ($survey->responses()->count() > 0) {
                    return response()->json([
                        'message' => 'Cannot permanently delete survey that has responses. Use soft delete instead.'
                    ], 422);
                }

                $surveyTitle = $survey->title;
                $survey->delete();

                // Log hard delete activity
                ActivityLog::logActivity([
                    'user_id' => $request->user()->id,
                    'activity_type' => 'survey_hard_delete',
                    'entity_type' => 'Survey',
                    'entity_id' => $survey->id,
                    'description' => "Permanently deleted survey: {$surveyTitle}",
                    'before_state' => $oldData,
                    'institution_id' => $request->user()->institution_id
                ]);

                $message = "Survey '{$surveyTitle}' permanently deleted successfully";
            } else {
                // Soft delete - deactivate survey
                $survey->update([
                    'status' => 'archived',
                    'is_active' => false,
                    'deleted_at' => now()
                ]);

                // Log soft delete activity
                ActivityLog::logActivity([
                    'user_id' => $request->user()->id,
                    'activity_type' => 'survey_soft_delete',
                    'entity_type' => 'Survey',
                    'entity_id' => $survey->id,
                    'description' => "Archived survey: {$survey->title}",
                    'before_state' => $oldData,
                    'after_state' => $survey->toArray(),
                    'institution_id' => $request->user()->institution_id
                ]);

                $message = "Survey '{$survey->title}' archived successfully";
            }

            DB::commit();

            return response()->json([
                'message' => $message
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Survey deletion failed',
                'error' => $e->getMessage()
            ], 500);
        }
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
     * Bulk Operations for Surveys
     */
    public function bulkPublish(Request $request): JsonResponse
    {
        $request->validate([
            'survey_ids' => 'required|array|min:1',
            'survey_ids.*' => 'integer|exists:surveys,id'
        ]);

        try {
            DB::beginTransaction();

            $surveys = Survey::whereIn('id', $request->survey_ids)
                ->where('creator_id', $request->user()->id)
                ->where('status', 'draft')
                ->get();

            if ($surveys->isEmpty()) {
                return response()->json([
                    'message' => 'No valid surveys found for bulk publish operation'
                ], 422);
            }

            $publishedCount = 0;
            $errors = [];

            foreach ($surveys as $survey) {
                try {
                    $survey->update([
                        'status' => 'published',
                        'published_at' => now()
                    ]);

                    // Log audit
                    SurveyAuditLog::create([
                        'survey_id' => $survey->id,
                        'user_id' => $request->user()->id,
                        'action' => 'bulk_published',
                        'details' => [
                            'bulk_operation_id' => uniqid(),
                            'published_at' => $survey->published_at
                        ],
                        'ip_address' => $request->ip(),
                        'created_at' => now()
                    ]);

                    $publishedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Survey '{$survey->title}': {$e->getMessage()}";
                }
            }

            DB::commit();

            return response()->json([
                'message' => "Successfully published {$publishedCount} surveys",
                'published_count' => $publishedCount,
                'total_count' => count($request->survey_ids),
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk publish operation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkClose(Request $request): JsonResponse
    {
        $request->validate([
            'survey_ids' => 'required|array|min:1',
            'survey_ids.*' => 'integer|exists:surveys,id'
        ]);

        try {
            DB::beginTransaction();

            $surveys = Survey::whereIn('id', $request->survey_ids)
                ->where('creator_id', $request->user()->id)
                ->where('status', 'published')
                ->get();

            if ($surveys->isEmpty()) {
                return response()->json([
                    'message' => 'No valid surveys found for bulk close operation'
                ], 422);
            }

            $closedCount = 0;
            $errors = [];

            foreach ($surveys as $survey) {
                try {
                    $survey->update(['status' => 'closed']);

                    SurveyAuditLog::create([
                        'survey_id' => $survey->id,
                        'user_id' => $request->user()->id,
                        'action' => 'bulk_closed',
                        'details' => [
                            'bulk_operation_id' => uniqid(),
                            'response_count' => $survey->responses()->count()
                        ],
                        'ip_address' => $request->ip(),
                        'created_at' => now()
                    ]);

                    $closedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Survey '{$survey->title}': {$e->getMessage()}";
                }
            }

            DB::commit();

            return response()->json([
                'message' => "Successfully closed {$closedCount} surveys",
                'closed_count' => $closedCount,
                'total_count' => count($request->survey_ids),
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk close operation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkArchive(Request $request): JsonResponse
    {
        $request->validate([
            'survey_ids' => 'required|array|min:1',
            'survey_ids.*' => 'integer|exists:surveys,id'
        ]);

        try {
            DB::beginTransaction();

            $surveys = Survey::whereIn('id', $request->survey_ids)
                ->where('creator_id', $request->user()->id)
                ->whereIn('status', ['closed', 'published'])
                ->get();

            if ($surveys->isEmpty()) {
                return response()->json([
                    'message' => 'No valid surveys found for bulk archive operation'
                ], 422);
            }

            $archivedCount = 0;
            $errors = [];

            foreach ($surveys as $survey) {
                try {
                    $survey->update([
                        'status' => 'archived',
                        'archived_at' => now()
                    ]);

                    SurveyAuditLog::create([
                        'survey_id' => $survey->id,
                        'user_id' => $request->user()->id,
                        'action' => 'bulk_archived',
                        'details' => [
                            'bulk_operation_id' => uniqid(),
                            'archived_at' => $survey->archived_at,
                            'final_response_count' => $survey->responses()->count()
                        ],
                        'ip_address' => $request->ip(),
                        'created_at' => now()
                    ]);

                    $archivedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Survey '{$survey->title}': {$e->getMessage()}";
                }
            }

            DB::commit();

            return response()->json([
                'message' => "Successfully archived {$archivedCount} surveys",
                'archived_count' => $archivedCount,
                'total_count' => count($request->survey_ids),
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk archive operation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'survey_ids' => 'required|array|min:1',
            'survey_ids.*' => 'integer|exists:surveys,id',
            'confirm_delete' => 'required|boolean|accepted'
        ]);

        try {
            DB::beginTransaction();

            $surveys = Survey::whereIn('id', $request->survey_ids)
                ->where('creator_id', $request->user()->id)
                ->where(function ($query) {
                    // Only allow deletion of drafts or surveys with no responses
                    $query->where('status', 'draft')
                          ->orWhereDoesntHave('responses');
                })
                ->get();

            if ($surveys->isEmpty()) {
                return response()->json([
                    'message' => 'No valid surveys found for bulk delete operation'
                ], 422);
            }

            $deletedCount = 0;
            $errors = [];

            foreach ($surveys as $survey) {
                try {
                    // Log audit before deletion
                    SurveyAuditLog::create([
                        'survey_id' => $survey->id,
                        'user_id' => $request->user()->id,
                        'action' => 'bulk_deleted',
                        'details' => [
                            'bulk_operation_id' => uniqid(),
                            'survey_title' => $survey->title,
                            'survey_status' => $survey->status
                        ],
                        'ip_address' => $request->ip(),
                        'created_at' => now()
                    ]);

                    $survey->delete();
                    $deletedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Survey '{$survey->title}': {$e->getMessage()}";
                }
            }

            DB::commit();

            return response()->json([
                'message' => "Successfully deleted {$deletedCount} surveys",
                'deleted_count' => $deletedCount,
                'total_count' => count($request->survey_ids),
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Bulk delete operation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enhanced Survey Statistics Dashboard
     */
    public function dashboardStatistics(Request $request): JsonResponse
    {
        $user = $request->user();
        $userInstitutionId = $user->institution_id;

        try {
            // Base query for user's accessible surveys
            $surveysQuery = Survey::query();
            
            // Filter based on user role and permissions
            if ($user->hasRole(['superadmin', 'regionadmin'])) {
                // Admins can see all surveys in their region/system
                if ($user->hasRole('regionadmin') && $userInstitutionId) {
                    $surveysQuery->where(function ($query) use ($userInstitutionId, $user) {
                        $query->where('creator_id', $user->id)
                              ->orWhereJsonContains('target_institutions', $userInstitutionId);
                    });
                }
                // superadmin sees all surveys (no additional filter)
            } else {
                // Regular users see surveys they created or can respond to
                $surveysQuery->where(function ($query) use ($user, $userInstitutionId) {
                    $query->where('creator_id', $user->id);
                    if ($userInstitutionId) {
                        $query->orWhereJsonContains('target_institutions', $userInstitutionId);
                    }
                });
            }

            // Overall statistics
            $totalSurveys = (clone $surveysQuery)->count();
            $activeSurveys = (clone $surveysQuery)->where('status', 'published')
                ->where(function ($query) {
                    $query->whereNull('end_date')
                          ->orWhere('end_date', '>', now());
                })->count();
            $draftSurveys = (clone $surveysQuery)->where('status', 'draft')->count();
            $closedSurveys = (clone $surveysQuery)->where('status', 'closed')->count();
            $archivedSurveys = (clone $surveysQuery)->where('status', 'archived')->count();

            // My surveys (surveys I created)
            $mySurveys = (clone $surveysQuery)->where('creator_id', $user->id)->count();
            $myActiveSurveys = (clone $surveysQuery)->where('creator_id', $user->id)
                ->where('status', 'published')->count();

            // Response statistics for surveys I created
            $myTotalResponses = \App\Models\SurveyResponse::whereHas('survey', function ($query) use ($user) {
                $query->where('creator_id', $user->id);
            })->count();

            $myCompletedResponses = \App\Models\SurveyResponse::whereHas('survey', function ($query) use ($user) {
                $query->where('creator_id', $user->id);
            })->where('is_complete', true)->count();

            // Recent activity
            $recentSurveys = (clone $surveysQuery)->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($survey) {
                    return $this->formatSurvey($survey);
                });

            // Status breakdown
            $statusBreakdown = (clone $surveysQuery)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            // Type breakdown
            $typeBreakdown = (clone $surveysQuery)
                ->selectRaw('survey_type, COUNT(*) as count')
                ->groupBy('survey_type')
                ->pluck('count', 'survey_type')
                ->toArray();

            // Monthly creation trend (last 6 months) - SQLite compatible
            $monthlyTrend = (clone $surveysQuery)
                ->selectRaw('strftime("%Y-%m", created_at) as month, COUNT(*) as count')
                ->where('created_at', '>=', now()->subMonths(6))
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->toArray();

            // Response rate statistics
            $avgResponseRate = (clone $surveysQuery)
                ->where('status', '!=', 'draft')
                ->avg('completion_percentage') ?? 0;

            // Surveys requiring attention (low response rates, expired, etc.)
            $surveysNeedingAttention = (clone $surveysQuery)
                ->where('creator_id', $user->id)
                ->where('status', 'published')
                ->where(function ($query) {
                    $query->where('completion_percentage', '<', 50)
                          ->orWhere('end_date', '<', now())
                          ->orWhere('end_date', '<=', now()->addDays(3));
                })
                ->limit(10)
                ->get()
                ->map(function ($survey) {
                    return $this->formatSurvey($survey);
                });

            return response()->json([
                'overview' => [
                    'total_surveys' => $totalSurveys,
                    'active_surveys' => $activeSurveys,
                    'draft_surveys' => $draftSurveys,
                    'closed_surveys' => $closedSurveys,
                    'archived_surveys' => $archivedSurveys,
                    'my_surveys' => $mySurveys,
                    'my_active_surveys' => $myActiveSurveys,
                ],
                'response_stats' => [
                    'total_responses' => $myTotalResponses,
                    'completed_responses' => $myCompletedResponses,
                    'completion_rate' => $myTotalResponses > 0 ? round(($myCompletedResponses / $myTotalResponses) * 100, 1) : 0,
                    'average_response_rate' => round($avgResponseRate, 1)
                ],
                'breakdowns' => [
                    'by_status' => $statusBreakdown,
                    'by_type' => $typeBreakdown,
                    'monthly_trend' => $monthlyTrend
                ],
                'recent_surveys' => $recentSurveys,
                'attention_needed' => $surveysNeedingAttention,
                'user_context' => [
                    'user_id' => $user->id,
                    'user_role' => $user->getRoleNames()->first(),
                    'institution_id' => $userInstitutionId,
                    'can_create_surveys' => $user->can('create_surveys'),
                    'can_manage_all_surveys' => $user->hasRole(['superadmin', 'regionadmin'])
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching survey statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Advanced Survey Analytics
     */
    public function analytics(Request $request, Survey $survey): JsonResponse
    {
        // Check permissions
        $userInstitutionId = $request->user()->institution_id;
        $canView = $survey->creator_id === $request->user()->id ||
                   $request->user()->hasRole(['superadmin', 'regionadmin']) ||
                   ($userInstitutionId && in_array($userInstitutionId, $survey->target_institutions ?? []));

        if (!$canView) {
            return response()->json([
                'message' => 'You do not have permission to view analytics for this survey'
            ], 403);
        }

        try {
            // Response metrics
            $responses = $survey->responses();
            $totalResponses = $responses->count();
            $completedResponses = $responses->where('is_complete', true)->count();
            $inProgressResponses = $responses->where('is_complete', false)->count();

            // Completion metrics
            $avgCompletionTime = $responses->where('is_complete', true)
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, completed_at)) as avg_time')
                ->value('avg_time') ?? 0;

            // Response timeline
            $responseTimeline = $responses
                ->selectRaw('DATE(created_at) as date, COUNT(*) as responses, 
                           SUM(CASE WHEN is_complete = 1 THEN 1 ELSE 0 END) as completed')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->toArray();

            // Institution breakdown
            $institutionBreakdown = $responses
                ->join('institutions', 'survey_responses.institution_id', '=', 'institutions.id')
                ->selectRaw('institutions.name as institution, 
                           COUNT(*) as total_responses,
                           SUM(CASE WHEN survey_responses.is_complete = 1 THEN 1 ELSE 0 END) as completed,
                           AVG(survey_responses.progress_percentage) as avg_progress')
                ->groupBy('institutions.id', 'institutions.name')
                ->get()
                ->toArray();

            // Department breakdown (if departments are targeted)
            $departmentBreakdown = [];
            if (!empty($survey->target_departments)) {
                $departmentBreakdown = $responses
                    ->join('users', 'survey_responses.user_id', '=', 'users.id')
                    ->join('user_departments', 'users.id', '=', 'user_departments.user_id')
                    ->join('departments', 'user_departments.department_id', '=', 'departments.id')
                    ->selectRaw('departments.name as department,
                               COUNT(*) as total_responses,
                               SUM(CASE WHEN survey_responses.is_complete = 1 THEN 1 ELSE 0 END) as completed,
                               AVG(survey_responses.progress_percentage) as avg_progress')
                    ->groupBy('departments.id', 'departments.name')
                    ->get()
                    ->toArray();
            }

            // Question-level analytics
            $questionAnalytics = [];
            if ($survey->structure && isset($survey->structure['sections'])) {
                foreach ($survey->structure['sections'] as $sectionIndex => $section) {
                    foreach ($section['questions'] as $questionIndex => $question) {
                        $questionKey = "section_{$sectionIndex}_question_{$questionIndex}";
                        
                        // Count how many responses answered this question
                        $answeredCount = $responses->whereJsonContains('response_data', [$questionKey => []])->count();
                        
                        $questionAnalytics[] = [
                            'section' => $section['title'] ?? "Section " . ($sectionIndex + 1),
                            'question' => $question['question'],
                            'type' => $question['type'],
                            'required' => $question['required'] ?? false,
                            'answered_count' => $answeredCount,
                            'answer_rate' => $totalResponses > 0 ? round(($answeredCount / $totalResponses) * 100, 1) : 0
                        ];
                    }
                }
            }

            // Performance insights
            $insights = [];
            
            // Low completion rate insight
            if ($survey->completion_percentage < 50 && $totalResponses > 5) {
                $insights[] = [
                    'type' => 'warning',
                    'title' => 'Low Completion Rate',
                    'message' => "Only {$survey->completion_percentage}% of respondents complete this survey. Consider reviewing question complexity or survey length.",
                    'action' => 'review_structure'
                ];
            }

            // High drop-off insight
            if ($inProgressResponses > $completedResponses && $totalResponses > 10) {
                $dropOffRate = round(($inProgressResponses / $totalResponses) * 100, 1);
                $insights[] = [
                    'type' => 'info',
                    'title' => 'High Drop-off Rate',
                    'message' => "{$dropOffRate}% of respondents start but don't finish the survey.",
                    'action' => 'analyze_questions'
                ];
            }

            // Time-based insights
            if ($survey->end_date && $survey->end_date < now()) {
                $insights[] = [
                    'type' => 'error',
                    'title' => 'Survey Expired',
                    'message' => 'This survey has passed its end date. No new responses will be accepted.',
                    'action' => 'extend_or_close'
                ];
            }

            return response()->json([
                'survey_info' => [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'status' => $survey->status,
                    'type' => $survey->survey_type,
                    'start_date' => $survey->start_date,
                    'end_date' => $survey->end_date
                ],
                'response_metrics' => [
                    'total_responses' => $totalResponses,
                    'completed_responses' => $completedResponses,
                    'in_progress_responses' => $inProgressResponses,
                    'completion_rate' => $survey->completion_percentage,
                    'avg_completion_time_minutes' => round($avgCompletionTime, 1)
                ],
                'timeline' => $responseTimeline,
                'breakdowns' => [
                    'by_institution' => $institutionBreakdown,
                    'by_department' => $departmentBreakdown
                ],
                'question_analytics' => $questionAnalytics,
                'insights' => $insights,
                'generated_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error generating survey analytics',
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