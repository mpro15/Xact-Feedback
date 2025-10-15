import React, { ReactNode } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps { 
  children: ReactNode;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requireAuth = true,
  requiredPermissions = [],
  fallbackPath = '/login'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requiredPermissions.length > 0 && user) {
    const userPermissions = user.permissions || {};
    const hasAllPermissions = requiredPermissions.every(perm => {
      if (perm === 'admin') return user.account_type === 'admin';
      if (perm === 'approved') return user.is_approved === true;
      return userPermissions[`can_${perm}`] === true || userPermissions[perm] === true;
    });
    if (!hasAllPermissions) {
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

// Higher-order component for easier usage
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Convenience components for common access patterns
export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['admin']}>
    {children}
  </ProtectedRoute>
);

export const ApprovedUserRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['approved']}>
    {children}
  </ProtectedRoute>
);

export const ManagerRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['access_analytics']}>
    {children}
  </ProtectedRoute>
);
