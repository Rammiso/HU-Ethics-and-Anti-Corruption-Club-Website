import { AppError } from './errorHandler.js';
import { ADMIN_ROLES } from '../models/Admin.js';

/**
 * Legacy authorization middleware (kept for backward compatibility)
 * Use the new auth.js middleware instead
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED'));
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return next(new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS'));
    }

    next();
  };
};

// Convenience exports using the new role constants
export const isSystemAdmin = authorize(ADMIN_ROLES.SUPER_ADMIN);
export const isCaseManager = authorize(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN);
export const isContentManager = authorize(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN);

// Note: This file is deprecated. Use middleware/auth.js instead
