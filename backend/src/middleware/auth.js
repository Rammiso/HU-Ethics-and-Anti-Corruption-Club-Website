import authService from "../services/authService.js";
import { AppError } from "./errorHandler.js";
import logger from "../utils/logger.js";

/**
 * Authentication middleware
 * Verifies JWT token and attaches admin data to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        "No authorization header provided",
        401,
        "NO_AUTH_HEADER"
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "Invalid authorization header format",
        401,
        "INVALID_AUTH_FORMAT"
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AppError("No token provided", 401, "NO_TOKEN");
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach admin data to request object
    req.admin = {
      id: decoded.id,
      _id: decoded.id, // Add _id for Mongoose compatibility
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (error) {
    // Log authentication failure
    logger.warn("Authentication failed", {
      error: error.message,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.originalUrl,
    });

    next(error);
  }
};

/**
 * Authorization middleware factory
 * Creates middleware that checks if admin has required role(s)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if admin data exists (should be set by authenticate middleware)
      if (!req.admin) {
        throw new AppError(
          "Authentication required",
          401,
          "AUTHENTICATION_REQUIRED"
        );
      }

      // Check if admin role is in allowed roles
      if (!allowedRoles.includes(req.admin.role)) {
        logger.warn("Authorization failed - insufficient permissions", {
          adminId: req.admin.id,
          adminRole: req.admin.role,
          requiredRoles: allowedRoles,
          url: req.originalUrl,
          method: req.method,
        });

        throw new AppError(
          "Insufficient permissions",
          403,
          "INSUFFICIENT_PERMISSIONS"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Convenience middleware for admin-only routes
 */
export const requireAdmin = authorize("ADMIN", "SUPER_ADMIN");

/**
 * Convenience middleware for super admin-only routes
 */
export const requireSuperAdmin = authorize("SUPER_ADMIN");

/**
 * Optional authentication middleware
 * Attaches admin data if token is present, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      if (token) {
        try {
          const decoded = authService.verifyToken(token);
          req.admin = {
            id: decoded.id,
            _id: decoded.id, // Add _id for Mongoose compatibility
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
          };
        } catch (error) {
          // Token is invalid, but we don't throw error for optional auth
          logger.debug("Optional auth failed", { error: error.message });
        }
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail the request
    next();
  }
};
