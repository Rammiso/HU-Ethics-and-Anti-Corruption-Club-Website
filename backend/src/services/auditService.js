import AuditLog, { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * Audit Service
 * Centralized service for creating and managing audit log entries
 */
class AuditService {
  
  /**
   * Create an audit log entry
   * @param {Object} params - Audit log parameters
   * @param {string} params.adminId - ID of the admin performing the action
   * @param {string} params.action - Action being performed (from AUDIT_ACTIONS)
   * @param {string} params.resourceType - Type of resource affected (from RESOURCE_TYPES)
   * @param {string} params.resourceId - ID of the affected resource (optional)
   * @param {Object} params.details - Additional details about the action
   * @param {Object} params.metadata - Request metadata (IP, user agent, etc.)
   * @param {boolean} params.success - Whether the action was successful
   * @param {string} params.errorMessage - Error message if action failed
   */
  async log({
    adminId,
    action,
    resourceType,
    resourceId = null,
    details = {},
    metadata = {},
    success = true,
    errorMessage = null
  }) {
    try {
      // Validate required parameters
      if (!adminId || !action || !resourceType) {
        logger.warn('Audit log missing required parameters', {
          adminId,
          action,
          resourceType
        });
        return null;
      }
      
      // Validate action type
      if (!Object.values(AUDIT_ACTIONS).includes(action)) {
        logger.warn('Invalid audit action type', { action });
        return null;
      }
      
      // Validate resource type
      if (!Object.values(RESOURCE_TYPES).includes(resourceType)) {
        logger.warn('Invalid resource type', { resourceType });
        return null;
      }
      
      // Sanitize details to prevent large objects
      const sanitizedDetails = this.sanitizeDetails(details);
      
      // Create audit log entry
      const auditLogData = {
        adminId,
        action,
        resourceType,
        resourceId,
        details: sanitizedDetails,
        metadata: {
          ipAddress: metadata.ipAddress || 'unknown',
          userAgent: metadata.userAgent || 'unknown',
          requestUrl: metadata.requestUrl,
          requestMethod: metadata.requestMethod
        },
        success,
        errorMessage
      };
      
      const auditLog = await AuditLog.createEntry(auditLogData);
      
      if (auditLog) {
        logger.info('Audit log created', {
          auditLogId: auditLog._id,
          adminId,
          action,
          resourceType,
          success
        });
      }
      
      return auditLog;
      
    } catch (error) {
      // Never let audit logging failures disrupt main operations
      logger.error('Failed to create audit log', {
        error: error.message,
        adminId,
        action,
        resourceType
      });
      return null;
    }
  }
  
  /**
   * Log authentication actions
   */
  async logAuth(adminId, action, metadata, success = true, errorMessage = null) {
    return await this.log({
      adminId,
      action,
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: adminId,
      metadata,
      success,
      errorMessage
    });
  }
  
  /**
   * Log report management actions
   */
  async logReportAction(adminId, action, reportId, details, metadata, success = true, errorMessage = null) {
    return await this.log({
      adminId,
      action,
      resourceType: RESOURCE_TYPES.REPORT,
      resourceId: reportId,
      details,
      metadata,
      success,
      errorMessage
    });
  }
  
  /**
   * Log news management actions
   */
  async logNewsAction(adminId, action, newsId, details, metadata, success = true, errorMessage = null) {
    return await this.log({
      adminId,
      action,
      resourceType: RESOURCE_TYPES.NEWS,
      resourceId: newsId,
      details,
      metadata,
      success,
      errorMessage
    });
  }
  
  /**
   * Log event management actions
   */
  async logEventAction(adminId, action, eventId, details, metadata, success = true, errorMessage = null) {
    return await this.log({
      adminId,
      action,
      resourceType: RESOURCE_TYPES.EVENT,
      resourceId: eventId,
      details,
      metadata,
      success,
      errorMessage
    });
  }
  
  /**
   * Log admin management actions
   */
  async logAdminAction(adminId, action, targetAdminId, details, metadata, success = true, errorMessage = null) {
    return await this.log({
      adminId,
      action,
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: targetAdminId,
      details,
      metadata,
      success,
      errorMessage
    });
  }
  
  /**
   * Log contact message actions
   */
  async logContactAction(adminId, action, messageId, details, metadata, success = true, errorMessage = null) {
    return await this.log({
      adminId,
      action,
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      resourceId: messageId,
      details,
      metadata,
      success,
      errorMessage
    });
  }
  
  /**
   * Log system actions
   */
  async logSystemAction(adminId, action, details, metadata, success = true, errorMessage = null) {
    return await this.log({
      adminId,
      action,
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      details,
      metadata,
      success,
      errorMessage
    });
  }
  
  /**
   * Get audit logs with filtering and pagination
   */
  async getLogs(filters = {}, options = {}) {
    try {
      const {
        adminId,
        action,
        resourceType,
        resourceId,
        startDate,
        endDate,
        success,
        ipAddress
      } = filters;
      
      const {
        page = 1,
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;
      
      // Build query
      let query = {};
      
      if (adminId) query.adminId = adminId;
      if (action) query.action = action;
      if (resourceType) query.resourceType = resourceType;
      if (resourceId) query.resourceId = resourceId;
      if (success !== undefined) query.success = success;
      if (ipAddress) query['metadata.ipAddress'] = ipAddress;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      // Execute query
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const logs = await AuditLog.find(query)
        .populate('adminId', 'name email role')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();
      
      const total = await AuditLog.countDocuments(query);
      
      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      logger.error('Failed to retrieve audit logs', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get audit statistics
   */
  async getStatistics(filters = {}) {
    try {
      const { startDate, endDate } = filters;
      
      return await AuditLog.getStatistics({ startDate, endDate });
      
    } catch (error) {
      logger.error('Failed to retrieve audit statistics', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get logs for a specific resource
   */
  async getResourceLogs(resourceType, resourceId, options = {}) {
    try {
      return await AuditLog.findByResource(resourceType, resourceId, options);
    } catch (error) {
      logger.error('Failed to retrieve resource audit logs', { 
        error: error.message,
        resourceType,
        resourceId
      });
      throw error;
    }
  }
  
  /**
   * Get logs for a specific admin
   */
  async getAdminLogs(adminId, options = {}) {
    try {
      return await AuditLog.findByAdmin(adminId, options);
    } catch (error) {
      logger.error('Failed to retrieve admin audit logs', { 
        error: error.message,
        adminId
      });
      throw error;
    }
  }
  
  /**
   * Sanitize details object to prevent large payloads
   */
  sanitizeDetails(details) {
    if (!details || typeof details !== 'object') {
      return {};
    }
    
    const sanitized = {};
    const maxStringLength = 500;
    const maxObjectDepth = 3;
    
    const sanitizeValue = (value, depth = 0) => {
      if (depth > maxObjectDepth) {
        return '[Object too deep]';
      }
      
      if (typeof value === 'string') {
        return value.length > maxStringLength 
          ? value.substring(0, maxStringLength) + '...'
          : value;
      }
      
      if (Array.isArray(value)) {
        return value.slice(0, 10).map(item => sanitizeValue(item, depth + 1));
      }
      
      if (value && typeof value === 'object') {
        const sanitizedObj = {};
        const keys = Object.keys(value).slice(0, 20); // Limit number of keys
        
        for (const key of keys) {
          sanitizedObj[key] = sanitizeValue(value[key], depth + 1);
        }
        
        return sanitizedObj;
      }
      
      return value;
    };
    
    return sanitizeValue(details);
  }
}

export default new AuditService();