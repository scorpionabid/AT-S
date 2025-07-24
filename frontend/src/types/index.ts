// ====================
// ATİS Types Index
// Centralized type exports
// ====================

// Shared types (recommended for new code)
export * from './shared';

// Legacy types (for backward compatibility)
// TODO: Migrate to shared types

// Re-export namespace for easy access
export { ATİSTypes } from './shared';

// Type utilities
export type {
  DeepPartial,
  Optional,
  Required,
  ID
} from './shared';

// Common type combinations
export type {
  BaseModalProps,
  BaseFormProps,
  BaseListProps,
  BaseCrudProps,
  BaseFilterParams
} from './shared';

// Export specific frequently used types
export type {
  PaginatedResponse,
  ApiResponse,
  BulkOperationResult,
  ApiError,
  SelectOption,
  TableColumn,
  Notification
} from './shared';

// Default export for common patterns
export default {
  // Common interfaces that can be extended
  BaseEntity: {
    id: 0,
    created_at: '',
    updated_at: '',
    is_active: true
  },
  
  BasePagination: {
    page: 1,
    per_page: 10,
    sort_by: 'id',
    sort_direction: 'desc' as const
  },
  
  BaseModal: {
    isOpen: false,
    loading: false
  }
};