import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: string | string[];
  fallback?: React.ReactNode;
  require?: 'all' | 'any'; // Default: 'any'
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permissions, 
  fallback = null, 
  require = 'any' 
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  const userPermissions = user.permissions || [];

  // Check if user has required permissions
  const hasRequiredPermissions = require === 'all' 
    ? requiredPermissions.every(permission => userPermissions.includes(permission))
    : requiredPermissions.some(permission => userPermissions.includes(permission));

  if (!hasRequiredPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;