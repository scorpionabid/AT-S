// ====================
// ATİS System - Role Constants
// Standardized role names for frontend/backend consistency
// Version: 1.0.0
// ====================

/**
 * Standardized role names matching backend database
 * Based on CLAUDE.md documentation
 */
export const ROLES = {
  // System Level (Level 1)
  SUPERADMIN: 'superadmin',
  
  // Regional Level (Level 2-3)
  REGION_ADMIN: 'regionadmin',
  REGION_OPERATOR_FINANCE: 'regionoperator_maliyye',
  REGION_OPERATOR_FACILITY: 'regionoperator_tesserrufat', 
  REGION_OPERATOR_ADMIN: 'regionoperator_inzibati',
  
  // Sector Level (Level 4)
  SEKTOR_ADMIN: 'sektoradmin',
  
  // School Level (Level 5-7)
  SCHOOL_ADMIN: 'schooladmin',
  DEPUTY_PRINCIPAL: 'muavin_mudir',
  SUBJECT_TEACHER_LEADER: 'ubr_muellimi',
  FACILITY_MANAGER: 'tesserrufat_mesulu',
  FINANCE_MANAGER: 'maliyye_mesulu',
  SCHOOL_PSYCHOLOGIST: 'psixoloq',
  TEACHER: 'muellim',
} as const;

/**
 * Role display names in Azerbaijani
 */
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  [ROLES.SUPERADMIN]: 'Super Administrator',
  [ROLES.REGION_ADMIN]: 'Regional Administrator',
  [ROLES.REGION_OPERATOR_FINANCE]: 'Regional Finance Operator',
  [ROLES.REGION_OPERATOR_FACILITY]: 'Regional Facility Operator',
  [ROLES.REGION_OPERATOR_ADMIN]: 'Regional Administrative Operator',
  [ROLES.SEKTOR_ADMIN]: 'Sector Administrator',
  [ROLES.SCHOOL_ADMIN]: 'School Administrator',
  [ROLES.DEPUTY_PRINCIPAL]: 'Assistant Principal',
  [ROLES.SUBJECT_TEACHER_LEADER]: 'Subject Teacher Leader',
  [ROLES.FACILITY_MANAGER]: 'Facility Manager',
  [ROLES.FINANCE_MANAGER]: 'Finance Manager',
  [ROLES.SCHOOL_PSYCHOLOGIST]: 'School Psychologist',
  [ROLES.TEACHER]: 'Teacher',
};

/**
 * Role hierarchy levels for authorization checks
 */
export const ROLE_LEVELS: Record<string, number> = {
  [ROLES.SUPERADMIN]: 1,
  [ROLES.REGION_ADMIN]: 2,
  [ROLES.REGION_OPERATOR_FINANCE]: 3,
  [ROLES.REGION_OPERATOR_FACILITY]: 3,
  [ROLES.REGION_OPERATOR_ADMIN]: 3,
  [ROLES.SEKTOR_ADMIN]: 4,
  [ROLES.SCHOOL_ADMIN]: 5,
  [ROLES.DEPUTY_PRINCIPAL]: 6,
  [ROLES.SUBJECT_TEACHER_LEADER]: 6,
  [ROLES.FACILITY_MANAGER]: 6,
  [ROLES.FINANCE_MANAGER]: 6,
  [ROLES.SCHOOL_PSYCHOLOGIST]: 6,
  [ROLES.TEACHER]: 7,
};

/**
 * Role groups for easy permission checking
 */
export const ROLE_GROUPS = {
  SYSTEM_LEVEL: [ROLES.SUPERADMIN],
  REGIONAL_LEVEL: [
    ROLES.REGION_ADMIN,
    ROLES.REGION_OPERATOR_FINANCE,
    ROLES.REGION_OPERATOR_FACILITY,
    ROLES.REGION_OPERATOR_ADMIN,
  ],
  SECTOR_LEVEL: [ROLES.SEKTOR_ADMIN],
  SCHOOL_ADMIN_LEVEL: [ROLES.SCHOOL_ADMIN],
  SCHOOL_STAFF_LEVEL: [
    ROLES.DEPUTY_PRINCIPAL,
    ROLES.SUBJECT_TEACHER_LEADER,
    ROLES.FACILITY_MANAGER,
    ROLES.FINANCE_MANAGER,
    ROLES.SCHOOL_PSYCHOLOGIST,
    ROLES.TEACHER,
  ],
  ALL_ADMINS: [
    ROLES.SUPERADMIN,
    ROLES.REGION_ADMIN,
    ROLES.SEKTOR_ADMIN,
    ROLES.SCHOOL_ADMIN,
  ],
  ALL_REGIONAL: [
    ROLES.REGION_ADMIN,
    ROLES.REGION_OPERATOR_FINANCE,
    ROLES.REGION_OPERATOR_FACILITY,
    ROLES.REGION_OPERATOR_ADMIN,
    ROLES.SEKTOR_ADMIN,
  ],
  ALL_SCHOOL: [
    ROLES.SCHOOL_ADMIN,
    ROLES.DEPUTY_PRINCIPAL,
    ROLES.SUBJECT_TEACHER_LEADER,
    ROLES.FACILITY_MANAGER,
    ROLES.FINANCE_MANAGER,
    ROLES.SCHOOL_PSYCHOLOGIST,
    ROLES.TEACHER,
  ],
  CAN_MANAGE_USERS: [
    ROLES.SUPERADMIN,
    ROLES.REGION_ADMIN,
  ],
  CAN_CREATE_SURVEYS: [
    ROLES.SUPERADMIN,
    ROLES.REGION_ADMIN,
    ROLES.SEKTOR_ADMIN,
    ROLES.SCHOOL_ADMIN,
  ],
  CAN_RESPOND_SURVEYS: [
    ROLES.SUPERADMIN,
    ROLES.REGION_ADMIN,
    ROLES.SEKTOR_ADMIN,
    ROLES.SCHOOL_ADMIN,
    ROLES.DEPUTY_PRINCIPAL,
    ROLES.SUBJECT_TEACHER_LEADER,
    ROLES.FACILITY_MANAGER,
    ROLES.FINANCE_MANAGER,
    ROLES.SCHOOL_PSYCHOLOGIST,
    ROLES.TEACHER,
  ],
  CAN_MANAGE_ATTENDANCE: [
    ROLES.SCHOOL_ADMIN,
    ROLES.DEPUTY_PRINCIPAL,
    ROLES.TEACHER,
  ],
  CAN_APPROVE_DATA: [
    ROLES.SUPERADMIN,
    ROLES.REGION_ADMIN,
    ROLES.SEKTOR_ADMIN,
    ROLES.SCHOOL_ADMIN,
  ],
  CAN_ASSIGN_TASKS: [
    ROLES.REGION_ADMIN,
    ROLES.SEKTOR_ADMIN,
    ROLES.REGION_OPERATOR_FINANCE,
    ROLES.REGION_OPERATOR_FACILITY,
    ROLES.REGION_OPERATOR_ADMIN,
  ],
  CAN_MANAGE_SCHEDULES: [
    ROLES.SCHOOL_ADMIN,
    ROLES.DEPUTY_PRINCIPAL,
  ],
  CAN_MANAGE_TEACHING_LOADS: [
    ROLES.SCHOOL_ADMIN,
    ROLES.DEPUTY_PRINCIPAL,
  ],
} as const;

