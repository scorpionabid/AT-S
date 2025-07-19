<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\Auth\DeviceController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\SurveyResponseController;
use App\Http\Controllers\SurveyTargetingController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentUploadController;
use App\Http\Controllers\DocumentAnalyticsController;
use App\Http\Controllers\DocumentShareController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\InstitutionHierarchyController;
use App\Http\Controllers\InstitutionDepartmentController;
use App\Http\Controllers\NavigationController;
use App\Http\Controllers\RegionAdmin\RegionAdminDashboardController;
use App\Http\Controllers\RegionAdmin\RegionAdminInstitutionController;
use App\Http\Controllers\RegionAdmin\RegionAdminUserController;
use App\Http\Controllers\RegionAdmin\RegionAdminSurveyController;
use App\Http\Controllers\RegionAdmin\RegionAdminReportsController;
use App\Http\Controllers\RegionOperator\RegionOperatorDashboardController;
use App\Http\Controllers\SektorAdmin\SektorAdminDashboardController;
use App\Http\Controllers\MektebAdmin\MektebAdminDashboardController;
use App\Http\Controllers\DocumentControllerRefactored;
use App\Http\Controllers\InstitutionControllerRefactored;
use App\Http\Controllers\ClassAttendanceController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\API\ClassAttendanceApiController;
use App\Http\Controllers\API\ApprovalApiController;
use App\Http\Controllers\API\TeachingLoadApiController;
use App\Http\Controllers\API\ScheduleApiController;
// use App\Http\Controllers\UserPreferencesController;
use Illuminate\Support\Facades\Route;

// Test route
Route::get('test', function () {
    return response()->json(['message' => 'API working', 'timestamp' => now()]);
});

// Public routes
Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('register', [PasswordController::class, 'register']);

