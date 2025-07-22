// ====================
// ATİS Hooks Index
// Centralized hook exports
// ====================

// Form hooks
export { useForm, validationRules } from './useForm';
export type { UseFormOptions, UseFormReturn } from './useForm';

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