/**
 * Department access mapping for roles
 */
export const ROLE_DEPARTMENTS: Record<string, string[]> = {
  [ROLES.SUPERADMIN]: ['*'], // All departments
  [ROLES.REGION_ADMIN]: ['regional_maliyyə', 'regional_təsərrüfat', 'regional_inzibati'],
  [ROLES.REGION_OPERATOR_FINANCE]: ['regional_maliyyə'],
  [ROLES.REGION_OPERATOR_FACILITY]: ['regional_təsərrüfat'],
  [ROLES.REGION_OPERATOR_ADMIN]: ['regional_inzibati'],
  [ROLES.SEKTOR_ADMIN]: ['school_təhsil', 'school_statistika'],
  [ROLES.SCHOOL_ADMIN]: ['school_maliyyə', 'school_təsərrüfat', 'school_təhsil', 'school_statistika', 'school_qiymətləndirmə'],
  [ROLES.DEPUTY_PRINCIPAL]: ['school_təhsil', 'school_statistika'],
  [ROLES.SUBJECT_TEACHER_LEADER]: ['school_təhsil', 'school_qiymətləndirmə'],
  [ROLES.FACILITY_MANAGER]: ['school_təsərrüfat'],
  [ROLES.FINANCE_MANAGER]: ['school_maliyyə'],
  [ROLES.SCHOOL_PSYCHOLOGIST]: ['school_statistika', 'school_qiymətləndirmə'],
  [ROLES.TEACHER]: ['school_təhsil', 'school_qiymətləndirmə'],
};

/**
 * Legacy role mappings for backwards compatibility
 * Maps old inconsistent role names to standardized ones
 */
export const LEGACY_ROLE_MAPPINGS: Record<string, string> = {
  'müəllim': ROLES.TEACHER,           // Azerbaijani character version
  'muellim': ROLES.TEACHER,           // Standard transliterated version
  'muelim': ROLES.TEACHER,            // Shortened version
  'teacher': ROLES.TEACHER,           // English version
  'mektebadmin': ROLES.SCHOOL_ADMIN,  // Alternative spelling
  'schooladmin': ROLES.SCHOOL_ADMIN,  // Standard version
  'regionadmin': ROLES.REGION_ADMIN,  // Standard version
  'deputy': ROLES.DEPUTY_PRINCIPAL,   // Shortened version
  'sektoradmin': ROLES.SEKTOR_ADMIN,  // Standard version
};

/**
 * Helper function to get standardized role name
 */
export function getStandardizedRole(role: string): string {
  return LEGACY_ROLE_MAPPINGS[role] || role;
}

/**
 * Helper function to check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  const standardizedUserRole = getStandardizedRole(userRole);
  const standardizedRequiredRoles = requiredRoles.map(getStandardizedRole);
  return standardizedRequiredRoles.includes(standardizedUserRole);
}

/**
 * Helper function to check if user has sufficient role level
 */
export function hasRoleLevel(userRole: string, minLevel: number): boolean {
  const standardizedRole = getStandardizedRole(userRole);
  const userLevel = ROLE_LEVELS[standardizedRole];
  return userLevel ? userLevel <= minLevel : false;
}

/**
 * Helper function to check if user can access department
 */
export function canAccessDepartment(userRole: string, department: string): boolean {
  const standardizedRole = getStandardizedRole(userRole);
  const allowedDepartments = ROLE_DEPARTMENTS[standardizedRole] || [];
  return allowedDepartments.includes('*') || allowedDepartments.includes(department);
}

/**
 * Type definitions for TypeScript
 */
export type RoleName = typeof ROLES[keyof typeof ROLES];
export type RoleGroup = keyof typeof ROLE_GROUPS;
export type RoleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;