// Setup wizard routes (public for initial setup)
Route::prefix('setup')->group(function () {
    Route::get('status', [App\Http\Controllers\SetupWizardController::class, 'checkSetupStatus']);
    Route::post('initialize', [App\Http\Controllers\SetupWizardController::class, 'initializeSystem']);
    Route::post('sample-structure', [App\Http\Controllers\SetupWizardController::class, 'createSampleStructure']);
    Route::get('validate', [App\Http\Controllers\SetupWizardController::class, 'validateSystemData']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('refresh-token', [AuthController::class, 'refresh']);
    
    // User Preferences Management
    Route::prefix('user')->group(function () {
        // Route::get('preferences', [UserPreferencesController::class, 'getPreferences']);
        // Route::put('preferences', [UserPreferencesController::class, 'updatePreferences']);
        // Route::post('preferences/reset', [UserPreferencesController::class, 'resetPreferences']);
        // Route::put('theme', [UserPreferencesController::class, 'updateTheme']);
        // Route::put('language', [UserPreferencesController::class, 'updateLanguage']);
        // Route::put('layout', [UserPreferencesController::class, 'updateLayout']);
        // Route::get('ui-settings', [UserPreferencesController::class, 'getUISettings']);
    });
    
    // Password management
    Route::post('change-password', [PasswordController::class, 'changePassword']);
    Route::post('users/{user}/reset-password', [PasswordController::class, 'resetPassword'])->middleware('permission:users.update');
    
    // Session management
    Route::get('sessions', [SessionController::class, 'index']);
    Route::delete('sessions/{sessionId}', [SessionController::class, 'revoke']);
    Route::delete('sessions/others', [SessionController::class, 'revokeOthers']);
    Route::delete('sessions/all', [SessionController::class, 'revokeAll']);
    Route::get('sessions/stats', [SessionController::class, 'stats']);
    
    // Device management
    Route::get('devices', [DeviceController::class, 'index']);
    Route::post('devices', [DeviceController::class, 'register']);
    Route::put('devices/{deviceId}', [DeviceController::class, 'update']);
    Route::delete('devices/{deviceId}', [DeviceController::class, 'destroy']);
    Route::get('devices/stats', [DeviceController::class, 'stats']);

    // Test role endpoints
    Route::get('test/superadmin', function () {
        return response()->json(['message' => 'SuperAdmin access successful', 'user' => auth()->user()->username]);
    })->middleware('role:superadmin');
    
    Route::get('test/regionadmin', function () {
        return response()->json(['message' => 'RegionAdmin access successful', 'user' => auth()->user()->username]);
    })->middleware('role:regionadmin|superadmin');
    
    Route::get('test/teacher', function () {
        return response()->json(['message' => 'Teacher access successful', 'user' => auth()->user()->username]);
    })->middleware('role:müəllim|regionadmin|superadmin');

    // User management with proper roles
    Route::get('users', [UserController::class, 'index'])->middleware('permission:users.read');
    Route::post('users', [UserController::class, 'store'])->middleware(['permission:users.create', 'audit.logging']);
    Route::get('users/{user}', [UserController::class, 'show'])->middleware('permission:users.read');
    Route::put('users/{user}', [UserController::class, 'update'])->middleware(['permission:users.update', 'audit.logging']);
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware(['permission:users.delete', 'audit.logging']);
    
    // User bulk operations
    Route::post('users/bulk/activate', [UserController::class, 'bulkActivate'])->middleware('permission:users.update');
    Route::post('users/bulk/deactivate', [UserController::class, 'bulkDeactivate'])->middleware('permission:users.update');
    Route::post('users/bulk/assign-role', [UserController::class, 'bulkAssignRole'])->middleware('permission:users.update');
    Route::post('users/bulk/assign-institution', [UserController::class, 'bulkAssignInstitution'])->middleware('permission:users.update');
    Route::post('users/bulk/delete', [UserController::class, 'bulkDelete'])->middleware('permission:users.delete');
    Route::post('users/export', [UserController::class, 'exportUsers'])->middleware('permission:users.read');
    Route::get('users/bulk/statistics', [UserController::class, 'getBulkStatistics'])->middleware('permission:users.read');
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->middleware('permission:users.update');
    
    // Users helper endpoints
    Route::get('users/institutions/available', [UserController::class, 'getAvailableInstitutions'])->middleware('permission:users.read');

    // Institution bulk operations (must be before parameterized routes)
    Route::post('institutions/bulk/activate', [App\Http\Controllers\InstitutionController::class, 'bulkActivate'])->middleware('permission:institutions.update');
    Route::post('institutions/bulk/deactivate', [App\Http\Controllers\InstitutionController::class, 'bulkDeactivate'])->middleware('permission:institutions.update');
    Route::post('institutions/bulk/delete', [App\Http\Controllers\InstitutionController::class, 'bulkDelete'])->middleware('permission:institutions.delete');
    Route::post('institutions/bulk/restore', [App\Http\Controllers\InstitutionController::class, 'bulkRestore'])->middleware('permission:institutions.update');
    Route::post('institutions/bulk/export', [App\Http\Controllers\InstitutionController::class, 'bulkExport'])->middleware('permission:institutions.read');
    Route::post('institutions/bulk/assign-parent', [App\Http\Controllers\InstitutionController::class, 'bulkAssignParent'])->middleware('permission:institutions.update');
    Route::post('institutions/bulk/update-type', [App\Http\Controllers\InstitutionController::class, 'bulkUpdateType'])->middleware('permission:institutions.update');
    Route::post('institutions/export', [App\Http\Controllers\InstitutionController::class, 'exportInstitutions'])->middleware('permission:institutions.read');
    Route::get('institutions/bulk/statistics', [App\Http\Controllers\InstitutionController::class, 'getBulkStatistics'])->middleware('permission:institutions.read');
    // Institution management - Core operations
    Route::get('institutions', [InstitutionController::class, 'index'])->middleware('permission:institutions.read');
    Route::post('institutions', [InstitutionController::class, 'store'])->middleware(['permission:institutions.create', 'audit.logging']);
    Route::get('institutions/{institution}', [InstitutionController::class, 'show'])->middleware('permission:institutions.read');
    Route::put('institutions/{institution}', [InstitutionController::class, 'update'])->middleware(['permission:institutions.update', 'audit.logging']);
    Route::delete('institutions/{institution}', [InstitutionController::class, 'destroy'])->middleware(['permission:institutions.delete', 'audit.logging']);
    Route::get('institutions/types', [InstitutionController::class, 'getTypes'])->middleware('permission:institutions.read');
    Route::get('institutions/statistics', [InstitutionController::class, 'getStatistics'])->middleware('permission:institutions.read');
    
    // Institution soft delete management
    Route::get('institutions/trashed', [InstitutionController::class, 'trashed'])->middleware('permission:institutions.read');
    Route::put('institutions/{id}/restore', [InstitutionController::class, 'restore'])->middleware(['permission:institutions.update', 'audit.logging']);
    Route::delete('institutions/{id}/force-delete', [InstitutionController::class, 'forceDelete'])->middleware(['permission:institutions.delete', 'audit.logging']);
    
    // Institution audit logs
    Route::get('institutions/audit-logs', [App\Http\Controllers\InstitutionAuditLogController::class, 'index'])->middleware('permission:institutions.read');
    Route::get('institutions/{institutionId}/audit-logs', [App\Http\Controllers\InstitutionAuditLogController::class, 'show'])->middleware('permission:institutions.read');
    Route::get('institutions/audit-logs/statistics', [App\Http\Controllers\InstitutionAuditLogController::class, 'statistics'])->middleware('permission:institutions.read');

    // Institution hierarchy management
    Route::get('institutions-hierarchy', [InstitutionHierarchyController::class, 'getHierarchy'])->middleware('permission:institutions.read');
    Route::get('institutions/{institution}/subtree', [InstitutionHierarchyController::class, 'getSubTree'])->middleware('permission:institutions.read');
    Route::get('institutions/{institution}/path', [InstitutionHierarchyController::class, 'getPath'])->middleware('permission:institutions.read');
    Route::post('institutions/{institution}/move', [InstitutionHierarchyController::class, 'moveInstitution'])->middleware(['permission:institutions.update', 'audit.logging']);
    Route::get('institutions/level/{level}', [InstitutionHierarchyController::class, 'getByLevel'])->middleware('permission:institutions.read');
    Route::get('institutions-hierarchy/validate', [InstitutionHierarchyController::class, 'validateHierarchy'])->middleware('permission:institutions.read');

    // Institution department management
    Route::get('institutions/{institution}/departments', [InstitutionDepartmentController::class, 'index'])->middleware('permission:institutions.read');
    Route::post('institutions/{institution}/departments', [InstitutionDepartmentController::class, 'store'])->middleware(['permission:institutions.create', 'audit.logging']);
    Route::get('institutions/{institution}/departments/{department}', [InstitutionDepartmentController::class, 'show'])->middleware('permission:institutions.read');
    Route::put('institutions/{institution}/departments/{department}', [InstitutionDepartmentController::class, 'update'])->middleware(['permission:institutions.update', 'audit.logging']);
    Route::delete('institutions/{institution}/departments/{department}', [InstitutionDepartmentController::class, 'destroy'])->middleware(['permission:institutions.delete', 'audit.logging']);
    Route::get('institutions/{institution}/departments/statistics', [InstitutionDepartmentController::class, 'getStatistics'])->middleware('permission:institutions.read');
    Route::post('institutions/{institution}/departments/{department}/move-users', [InstitutionDepartmentController::class, 'moveUsers'])->middleware(['permission:institutions.update', 'audit.logging']);
    Route::get('departments/types', [InstitutionDepartmentController::class, 'getTypes'])->middleware('permission:institutions.read');

    // Department management
    Route::get('departments', [DepartmentController::class, 'index'])->middleware('permission:institutions.read');
    Route::post('departments', [DepartmentController::class, 'store'])->middleware('permission:institutions.create');
    Route::get('departments/{department}', [DepartmentController::class, 'show'])->middleware('permission:institutions.read');
    Route::put('departments/{department}', [DepartmentController::class, 'update'])->middleware('permission:institutions.update');
    Route::delete('departments/{department}', [DepartmentController::class, 'destroy'])->middleware('permission:institutions.delete');
    Route::get('departments/types/institution', [DepartmentController::class, 'getTypesForInstitution'])->middleware('permission:institutions.read');

    // Role management
    Route::get('roles', [RoleController::class, 'index'])->middleware('permission:roles.read');
    Route::post('roles', [RoleController::class, 'store'])->middleware(['permission:roles.create', 'audit.logging']);
    Route::get('roles/{role}', [RoleController::class, 'show'])->middleware('permission:roles.read');
    Route::put('roles/{role}', [RoleController::class, 'update'])->middleware(['permission:roles.update', 'audit.logging']);
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->middleware(['permission:roles.delete', 'audit.logging']);
    Route::get('permissions', [RoleController::class, 'permissions'])->middleware('permission:roles.read');
    
    // Enhanced role hierarchy routes
    Route::get('roles/hierarchy', [RoleController::class, 'hierarchy'])->middleware('permission:roles.read');
    Route::get('roles/level/{level}/available', [RoleController::class, 'availableForLevel'])->middleware('permission:roles.create');

    // Survey management
    Route::get('surveys', [SurveyController::class, 'index'])->middleware('permission:surveys.read');
    Route::post('surveys', [SurveyController::class, 'store'])->middleware('permission:surveys.create');
    Route::get('surveys/{survey}', [SurveyController::class, 'show'])->middleware('permission:surveys.read');
    Route::put('surveys/{survey}', [SurveyController::class, 'update'])->middleware('permission:surveys.update');
    Route::delete('surveys/{survey}', [SurveyController::class, 'destroy'])->middleware('permission:surveys.delete');
    
    // Enhanced Survey Analytics & Statistics (must be before {survey} routes)
    Route::get('surveys/dashboard/statistics', [SurveyController::class, 'dashboardStatistics'])->middleware('permission:surveys.read');
    Route::post('surveys/estimate-recipients', [SurveyController::class, 'estimateRecipients'])->middleware('permission:surveys.create');
    
    // Survey actions
    Route::post('surveys/{survey}/publish', [SurveyController::class, 'publish'])->middleware('permission:surveys.publish');
    Route::post('surveys/{survey}/close', [SurveyController::class, 'close'])->middleware('permission:surveys.manage');
    Route::get('surveys/{survey}/statistics', [SurveyController::class, 'statistics'])->middleware('permission:surveys.read');
    Route::get('surveys/{survey}/analytics', [SurveyController::class, 'analytics'])->middleware('permission:surveys.read');
    
    // Bulk Survey Operations
    Route::post('surveys/bulk/publish', [SurveyController::class, 'bulkPublish'])->middleware('permission:surveys.publish');
    Route::post('surveys/bulk/close', [SurveyController::class, 'bulkClose'])->middleware('permission:surveys.manage');
    Route::post('surveys/bulk/archive', [SurveyController::class, 'bulkArchive'])->middleware('permission:surveys.manage');
    Route::post('surveys/bulk/delete', [SurveyController::class, 'bulkDelete'])->middleware('permission:surveys.delete');
    
    // Survey response management
    Route::get('survey-responses', [SurveyResponseController::class, 'index'])->middleware('permission:surveys.read');
    Route::post('survey-responses', [SurveyResponseController::class, 'save'])->middleware('permission:surveys.read');
    Route::get('survey-responses/{response}', [SurveyResponseController::class, 'show'])->middleware('permission:surveys.read');
    Route::post('surveys/{survey}/responses/start', [SurveyResponseController::class, 'start'])->middleware('permission:surveys.read');
    Route::put('survey-responses/{response}', [SurveyResponseController::class, 'save'])->middleware('permission:surveys.read');
    Route::post('survey-responses/{response}/submit', [SurveyResponseController::class, 'submit'])->middleware('permission:surveys.read');
    Route::post('survey-responses/{response}/approve', [SurveyResponseController::class, 'approve'])->middleware('permission:surveys.manage');
    Route::post('survey-responses/{response}/reject', [SurveyResponseController::class, 'reject'])->middleware('permission:surveys.manage');
    Route::delete('survey-responses/{response}', [SurveyResponseController::class, 'destroy'])->middleware('permission:surveys.manage');
    Route::get('survey-responses/{response}/statistics', [SurveyResponseController::class, 'statistics'])->middleware('permission:surveys.read');
    
    // Survey targeting routes
    Route::get('survey-targeting/options', [SurveyTargetingController::class, 'getTargetingOptions'])->middleware('permission:surveys.create');
    Route::get('survey-targeting/institutions/hierarchy', [SurveyTargetingController::class, 'getInstitutionHierarchy'])->middleware('permission:surveys.create');
    Route::get('survey-targeting/institutions/accessible', [SurveyTargetingController::class, 'getAccessibleInstitutions'])->middleware('permission:surveys.create');
    Route::get('survey-targeting/departments/accessible', [SurveyTargetingController::class, 'getAccessibleDepartments'])->middleware('permission:surveys.create');
    Route::post('survey-targeting/estimate', [SurveyTargetingController::class, 'estimateRecipients'])->middleware('permission:surveys.create');
    Route::post('survey-targeting/validate', [SurveyTargetingController::class, 'validateTargeting'])->middleware('permission:surveys.create');
    Route::post('survey-targeting/apply-preset', [SurveyTargetingController::class, 'applyPreset'])->middleware('permission:surveys.create');
    Route::get('survey-targeting/bulk-options', [SurveyTargetingController::class, 'getBulkSelectionOptions'])->middleware('permission:surveys.create');
    
    // Task management - RegionAdmin and SektorAdmin can create tasks
    Route::get('tasks', [TaskController::class, 'index'])->middleware('permission:tasks.read');
    Route::post('tasks', [TaskController::class, 'store'])->middleware('permission:tasks.create');
    Route::get('tasks/statistics', [TaskController::class, 'getStatistics'])->middleware('permission:tasks.read');
    Route::get('tasks/{task}', [TaskController::class, 'show'])->middleware('permission:tasks.read');
    Route::put('tasks/{task}', [TaskController::class, 'update'])->middleware('permission:tasks.update');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->middleware('permission:tasks.delete');
    Route::post('tasks/{task}/comments', [TaskController::class, 'addComment'])->middleware('permission:tasks.read');
    
    // Hierarchical Task Management - New enhanced features
    Route::get('tasks/targeting/institutions', [TaskController::class, 'getTargetableInstitutions'])->middleware('permission:tasks.create');
    Route::get('tasks/targeting/roles', [TaskController::class, 'getAllowedTargetRoles'])->middleware('permission:tasks.create');
    Route::post('tasks/hierarchical', [TaskController::class, 'createHierarchicalTask'])->middleware('permission:tasks.create');
    Route::get('tasks/{task}/assignments', [TaskController::class, 'getTaskAssignments'])->middleware('permission:tasks.read');
    Route::put('assignments/{assignment}/status', [TaskController::class, 'updateAssignmentStatus'])->middleware('permission:tasks.update');
    Route::get('tasks/{task}/progress', [TaskController::class, 'getTaskProgress'])->middleware('permission:tasks.read');

    // Notification management
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::get('notifications/statistics', [NotificationController::class, 'statistics']);
    Route::get('notifications/{id}', [NotificationController::class, 'show']);
    Route::put('notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Admin notification functions
    Route::post('notifications/send-test', [NotificationController::class, 'sendTest'])->middleware('role:superadmin');
    Route::post('notifications/{id}/resend', [NotificationController::class, 'resend'])->middleware('role:superadmin');

    // Document management - File sharing with access controls
    Route::get('documents', [DocumentController::class, 'index'])->middleware('permission:documents.read');
    Route::post('documents', [DocumentController::class, 'store'])->middleware('permission:documents.create');
    Route::get('documents/{document}', [DocumentController::class, 'show'])->middleware('permission:documents.read');
    Route::put('documents/{document}', [DocumentController::class, 'update'])->middleware('permission:documents.update');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->middleware('permission:documents.delete');
    
    // Document operations
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
    Route::post('documents/{document}/versions', [DocumentController::class, 'createVersion'])->middleware('permission:documents.update');
    Route::get('documents/{document}/versions', [DocumentController::class, 'versions'])->middleware('permission:documents.read');
    Route::get('documents/{document}/analytics', [DocumentController::class, 'getAnalytics'])->middleware('permission:documents.read');
    
    // Document sharing
    Route::post('documents/{document}/shares', [DocumentController::class, 'createShare'])->middleware('permission:documents.share');
    
    // Document upload management
    Route::post('documents/upload', [DocumentUploadController::class, 'store'])->middleware('permission:documents.create');
    Route::post('documents/{document}/upload-version', [DocumentUploadController::class, 'uploadVersion'])->middleware('permission:documents.update');
    Route::get('documents/upload/quota', [DocumentUploadController::class, 'getQuotaInfo'])->middleware('permission:documents.read');
    Route::post('documents/upload/validate', [DocumentUploadController::class, 'validateUpload'])->middleware('permission:documents.create');
    
    // Document analytics
    Route::get('documents/analytics', [DocumentAnalyticsController::class, 'index'])->middleware('permission:documents.read');
    Route::get('documents/analytics/regional', [DocumentAnalyticsController::class, 'getRegionalAnalytics'])->middleware('permission:documents.read');
    Route::get('documents/analytics/usage', [DocumentAnalyticsController::class, 'getUsageAnalytics'])->middleware('permission:documents.read');
    Route::get('documents/analytics/export', [DocumentAnalyticsController::class, 'exportAnalytics'])->middleware('permission:documents.read');
    Route::get('documents/{document}/analytics/detailed', [DocumentAnalyticsController::class, 'getDetailedAnalytics'])->middleware('permission:documents.read');
    
    // Enhanced document features with regional hierarchy
    Route::post('documents/upload-with-authority', [DocumentController::class, 'uploadWithAuthority'])->middleware('permission:documents.create');
    Route::post('documents/{document}/regional-share', [DocumentController::class, 'createRegionalShare'])->middleware('permission:documents.share');
    Route::get('documents/user-authority', [DocumentController::class, 'getUserAuthority'])->middleware('permission:documents.read');
    Route::get('documents/accessible', [DocumentController::class, 'getAccessibleDocuments'])->middleware('permission:documents.read');
    Route::get('documents/statistics', [DocumentController::class, 'getDocumentStatistics'])->middleware('permission:documents.read');

    // FAZA 12: New Frontend Component API Routes
    // Class Attendance API Routes
    Route::prefix('class-attendance')->group(function () {
        Route::get('/', [ClassAttendanceApiController::class, 'index'])->middleware('permission:attendance.read');
        Route::post('/', [ClassAttendanceApiController::class, 'store'])->middleware('permission:attendance.create');
        Route::get('/stats', [ClassAttendanceApiController::class, 'getClassStats'])->middleware('permission:attendance.read');
        Route::get('/{classId}', [ClassAttendanceApiController::class, 'show'])->middleware('permission:attendance.read');
    });

    // Approval API Routes
    Route::prefix('approvals')->group(function () {
        Route::get('/', [ApprovalApiController::class, 'index'])->middleware('permission:approvals.read');
        Route::post('/{id}/approve', [ApprovalApiController::class, 'approve'])->middleware('permission:approvals.approve');
        Route::post('/{id}/reject', [ApprovalApiController::class, 'reject'])->middleware('permission:approvals.approve');
        Route::get('/stats', [ApprovalApiController::class, 'getStats'])->middleware('permission:approvals.read');
    });

    // Teaching Load API Routes
    Route::prefix('teaching-loads')->group(function () {
        Route::get('/', [TeachingLoadApiController::class, 'index'])->middleware('permission:schedules.read');
        Route::post('/', [TeachingLoadApiController::class, 'store'])->middleware('permission:schedules.create');
        Route::get('/teacher/{teacherId}', [TeachingLoadApiController::class, 'getTeacherWorkload'])->middleware('permission:schedules.read');
        Route::put('/{id}', [TeachingLoadApiController::class, 'update'])->middleware('permission:schedules.update');
        Route::delete('/{id}', [TeachingLoadApiController::class, 'destroy'])->middleware('permission:schedules.delete');
    });

    // Schedule API Management
    Route::prefix('api/schedules')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [ScheduleApiController::class, 'index'])->middleware('permission:schedules.read');
        Route::post('/', [ScheduleApiController::class, 'store'])->middleware('permission:schedules.create');
        Route::get('/{id}', [ScheduleApiController::class, 'show'])->middleware('permission:schedules.read');
        Route::put('/{id}', [ScheduleApiController::class, 'update'])->middleware('permission:schedules.update');
        Route::delete('/{id}', [ScheduleApiController::class, 'destroy'])->middleware('permission:schedules.delete');
        
        // Advanced schedule operations
        Route::post('/generate', [ScheduleApiController::class, 'generate'])->middleware('permission:schedules.create');
        Route::post('/{id}/validate', [ScheduleApiController::class, 'validate'])->middleware('permission:schedules.read');
        Route::post('/{id}/approve', [ScheduleApiController::class, 'approve'])->middleware('permission:schedules.approve');
    });
    
    // User storage quota
    Route::get('documents/quota/info', [DocumentController::class, 'getQuotaInfo']);
    
    // Link sharing - New enhanced features
    Route::get('link-shares', [App\Http\Controllers\LinkShareController::class, 'index'])->middleware('permission:documents.read');
    Route::post('link-shares', [App\Http\Controllers\LinkShareController::class, 'store'])->middleware('permission:documents.share');
    Route::get('link-shares/{linkShare}', [App\Http\Controllers\LinkShareController::class, 'show'])->middleware('permission:documents.read');
    Route::put('link-shares/{linkShare}', [App\Http\Controllers\LinkShareController::class, 'update'])->middleware('permission:documents.share');
    Route::delete('link-shares/{linkShare}', [App\Http\Controllers\LinkShareController::class, 'destroy'])->middleware('permission:documents.delete');
    
    // Link sharing advanced features
    Route::post('link-shares/{linkShare}/access', [App\Http\Controllers\LinkShareController::class, 'access']);
    Route::get('link-shares/{linkShare}/statistics', [App\Http\Controllers\LinkShareController::class, 'getStatistics'])->middleware('permission:documents.read');
    Route::get('link-shares/options/sharing', [App\Http\Controllers\LinkShareController::class, 'getSharingOptions'])->middleware('permission:documents.share');

    // Navigation routes
    Route::get('navigation/menu', [App\Http\Controllers\NavigationController::class, 'getMenuItems']);
    Route::get('navigation/stats', [App\Http\Controllers\NavigationController::class, 'getNavigationStats']);

    // Dashboard routes
    Route::get('dashboard/stats', [App\Http\Controllers\DashboardController::class, 'stats']);
    Route::get('dashboard/detailed-stats', [App\Http\Controllers\DashboardController::class, 'detailedStats'])->middleware('permission:users.read');
    
    // SuperAdmin advanced dashboard routes
    Route::get('dashboard/superadmin-analytics', [App\Http\Controllers\DashboardController::class, 'superAdminAnalytics'])->middleware('role:superadmin');
    Route::get('dashboard/system-status', [App\Http\Controllers\DashboardController::class, 'systemStatus'])->middleware('role:superadmin');
    
    // Reports and Analytics (with proper permissions)
    Route::get('reports/overview', [App\Http\Controllers\ReportsController::class, 'getOverviewStats'])->middleware('permission:reports.read');
    Route::get('reports/institutional-performance', [App\Http\Controllers\ReportsController::class, 'getInstitutionalPerformance'])->middleware('permission:reports.read');
    Route::get('reports/survey-analytics', [App\Http\Controllers\ReportsController::class, 'getSurveyAnalytics'])->middleware('permission:reports.read');
    Route::get('reports/user-activity', [App\Http\Controllers\ReportsController::class, 'getUserActivityReport'])->middleware('permission:reports.read');
    Route::post('reports/export', [App\Http\Controllers\ReportsController::class, 'exportReport'])->middleware('permission:reports.export');
    
    // RegionAdmin Dashboard and Analytics - Refactored Controllers
    Route::prefix('regionadmin')->middleware(['role:regionadmin|superadmin', 'regional.access:institutions', 'audit.logging'])->group(function () {
        // Dashboard endpoints
        Route::get('dashboard', [RegionAdminDashboardController::class, 'getDashboardStats']);
        
        // Institution management endpoints - READ operations
        Route::get('institutions', [RegionAdminInstitutionController::class, 'index']);
        Route::get('institutions/stats', [RegionAdminInstitutionController::class, 'getInstitutionStats']);
        Route::get('institutions/hierarchy', [RegionAdminInstitutionController::class, 'getInstitutionHierarchy']);
        Route::get('institutions/performance', [RegionAdminInstitutionController::class, 'getPerformanceInsights']);
        Route::get('institutions/{id}', [RegionAdminInstitutionController::class, 'show']);
        
        // Institution management endpoints - WRITE operations
        Route::post('institutions', [RegionAdminInstitutionController::class, 'store']);
        Route::put('institutions/{id}', [RegionAdminInstitutionController::class, 'update']);
        Route::delete('institutions/{id}', [RegionAdminInstitutionController::class, 'destroy']);
        
        // Department management endpoints
        Route::get('institutions/{institutionId}/departments', [RegionAdminInstitutionController::class, 'getDepartments']);
        Route::post('institutions/{institutionId}/departments', [RegionAdminInstitutionController::class, 'storeDepartment']);
        Route::get('institutions/{institutionId}/departments/{departmentId}', [RegionAdminInstitutionController::class, 'showDepartment']);
        Route::put('institutions/{institutionId}/departments/{departmentId}', [RegionAdminInstitutionController::class, 'updateDepartment']);
        Route::delete('institutions/{institutionId}/departments/{departmentId}', [RegionAdminInstitutionController::class, 'destroyDepartment']);
        
        // User management endpoints - READ operations
        Route::get('users', [RegionAdminUserController::class, 'index']);
        Route::get('users/stats', [RegionAdminUserController::class, 'getUserStats']);
        Route::get('users/list', [RegionAdminUserController::class, 'getUsersList']);
        Route::get('users/activity', [RegionAdminUserController::class, 'getUserActivity']);
        Route::get('users/{id}', [RegionAdminUserController::class, 'show']);
        
        // User management endpoints - WRITE operations
        Route::post('users', [RegionAdminUserController::class, 'store']);
        Route::put('users/{id}', [RegionAdminUserController::class, 'update']);
        Route::delete('users/{id}', [RegionAdminUserController::class, 'destroy']);
        
        // User management helper endpoints
        Route::get('roles/available', [RegionAdminUserController::class, 'getAvailableRoles']);
        Route::get('institutions/available', [RegionAdminUserController::class, 'getAvailableInstitutions']);
        Route::get('institutions/{institutionId}/departments', [RegionAdminUserController::class, 'getInstitutionDepartments']);
        
        // Survey analytics endpoints
        Route::get('surveys', [RegionAdminSurveyController::class, 'getSurveyAnalytics']);
        Route::get('surveys/list', [RegionAdminSurveyController::class, 'getSurveysList']);
        Route::get('surveys/trends', [RegionAdminSurveyController::class, 'getSurveyTrends']);
        
        // Reports endpoints
        Route::get('reports/overview', [RegionAdminReportsController::class, 'getRegionalOverview'])
            ->middleware('permission:reports.read');
        Route::get('reports/institutions', [RegionAdminReportsController::class, 'getInstitutionReports'])
            ->middleware('permission:reports.read');
        Route::get('reports/surveys', [RegionAdminReportsController::class, 'getSurveyReports'])
            ->middleware('permission:reports.read');
        Route::get('reports/users', [RegionAdminReportsController::class, 'getUserReports'])
            ->middleware('permission:reports.read');
        Route::post('reports/export', [RegionAdminReportsController::class, 'exportReport'])
            ->middleware('permission:reports.export');
    });
    
    // RegionOperator Dashboard and Analytics
    Route::prefix('regionoperator')->middleware(['role:regionoperator', 'regional.access:departments', 'audit.logging'])->group(function () {
        // Dashboard endpoints
        Route::get('dashboard', [RegionOperatorDashboardController::class, 'getDashboardStats']);
        Route::get('tasks', [RegionOperatorDashboardController::class, 'getUserTasks']);
        Route::get('team', [RegionOperatorDashboardController::class, 'getDepartmentTeam']);
    });
    
    // SektorAdmin Dashboard and Analytics
    Route::prefix('sektoradmin')->middleware(['role:sektoradmin', 'regional.access:sector', 'audit.logging'])->group(function () {
        // Dashboard endpoints
        Route::get('dashboard', [SektorAdminDashboardController::class, 'getDashboardStats']);
        Route::get('schools', [SektorAdminDashboardController::class, 'getSectorSchools']);
        Route::get('analytics', [SektorAdminDashboardController::class, 'getSectorAnalytics']);
    });
    
    // MəktəbAdmin Dashboard and Analytics
    Route::prefix('mektebadmin')->middleware(['role:məktəbadmin', 'regional.access:school', 'audit.logging'])->group(function () {
        // Dashboard endpoints
        Route::get('dashboard', [MektebAdminDashboardController::class, 'getDashboardStats']);
        Route::get('classes', [MektebAdminDashboardController::class, 'getSchoolClasses']);
        Route::get('teachers', [MektebAdminDashboardController::class, 'getSchoolTeachers']);
    });
    
    // System Configuration (SuperAdmin only)
    Route::prefix('system')->middleware('permission:system.config')->group(function () {
        Route::get('config', [App\Http\Controllers\SystemConfigController::class, 'getSystemConfig']);
        Route::put('config', [App\Http\Controllers\SystemConfigController::class, 'updateSystemConfig']);
        Route::get('health', [App\Http\Controllers\SystemConfigController::class, 'getSystemHealth']);
        Route::post('maintenance', [App\Http\Controllers\SystemConfigController::class, 'performMaintenance']);
        Route::get('audit-logs', [App\Http\Controllers\SystemConfigController::class, 'getAuditLogs']);
        
        // Report Scheduling
        Route::get('schedules', [App\Http\Controllers\SystemConfigController::class, 'getScheduledReports']);
        Route::post('schedules', [App\Http\Controllers\SystemConfigController::class, 'createScheduledReport']);
        Route::put('schedules/{schedule}', [App\Http\Controllers\SystemConfigController::class, 'updateScheduledReport']);
        Route::delete('schedules/{schedule}', [App\Http\Controllers\SystemConfigController::class, 'deleteScheduledReport']);
    });

    // Enhanced Document Management (Refactored)
    Route::prefix('documents-v2')->group(function () {
        Route::get('/', [DocumentControllerRefactored::class, 'index'])->middleware('permission:documents.read');
        Route::post('/', [DocumentControllerRefactored::class, 'store'])->middleware('permission:documents.create');
        Route::get('/{document}', [DocumentControllerRefactored::class, 'show'])->middleware('permission:documents.read');
        Route::put('/{document}', [DocumentControllerRefactored::class, 'update'])->middleware('permission:documents.update');
        Route::delete('/{document}', [DocumentControllerRefactored::class, 'destroy'])->middleware('permission:documents.delete');
        
        // Download and preview
        Route::get('/{document}/download', [DocumentControllerRefactored::class, 'download'])->middleware('permission:documents.read');
        Route::get('/{document}/preview', [DocumentControllerRefactored::class, 'preview'])->middleware('permission:documents.read');
        Route::get('/{document}/stats/downloads', [DocumentControllerRefactored::class, 'downloadStats'])->middleware('permission:documents.read');
        Route::post('/bulk-download', [DocumentControllerRefactored::class, 'bulkDownload'])->middleware('permission:documents.read');
        
        // Sharing functionality
        Route::post('/{document}/share', [DocumentControllerRefactored::class, 'share'])->middleware('permission:documents.share');
        Route::post('/{document}/public-link', [DocumentControllerRefactored::class, 'createPublicLink'])->middleware('permission:documents.share');
        Route::get('/{document}/stats/sharing', [DocumentControllerRefactored::class, 'sharingStats'])->middleware('permission:documents.read');
        Route::delete('/shares/{share}/revoke', [DocumentControllerRefactored::class, 'revokeShare'])->middleware('permission:documents.share');
        Route::get('/my-shares', [DocumentControllerRefactored::class, 'myShares'])->middleware('permission:documents.read');
    });

    // Enhanced Institution Management (Refactored)
    Route::prefix('institutions-v2')->group(function () {
        Route::get('/', [InstitutionControllerRefactored::class, 'index'])->middleware('permission:institutions.read');
        Route::post('/', [InstitutionControllerRefactored::class, 'store'])->middleware('permission:institutions.create');
        Route::get('/hierarchy', [InstitutionControllerRefactored::class, 'hierarchy'])->middleware('permission:institutions.read');
        Route::get('/statistics', [InstitutionControllerRefactored::class, 'statistics'])->middleware('permission:institutions.read');
        Route::get('/{institution}', [InstitutionControllerRefactored::class, 'show'])->middleware('permission:institutions.read');
        Route::put('/{institution}', [InstitutionControllerRefactored::class, 'update'])->middleware('permission:institutions.update');
        Route::delete('/{institution}', [InstitutionControllerRefactored::class, 'destroy'])->middleware('permission:institutions.delete');
        
        // Department management
        Route::get('/{institution}/departments', [InstitutionControllerRefactored::class, 'departments'])->middleware('permission:institutions.read');
        Route::post('/{institution}/departments', [InstitutionControllerRefactored::class, 'storeDepartment'])->middleware('permission:institutions.create');
        Route::get('/{institution}/department-statistics', [InstitutionControllerRefactored::class, 'departmentStatistics'])->middleware('permission:institutions.read');
        Route::put('/departments/{department}', [InstitutionControllerRefactored::class, 'updateDepartment'])->middleware('permission:institutions.update');
        Route::delete('/departments/{department}', [InstitutionControllerRefactored::class, 'destroyDepartment'])->middleware('permission:institutions.delete');
    });

    // Class Attendance Management
    Route::prefix('attendance')->group(function () {
        Route::get('/', [ClassAttendanceController::class, 'index'])->middleware('permission:attendance.read');
        Route::post('/', [ClassAttendanceController::class, 'store'])->middleware('permission:attendance.create');
        Route::get('/statistics', [ClassAttendanceController::class, 'statistics'])->middleware('permission:attendance.read');
        Route::get('/{classAttendance}', [ClassAttendanceController::class, 'show'])->middleware('permission:attendance.read');
        Route::put('/{classAttendance}', [ClassAttendanceController::class, 'update'])->middleware('permission:attendance.update');
        Route::delete('/{classAttendance}', [ClassAttendanceController::class, 'destroy'])->middleware('permission:attendance.delete');
        Route::post('/{classAttendance}/approve', [ClassAttendanceController::class, 'approve'])->middleware('permission:attendance.approve');
        Route::post('/bulk-action', [ClassAttendanceController::class, 'bulkAction'])->middleware('permission:attendance.update');
    });

    // Schedule Management
    Route::prefix('schedules')->group(function () {
        Route::get('/', [ScheduleController::class, 'index'])->middleware('permission:schedules.read');
        Route::post('/', [ScheduleController::class, 'store'])->middleware('permission:schedules.create');
        Route::get('/{schedule}', [ScheduleController::class, 'show'])->middleware('permission:schedules.read');
        Route::put('/{schedule}', [ScheduleController::class, 'update'])->middleware('permission:schedules.update');
        Route::delete('/{schedule}', [ScheduleController::class, 'destroy'])->middleware('permission:schedules.delete');
        
        // Schedule generation and validation
        Route::post('/generate', [ScheduleController::class, 'generate'])->middleware('permission:schedules.create');
        Route::post('/validate', [ScheduleController::class, 'validate'])->middleware('permission:schedules.create');
        Route::post('/{schedule}/approve', [ScheduleController::class, 'approve'])->middleware('permission:schedules.approve');
        Route::post('/export', [ScheduleController::class, 'export'])->middleware('permission:schedules.read');
    });

    // Assessment System Routes - KSQ/BSQ Results Management
    Route::prefix('assessments')->middleware('permission:assessments.read')->group(function () {
        // Assessment overview and analytics
        Route::get('/', [App\Http\Controllers\AssessmentController::class, 'index']);
        Route::get('/analytics', [App\Http\Controllers\AssessmentController::class, 'getAnalytics']);
        Route::get('/rankings', [App\Http\Controllers\AssessmentController::class, 'getRankings']);
        Route::post('/export', [App\Http\Controllers\AssessmentController::class, 'export']);

        // KSQ (Keyfiyyət Standartları Qiymətləndirməsi) Routes
        Route::prefix('ksq')->group(function () {
            Route::post('/', [App\Http\Controllers\AssessmentController::class, 'storeKSQ'])->middleware('permission:assessments.create');
            Route::post('/{id}/approve', function ($id) {
                return app(App\Http\Controllers\AssessmentController::class)->approve(request(), 'ksq', $id);
            })->middleware('permission:assessments.approve');
        });

        // BSQ (Beynəlxalq Standartlar Qiymətləndirməsi) Routes  
        Route::prefix('bsq')->group(function () {
            Route::post('/', [App\Http\Controllers\AssessmentController::class, 'storeBSQ'])->middleware('permission:assessments.create');
            Route::post('/{id}/approve', function ($id) {
                return app(App\Http\Controllers\AssessmentController::class)->approve(request(), 'bsq', $id);
            })->middleware('permission:assessments.approve');
        });
    });
});

// Public shared document access (no auth required)
Route::get('shared/{token}', [App\Http\Controllers\DocumentShareController::class, 'access'])->name('documents.shared');

// Public document access via refactored controller
Route::get('documents/public/{token}', [DocumentControllerRefactored::class, 'accessPublic'])->name('documents.public');