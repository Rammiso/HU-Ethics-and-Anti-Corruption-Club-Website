import authService from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Authentication Controller
 * Handles HTTP requests for admin authentication
 */

/**
 * Admin login
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  const result = await authService.login(email, password, ipAddress, userAgent);
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * Admin logout
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const result = await authService.logout(adminId, ipAddress);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * Get current admin profile
 * GET /api/v1/auth/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  
  const admin = await authService.getProfile(adminId);
  
  res.status(200).json({
    success: true,
    data: admin
  });
});

/**
 * Change admin password
 * PUT /api/v1/auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.admin.id;
  
  const result = await authService.changePassword(adminId, currentPassword, newPassword);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * Validate token (for frontend token verification)
 * GET /api/v1/auth/validate
 */
export const validateToken = asyncHandler(async (req, res) => {
  // If we reach here, token is valid (middleware already verified it)
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      admin: req.admin,
      tokenValid: true
    }
  });
});