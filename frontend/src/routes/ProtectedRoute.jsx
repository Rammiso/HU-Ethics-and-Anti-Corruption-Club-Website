import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoading } from '../components/common/Loading';
import { ROUTE_PERMISSIONS } from '../utils/constants';
import { Shield, AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = '/login',
  showAccessDenied = true
}) => {
  const { 
    isAuthenticated, 
    loading, 
    user, 
    hasPermission, 
    hasAnyRole, 
    canAccessRoute,
    sessionExpired 
  } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return <PageLoading text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || sessionExpired) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user account is active
  if (user?.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-warning-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Account Inactive</h3>
          <p className="text-muted-foreground mb-4">
            Your account is currently {user?.status?.toLowerCase()}. 
            Please contact the administrator for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Check route-based permissions
  const routePermissions = ROUTE_PERMISSIONS[location.pathname] || [];
  if (routePermissions.length > 0 && !canAccessRoute(routePermissions)) {
    if (!showAccessDenied) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-error-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page. 
            Contact your administrator if you believe this is an error.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your role: <span className="font-medium">{user?.role}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Required permissions: {routePermissions.join(', ')}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check specific required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );

    if (!hasRequiredPermissions) {
      if (!showAccessDenied) {
        return <Navigate to="/dashboard" replace />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-error-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Insufficient Permissions</h3>
            <p className="text-muted-foreground mb-4">
              You don't have the required permissions to access this resource.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Required: {requiredPermissions.join(', ')}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Check specific required roles
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (!showAccessDenied) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-error-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Role Required</h3>
          <p className="text-muted-foreground mb-4">
            This page requires specific role privileges that you don't have.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your role: <span className="font-medium">{user?.role}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Required roles: {requiredRoles.join(', ')}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Higher-order component for role-based route protection
export const withRoleProtection = (Component, requiredRoles = []) => {
  return (props) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Higher-order component for permission-based route protection
export const withPermissionProtection = (Component, requiredPermissions = []) => {
  return (props) => (
    <ProtectedRoute requiredPermissions={requiredPermissions}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
