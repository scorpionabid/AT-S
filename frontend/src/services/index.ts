// ====================
// ATİS Services Index - Unified Exports
// Centralized service exports with unified architecture
// ====================

// Import unified services for default export
import { userService } from './userServiceUnified';
import { institutionService } from './institutionServiceUnified';
import { roleService } from './roleServiceUnified';
import { dashboardService } from './dashboardServiceUnified';
import { taskService, taskUtils } from './taskServiceUnified';

// Base services and utilities
export { GenericCrudService } from './base/GenericCrudService';
export type { 
  PaginatedResponse, 
  BulkOperationResult, 
  ApiResponse 
} from './base/GenericCrudService';

export { api } from './api';

// Unified services (recommended)
export { userService, userService as userServiceUnified } from './userServiceUnified';
export type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  GetUsersParams 
} from './userServiceUnified';

export { institutionService, institutionService as institutionServiceUnified } from './institutionServiceUnified';
export type { 
  Institution, 
  CreateInstitutionData, 
  UpdateInstitutionData, 
  GetInstitutionsParams,
  InstitutionHierarchy 
} from './institutionServiceUnified';

export { roleService, roleService as roleServiceUnified } from './roleServiceUnified';
export type {
  Role,
  Permission,
  CreateRoleData,
  UpdateRoleData,
  GetRolesParams,
  GetPermissionsParams,
  RoleWithPermissions,
  AssignPermissionsData
} from './roleServiceUnified';

export { dashboardService, dashboardService as dashboardServiceUnified } from './dashboardServiceUnified';
export type {
  DashboardStats,
  RecentActivity,
  SystemStatus,
  SuperAdminAnalytics,
  SystemStatusDetailed,
  DashboardFilters,
  PerformanceMetrics
} from './dashboardServiceUnified';

export { taskService, taskService as taskServiceUnified, taskUtils } from './taskServiceUnified';
export type {
  CreateTaskData,
  UpdateTaskData,
  TaskWorkflowAction,
  BulkTaskOperation
} from '../types/taskTypes';

// Legacy services (for backward compatibility)
// TODO: Migrate components to use unified versions above
export { authService } from './authService';
export { default as userServiceLegacy } from './userService';
export { default as institutionServiceLegacy } from './institutionService';
export { roleServiceDynamic as roleServiceLegacy } from './roleServiceDynamic';
export { default as surveyService } from './surveyService';
// export { dashboardService as dashboardServiceLegacy } from './dashboardService'; // Removed - use dashboardServiceUnified
export { default as reportsService } from './reportsService';

// Dynamic role service (modern replacement for legacy role service)
export { roleServiceDynamic, roleServiceDynamic as roleServiceModern } from './roleServiceDynamic';

// Specialized services (already optimized or unique functionality)
export { default as approvalService } from './approvalService';
export { default as attendanceService } from './attendanceService';
export { default as teachingLoadService } from './teachingLoadService';
export { default as surveyEnhancedService } from './surveyEnhancedService';
export { default as surveyTargetingService } from './surveyTargetingService';
export { default as navigationService } from './navigationService';
export { default as preferencesService } from './preferencesService';
export { default as systemConfigService } from './systemConfigService';

// Service factory for creating new unified services
export class ServiceFactory {
  /**
   * Create a new CRUD service for any entity
   * @param endpoint API endpoint (e.g., '/my-entity')
   * @returns GenericCrudService instance
   */
  static createCrudService<T, CreateT = Partial<T>, UpdateT = Partial<T>>(
    endpoint: string
  ): GenericCrudService<T, CreateT, UpdateT> {
    return new GenericCrudService<T, CreateT, UpdateT>(endpoint);
  }
}

// Migration guide for developers
export const MIGRATION_GUIDE = {
  userService: {
    old: 'import userService from "./services/userService"',
    legacy: 'import { userServiceLegacy } from "./services"',
    new: 'import { userServiceUnified } from "./services"',
    benefits: [
      'Consistent error handling',
      'Built-in pagination',
      'Standardized bulk operations',
      'Type-safe parameters',
      'Reduced bundle size'
    ]
  },
  institutionService: {
    old: 'import institutionService from "./services/institutionService"',
    legacy: 'import { institutionServiceLegacy } from "./services"',
    new: 'import { institutionServiceUnified } from "./services"',
    benefits: [
      'Hierarchy operations built-in',
      'Consistent API patterns',
      'Enhanced filtering options',
      'Bulk operations support',
      'Better error handling'
    ]
  },
  roleService: {
    old: 'import roleService from "./services/roleService"',
    legacy: 'import { roleServiceLegacy } from "./services"',
    new: 'import { roleServiceUnified } from "./services"',
    benefits: [
      'Permission management built-in',
      'Role hierarchy support',
      'Bulk permission operations',
      'Enhanced filtering',
      'Consistent type safety'
    ]
  },
  dashboardService: {
    old: 'import dashboardService from "./services/dashboardService"',
    legacy: '// dashboardServiceLegacy removed - file deleted',
    new: 'import { dashboardServiceUnified } from "./services"',
    benefits: [
      'Enhanced analytics capabilities',
      'Real-time updates support',
      'Improved error handling',
      'Performance metrics',
      'Export functionality'
    ]
  },
  newService: {
    example: `
// For new entities, use ServiceFactory:
import { ServiceFactory } from './services';

interface MyEntity { id: number; name: string; }
interface CreateMyEntity { name: string; }

const myService = ServiceFactory.createCrudService<MyEntity, CreateMyEntity>('/my-entities');

// Now you have all CRUD operations:
const items = await myService.getAll();
const item = await myService.create({ name: 'Test' });
const updated = await myService.update(1, { name: 'Updated' });
await myService.delete(1);
    `,
    benefits: [
      'Zero boilerplate code',
      'Consistent patterns',
      'Built-in error handling',
      'Type safety',
      'Automatic pagination'
    ]
  }
};

// TODO: Remove legacy services after migration
// Timeline:
// Phase 1 (Current): Both unified and legacy available
// Phase 2 (2 weeks): Deprecation warnings added to legacy services  
// Phase 3 (1 month): Legacy services removed

export default {
  // Unified services (recommended)
  users: userService,
  institutions: institutionService,
  roles: roleService,
  dashboard: dashboardService,
  tasks: taskService,
  taskUtils,
  
  // Factory for new services
  createService: ServiceFactory.createCrudService,
  
  // Migration utilities
  migrationGuide: MIGRATION_GUIDE
};