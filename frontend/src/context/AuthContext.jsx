import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import { ADMIN_ROLES, ADMIN_STATUS } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Token storage utility with security considerations
const TokenStorage = {
  getToken: () => {
    try {
      return localStorage.getItem('accessToken');
    } catch (error) {
      console.error('Failed to get token from storage:', error);
      return null;
    }
  },
  
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Failed to set token in storage:', error);
    }
  },
  
  getUser: () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user from storage:', error);
      return null;
    }
  },
  
  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Failed to set user in storage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = TokenStorage.getToken();
        const savedUser = TokenStorage.getUser();
        
        if (savedToken && savedUser) {
          // Validate token with backend
          try {
            const response = await apiClient.get('/auth/validate');
            if (response.success) {
              setToken(savedToken);
              setUser(savedUser);
              setIsAuthenticated(true);
            } else {
              // Token is invalid, clear storage
              TokenStorage.clear();
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            TokenStorage.clear();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        TokenStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function with enhanced error handling
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setSessionExpired(false);
      
      const response = await apiClient.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
        rememberMe
      });

      const { token: accessToken, admin, expiresIn } = response.data;
      
      if (!accessToken || !admin) {
        throw new Error('Invalid response from server');
      }

      // Validate user status
      if (admin.status !== ADMIN_STATUS.ACTIVE) {
        throw new Error('Account is not active. Please contact administrator.');
      }
      
      // Save to storage
      TokenStorage.setToken(accessToken);
      TokenStorage.setUser(admin);
      
      // Update state
      setToken(accessToken);
      setUser(admin);
      setIsAuthenticated(true);
      
      return { success: true, user: admin, expiresIn };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Clear any existing auth data
      TokenStorage.clear();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 403) {
        throw new Error('Account is suspended or inactive');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function with proper cleanup
  const logout = useCallback(async (showMessage = true) => {
    try {
      // Call logout endpoint if token exists
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state and storage
      TokenStorage.clear();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(false);
      
      if (showMessage) {
        // You can add a notification here if needed
        console.log('Logged out successfully');
      }
    }
  }, [token]);

  // Update user profile
  const updateUser = useCallback((updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    TokenStorage.setUser(newUser);
  }, [user]);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    if (!token) return false;
    
    try {
      const response = await apiClient.get('/auth/validate');
      return response.success;
    } catch (error) {
      console.error('Auth validation failed:', error);
      if (error.response?.status === 401) {
        setSessionExpired(true);
        await logout(false);
      }
      return false;
    }
  }, [token, logout]);

  // Handle session expiry
  const handleSessionExpiry = useCallback(() => {
    setSessionExpired(true);
    logout(false);
  }, [logout]);

  // Role-based permission checks
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Define role-based permissions
    const rolePermissions = {
      [ADMIN_ROLES.SUPER_ADMIN]: [
        'manage_users',
        'manage_system',
        'view_audit_logs',
        'manage_reports',
        'manage_content',
        'manage_events',
        'manage_news'
      ],
      [ADMIN_ROLES.CASE_MANAGER]: [
        'manage_reports',
        'view_reports',
        'update_report_status'
      ],
      [ADMIN_ROLES.CONTENT_MANAGER]: [
        'manage_content',
        'manage_news',
        'manage_events'
      ],
      [ADMIN_ROLES.PR_OFFICER]: [
        'manage_news',
        'manage_events',
        'view_reports'
      ]
    };
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  }, [user]);

  // Check if user can access a specific route
  const canAccessRoute = useCallback((routePermissions) => {
    if (!routePermissions || routePermissions.length === 0) return true;
    return routePermissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const value = {
    // State
    user,
    token,
    loading,
    isAuthenticated,
    sessionExpired,
    
    // Actions
    login,
    logout,
    updateUser,
    checkAuthStatus,
    handleSessionExpiry,
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasPermission,
    canAccessRoute,
    
    // Convenience getters
    isAdmin: user?.role === ADMIN_ROLES.ADMIN,
    isSuperAdmin: user?.role === ADMIN_ROLES.SUPER_ADMIN,
    isCaseManager: user?.role === ADMIN_ROLES.CASE_MANAGER,
    isContentManager: user?.role === ADMIN_ROLES.CONTENT_MANAGER,
    isPROfficer: user?.role === ADMIN_ROLES.PR_OFFICER,
    isActive: user?.status === ADMIN_STATUS.ACTIVE,
    
    // User info
    userName: user?.name || '',
    userEmail: user?.email || '',
    userRole: user?.role || '',
    userStatus: user?.status || ''
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
