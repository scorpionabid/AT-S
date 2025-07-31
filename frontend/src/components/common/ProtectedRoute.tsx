import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ProtectedRouteProps } from '../../types/auth';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  requiredPermissions = [],
  requireAll = false
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Yüklənir...</p>
      </div>
    );
  }

  // Debug: Log authentication state
  console.log('🔒 ProtectedRoute check:', {
    isAuthenticated,
    user: user ? {
      id: user.id,
      name: user.name,
      roles: user.roles,
      role: user.role
    } : null,
    requiredRoles,
    currentPath: location.pathname,
    hasRequiredRoles: requiredRoles.length === 0 ? 'No roles required' : 'Checking roles...'
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];
    const userRoleNames = userRoles.map(role => 
      typeof role === 'string' ? role : role.name
    );

    console.log('🔍 Role check details:', {
      userRoles,
      userRoleNames,
      requiredRoles,
      requireAll
    });

    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => userRoleNames.includes(role))
      : requiredRoles.some(role => userRoleNames.includes(role));

    console.log('🎯 Role check result:', {
      hasRequiredRoles,
      userHasAnyRequired: userRoleNames.some(role => requiredRoles.includes(role))
    });
    
    if (!hasRequiredRoles) {
      return (
        <div className="access-denied">
          <h2>Giriş Qadağan</h2>
          <p>Bu səhifəyə girmək üçün lazımi rol səlahiyyətiniz yoxdur.</p>
          <p>Tələb olunan rollar: {requiredRoles.join(', ')}</p>
          <button onClick={() => window.history.back()}>
            Geri Qayıt
          </button>
        </div>
      );
    }
  }

  // Check permission-based access if required permissions are specified
  if (requiredPermissions.length > 0 && user) {
    const userPermissions = user.permissions || [];

    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => userPermissions.includes(permission))
      : requiredPermissions.some(permission => userPermissions.includes(permission));
    
    if (!hasRequiredPermissions) {
      return (
        <div className="access-denied">
          <h2>Giriş Qadağan</h2>
          <p>Bu səhifəyə girmək üçün lazımi icazə səlahiyyətiniz yoxdur.</p>
          <p>Tələb olunan icazələr: {requiredPermissions.join(', ')}</p>
          <button onClick={() => window.history.back()}>
            Geri Qayıt
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;