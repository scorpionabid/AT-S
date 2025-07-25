import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string | string[];
  fallback?: React.ReactNode;
  require?: 'all' | 'any'; // Default: 'any'
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  roles, 
  fallback = null, 
  require = 'any' 
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  const userRoles = user.roles || [];
  
  // Extract role names from user roles (handle both string and object formats)
  const userRoleNames = userRoles.map(role => 
    typeof role === 'string' ? role : role.name
  );

  // Check if user has required roles
  const hasRequiredRoles = require === 'all' 
    ? requiredRoles.every(role => userRoleNames.includes(role))
    : requiredRoles.some(role => userRoleNames.includes(role));

  if (!hasRequiredRoles) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;