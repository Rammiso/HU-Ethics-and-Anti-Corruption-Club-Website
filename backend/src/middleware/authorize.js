import { AppError } from './errorHandler.js';
import { USER_ROLES } from '../utils/constants.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const isSystemAdmin = authorize(USER_ROLES.SYSTEM_ADMIN);
export const isCaseManager = authorize(USER_ROLES.CASE_MANAGER, USER_ROLES.SYSTEM_ADMIN);
export const isContentManager = authorize(USER_ROLES.CONTENT_MANAGER, USER_ROLES.SYSTEM_ADMIN);
