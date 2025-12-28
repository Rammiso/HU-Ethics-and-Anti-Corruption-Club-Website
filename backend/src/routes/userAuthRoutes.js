import express from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/userAuthController.js";
import { requireUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

/**
 * Public User Authentication Routes
 * These routes are completely separate from admin authentication
 * Base path: /api/v1/auth/user
 */

/**
 * @route   POST /api/v1/auth/user/register
 * @desc    Register a new public user
 * @access  Public
 */
router.post("/register", asyncHandler(register));

/**
 * @route   POST /api/v1/auth/user/login
 * @desc    Login a public user
 * @access  Public
 */
router.post("/login", asyncHandler(login));

/**
 * @route   GET /api/v1/auth/user/me
 * @desc    Get current user profile
 * @access  Private (User only)
 */
router.get("/me", requireUserAuth, asyncHandler(getMe));

/**
 * @route   POST /api/v1/auth/user/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private (User only)
 */
router.post("/logout", requireUserAuth, asyncHandler(logout));

export default router;
