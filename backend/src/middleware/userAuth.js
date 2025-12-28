import jwt from "jsonwebtoken";
import PublicUser, { USER_STATUS } from "../models/PublicUser.js";
import logger from "../utils/logger.js";

/**
 * User Authentication Middleware
 * Handles JWT verification for public users (separate from admin auth)
 */

/**
 * Middleware to verify user JWT token
 * Requires user to be authenticated with a valid user token
 */
export const requireUserAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login as a user.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token using user-specific secret
    const userSecret = process.env.JWT_USER_SECRET || process.env.JWT_SECRET;

    let decoded;
    try {
      decoded = jwt.verify(token, userSecret);
    } catch (jwtError) {
      logger.warn("Invalid user token:", jwtError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }

    // Verify this is a user token (not admin)
    if (decoded.type !== "user") {
      return res.status(403).json({
        success: false,
        message: "Invalid token type. Admin tokens cannot access user routes.",
      });
    }

    // Find user by ID from token
    const user = await PublicUser.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Account may have been deleted.",
      });
    }

    // Check if user is active
    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({
        success: false,
        message: "Account is not active. Please contact support.",
      });
    }

    // Attach user to request object (without password)
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile,
    };

    next();
  } catch (error) {
    logger.error("User auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Middleware to check if user account is active
 * Should be used after requireUserAuth
 */
export const isActiveUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    next();
  } catch (error) {
    logger.error("Active user check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking user status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Optional middleware to attach user info if token is present
 * Does not require authentication (no error if no token)
 */
export const optionalUserAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // No token, continue without user info
    }

    const token = authHeader.substring(7);
    const userSecret = process.env.JWT_USER_SECRET || process.env.JWT_SECRET;

    try {
      const decoded = jwt.verify(token, userSecret);

      if (decoded.type === "user") {
        const user = await PublicUser.findById(decoded.id);

        if (user && user.status === USER_STATUS.ACTIVE) {
          req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            status: user.status,
            profile: user.profile,
          };
        }
      }
    } catch (jwtError) {
      // Invalid token, but that's okay for optional auth
      logger.debug("Optional user auth: Invalid token");
    }

    next();
  } catch (error) {
    logger.error("Optional user auth error:", error);
    next(); // Continue even if there's an error
  }
};

export default {
  requireUserAuth,
  isActiveUser,
  optionalUserAuth,
};
