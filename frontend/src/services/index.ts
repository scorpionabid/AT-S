// ====================
// ATİS Services Index - Unified Exports
// Centralized service exports with unified architecture
// ====================

// Base services and utilities
export { GenericCrudService } from './base/GenericCrudService';
export type { 
  PaginatedResponse, 
  BulkOperationResult, 
  ApiResponse 
} from './base/GenericCrudService';

export { api } from './api';

// Unified services (recommended)
export { userService as userServiceUnified } from './userServiceUnified';
export type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  GetUsersParams 
} from './userServiceUnified';

export { institutionService as institutionServiceUnified } from './institutionServiceUnified';
export type { 
  Institution, 
  CreateInstitutionData, 
  UpdateInstitutionData, 
  GetInstitutionsParams,
  InstitutionHierarchy 
} from './institutionServiceUnified';

export { roleService as roleServiceUnified } from './roleServiceUnified';
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

export { dashboardService as dashboardServiceUnified } from './dashboardServiceUnified';
export type {
  DashboardStats,
  RecentActivity,
  SystemStatus,
  SuperAdminAnalytics,
  SystemStatusDetailed,
  DashboardFilters,
  PerformanceMetrics
} from './dashboardServiceUnified';

// Legacy services (for backward compatibility)
// TODO: Migrate components to use unified versions above
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as institutionService } from './institutionService';
export { default as roleService } from './roleService';
export { default as surveyService } from './surveyService';
export { default as dashboardService } from './dashboardService';
export { default as reportsService } from './reportsService';

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
  users: userServiceUnified,
  institutions: institutionServiceUnified,
  roles: roleServiceUnified,
  dashboard: dashboardServiceUnified,
  
  // Factory for new services
  createService: ServiceFactory.createCrudService,
  
  // Migration utilities
  migrationGuide: MIGRATION_GUIDE
};