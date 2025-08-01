// ====================
// ATİS Hooks Index
// Centralized hook exports
// ====================

// Form hooks
export { useForm, validationRules } from './useForm';
export type { UseFormOptions, UseFormReturn } from './useForm';

// CRUD hooks
export { useCRUD } from './useCRUD';
export type { UseCRUDOptions, UseCRUDReturn, PaginatedResponse } from './useCRUD';

// Modal state hooks
export { useModalState, useMultiModalState } from './useModalState';
export type { 
  UseModalStateOptions, 
  UseModalStateReturn, 
  UseMultiModalStateReturn 
} from './useModalState';

// 🚀 NEW: Role-based data hooks
export { 
  useRoleBasedData, 
  useRegionalData, 
  useInstitutionalData, 
  useScopedSearch 
} from './useRoleBasedData';

// 🚀 NEW: Performance and caching hooks
export { 
  useRoleBasedCache, 
  useRoleBasedDataCache 
} from './useRoleBasedCache';

// 🚀 NEW: Export functionality hooks
export { useRoleBasedExport } from './useRoleBasedExport';

// 🚀 NEW: Task management hooks
export { useTaskManagement } from './useTaskManagement';
export type { UseTaskManagementOptions, UseTaskManagementReturn } from './useTaskManagement';

export { useTaskFilters } from './useTaskFilters';
export type { UseTaskFiltersOptions, UseTaskFiltersReturn } from './useTaskFilters';