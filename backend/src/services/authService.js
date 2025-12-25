import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { AppError } from '../middleware/errorHandler.js';
import auditService from './auditService.js';
import { AUDIT_ACTIONS } from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * Authentication Service
 * Handles admin login, token generation, and validation
 */
class AuthService {
  
  /**
   * Generate JWT token for authenticated admin
   */
  generateToken(admin) {
    const payload = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      name: admin.name
    };
    
    const options = {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      issuer: 'hueacc-api',
      audience: 'hueacc-admin'
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }
  
  /**
   * Verify JWT token and return decoded payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'hueacc-api',
        audience: 'hueacc-admin'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }
      throw new AppError('Token verification failed', 401, 'TOKEN_VERIFICATION_FAILED');
    }
  }
  
  /**
   * Authenticate admin with email and password
   */
  async login(email, password, ipAddress, userAgent) {
    let adminId = null;
    let success = false;
    let errorMessage = null;
    
    try {
      // Input validation
      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'MISSING_CREDENTIALS');
      }
      
      // Find admin by email (including password field)
      const admin = await Admin.findActiveByEmail(email);
      
      if (!admin) {
        logger.warn('Login attempt with non-existent email', { email, ipAddress });
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
      
      adminId = admin._id;
      
      // Check if account is locked
      if (admin.isLocked) {
        logger.warn('Login attempt on locked account', { 
          adminId: admin._id, 
          email: admin.email, 
          ipAddress 
        });
        throw new AppError('Account is temporarily locked due to too many failed attempts', 423, 'ACCOUNT_LOCKED');
      }
      
      // Verify password
      const isPasswordValid = await admin.comparePassword(password);
      
      if (!isPasswordValid) {
        // Increment login attempts
        await admin.incLoginAttempts();
        
        logger.warn('Failed login attempt', { 
          adminId: admin._id, 
          email: admin.email, 
          attempts: admin.loginAttempts + 1,
          ipAddress 
        });
        
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
      
      // Reset login attempts on successful login
      if (admin.loginAttempts > 0) {
        await admin.resetLoginAttempts();
      }
      
      // Update last login timestamp
      await admin.updateLastLogin();
      
      // Generate JWT token
      const token = this.generateToken(admin);
      
      success = true;
      
      // Log successful login
      logger.info('Successful admin login', {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        ipAddress,
        userAgent
      });
      
      // Return admin data and token (password excluded by toJSON)
      return {
        admin: admin.toJSON(),
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      };
      
    } catch (error) {
      success = false;
      errorMessage = error.message;
      throw error;
    } finally {
      // Always log the login attempt
      if (adminId) {
        await auditService.logAuth(
          adminId,
          AUDIT_ACTIONS.LOGIN,
          { ipAddress, userAgent },
          success,
          errorMessage
        );
      }
    }
  }
  
  /**
   * Logout admin
   */
  async logout(adminId, ipAddress, userAgent) {
    try {
      logger.info('Admin logout', { adminId, ipAddress });
      
      // Log logout action
      await auditService.logAuth(
        adminId,
        AUDIT_ACTIONS.LOGOUT,
        { ipAddress, userAgent },
        true
      );
      
      // TODO: Implement token blacklisting if needed
      // For now, we rely on token expiration
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      // Log failed logout attempt
      await auditService.logAuth(
        adminId,
        AUDIT_ACTIONS.LOGOUT,
        { ipAddress, userAgent },
        false,
        error.message
      );
      throw error;
    }
  }
  
  /**
   * Get admin profile by ID
   */
  async getProfile(adminId) {
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      throw new AppError('Admin not found', 404, 'ADMIN_NOT_FOUND');
    }
    
    if (admin.status !== 'ACTIVE') {
      throw new AppError('Admin account is disabled', 403, 'ACCOUNT_DISABLED');
    }
    
    return admin.toJSON();
  }
  
  /**
   * Change admin password
   */
  async changePassword(adminId, currentPassword, newPassword, ipAddress, userAgent) {
    let success = false;
    let errorMessage = null;
    
    try {
      // Input validation
      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400, 'MISSING_PASSWORDS');
      }
      
      if (newPassword.length < 8) {
        throw new AppError('New password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
      }
      
      // Find admin with password
      const admin = await Admin.findById(adminId).select('+password');
      
      if (!admin) {
        throw new AppError('Admin not found', 404, 'ADMIN_NOT_FOUND');
      }
      
      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 401, 'INVALID_CURRENT_PASSWORD');
      }
      
      // Update password (will be hashed by pre-save middleware)
      admin.password = newPassword;
      await admin.save();
      
      success = true;
      
      logger.info('Password changed successfully', { adminId: admin._id });
      
      return { message: 'Password changed successfully' };
      
    } catch (error) {
      success = false;
      errorMessage = error.message;
      throw error;
    } finally {
      // Log password change attempt
      await auditService.logAuth(
        adminId,
        AUDIT_ACTIONS.CHANGE_PASSWORD,
        { ipAddress, userAgent },
        success,
        errorMessage
      );
    }
  }
}

export default new AuthService();