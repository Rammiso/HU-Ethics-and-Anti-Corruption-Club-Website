import jwt from "jsonwebtoken";
import PublicUser, { USER_STATUS } from "../models/PublicUser.js";
import logger from "../utils/logger.js";

/**
 * User Authentication Controller
 * Handles public user registration, login, and profile management
 * Completely separate from admin authentication
 */

// Generate JWT token for user
const generateUserToken = (userId) => {
  const secret = process.env.JWT_USER_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_USER_EXPIRES_IN || "7d";

  return jwt.sign({ id: userId, type: "user" }, secret, { expiresIn });
};

/**
 * @route   POST /api/v1/auth/user/register
 * @desc    Register a new public user
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await PublicUser.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Create user
    const user = await PublicUser.createUser({
      email,
      password,
      profile: {
        name: name || null,
      },
    });

    // Generate token
    const token = generateUserToken(user._id);

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error("User registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @route   POST /api/v1/auth/user/login
 * @desc    Login a public user
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email (with password selected)
    const user = await PublicUser.findActiveByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message:
          "Account is locked due to multiple failed login attempts. Please try again later.",
      });
    }

    // Check if account is suspended
    if (user.status === USER_STATUS.SUSPENDED) {
      return res.status(403).json({
        success: false,
        message: "Account has been suspended. Please contact support.",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();
    await user.updateLastLogin();

    // Generate token
    const token = generateUserToken(user._id);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    logger.error("User login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/v1/auth/user/me
 * @desc    Get current user profile
 * @access  Private (User)
 */
export const getMe = async (req, res) => {
  try {
    const user = await PublicUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @route   POST /api/v1/auth/user/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private (User)
 */
export const logout = async (req, res) => {
  try {
    // In a JWT-based system, logout is mainly handled client-side
    // Server-side, we can log the event
    logger.info(`User logged out: ${req.user?.id}`);

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    logger.error("User logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  register,
  login,
  getMe,
  logout,
};
