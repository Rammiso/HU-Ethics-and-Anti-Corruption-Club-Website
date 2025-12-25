import dashboardService from '../services/dashboardService.js';
import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Dashboard Controller
 * Handles admin dashboard endpoints for metrics and monitoring
 */

/**
 * Get dashboard summary metrics
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    
    // Log dashboard access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_DASHBOARD',
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      details: { action: 'dashboard_summary' },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    logger.error('Failed to get dashboard summary:', error);
    throw error;
  }
};

/**
 * Get detailed report statistics
 */
export const getReportStatistics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const statistics = await dashboardService.getReportStatistics(timeRange);
    
    // Log statistics access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_REPORT_STATISTICS',
      resourceType: RESOURCE_TYPES.REPORT,
      details: { timeRange },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    logger.error('Failed to get report statistics:', error);
    throw error;
  }
};

/**
 * Get system health metrics
 */
export const getSystemHealth = async (req, res) => {
  try {
    const health = await dashboardService.getSystemHealth();
    
    // Log system health check
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_SYSTEM_HEALTH',
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      details: { status: health.status },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: health
    });
    
  } catch (error) {
    logger.error('Failed to get system health:', error);
    throw error;
  }
};

/**
 * Get admin activity summary
 */
export const getAdminActivity = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const activity = await dashboardService.getAdminActivity(timeRange);
    
    // Log admin activity view
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_ADMIN_ACTIVITY',
      resourceType: RESOURCE_TYPES.ADMIN,
      details: { timeRange },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: activity
    });
    
  } catch (error) {
    logger.error('Failed to get admin activity:', error);
    throw error;
  }
};

/**
 * Get current admin profile
 */
export const getAdminProfile = async (req, res) => {
  try {
    // Admin is already attached to req by auth middleware
    const admin = req.admin;
    
    // Return safe profile data (no password)
    const profileData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      lastLogin: admin.lastLogin
    };
    
    res.json({
      success: true,
      data: profileData
    });
    
  } catch (error) {
    logger.error('Failed to get admin profile:', error);
    throw error;
  }
};

/**
 * Update admin profile
 */
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = req.admin;
    
    // Store old values for audit
    const oldValues = {
      name: admin.name,
      email: admin.email
    };
    
    // Update allowed fields
    if (name !== undefined) {
      if (name.trim().length < 2) {
        throw new AppError('Name must be at least 2 characters long', 400, 'INVALID_NAME');
      }
      admin.name = name.trim();
    }
    
    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
      }
      
      // Check if email is already taken by another admin
      const Admin = admin.constructor;
      const existingAdmin = await Admin.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: admin._id }
      });
      
      if (existingAdmin) {
        throw new AppError('Email is already in use', 400, 'EMAIL_IN_USE');
      }
      
      admin.email = email.toLowerCase();
    }
    
    await admin.save();
    
    // Log profile update
    await auditService.log({
      adminId: admin._id,
      action: 'UPDATE_ADMIN_PROFILE',
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: admin._id,
      details: {
        oldValues,
        newValues: {
          name: admin.name,
          email: admin.email
        }
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Admin profile updated', {
      adminId: admin._id,
      email: admin.email
    });
    
    // Return updated profile
    const profileData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
    });
    
  } catch (error) {
    logger.error('Failed to update admin profile:', error);
    throw error;
  }
};