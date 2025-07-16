// Role utilities
export * from './roleUtils';

// Permission utilities
export * from './permissionUtils';

// Session utilities
export * from './sessionUtils';

// Auth validation utilities
export * from './authValidation';

// Re-export commonly used functions
export {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isSuperAdmin,
  isRegionAdmin,
  hasAdminAccess,
  hasManagementAccess
} from './roleUtils';

export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canCreateUsers,
  canUpdateUsers,
  canDeleteUsers,
  canManageInstitutions,
  canManageSurveys,
  canManageRoles
} from './permissionUtils';

export {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAuthStorage,
  isSessionExpired,
  shouldShowSessionWarning,
  updateLastActivity
} from './sessionUtils';

export {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
  isValidLoginInput,
  detectLoginType,
  passwordsMatch,
  checkPasswordRequirements
} from './authValidation';