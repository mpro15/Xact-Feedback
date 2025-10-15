import React, { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

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
  const { user, loading: contextLoading } = useAuth();
  const location = useLocation();
  // Show loading while context is loading - but with a timeout
  if (contextLoading) {
    // This prevents infinite loading
    console.log("Protected route: Loading state active");
    
    // Use useEffect to add a timeout to avoid infinite loading
    React.useEffect(() => {
      let timeoutId: number | undefined;
      
      if (contextLoading) {
        timeoutId = window.setTimeout(() => {
          console.log("Protected route: Loading timed out, redirecting to login");
          navigate(fallbackPath);
        }, 5000); // 5 second timeout
      }
      
      return () => {
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }, [contextLoading, navigate, fallbackPath]);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    console.log("Protected route: No user, redirecting to login");
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check permissions if user is authenticated and permissions are required
  if (requireAuth && user && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => {
      switch (permission) {
        case 'manage_users':
          return user.permissions?.can_manage_users || false;
        case 'access_analytics':
          return user.permissions?.can_access_analytics || false;
        case 'send_feedback':
          return user.permissions?.can_send_feedback || false;
        case 'view_reports':
          return user.permissions?.can_view_reports || false;
        case 'admin':
          return user.account_type === 'admin';
        case 'approved':
          return user.is_approved || false;
        default:
          console.warn(`Unknown permission: ${permission}`);
          return false;
      }
    });

    if (!hasAllPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Required permissions: {requiredPermissions.join(', ')}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Check if user needs approval (for team members) - legacy behavior preserved
  if (requireAuth && user && user.account_type === 'user' && !user.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully. Please wait for an administrator to approve your access.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
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