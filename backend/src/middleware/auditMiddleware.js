import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS } from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * Audit middleware for automatic logging of admin actions
 */

/**
 * Extract request metadata for audit logging
 */
const extractMetadata = (req) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    requestUrl: req.originalUrl,
    requestMethod: req.method
  };
};

/**
 * Generic audit logging middleware
 * Logs the action after the request is processed
 */
export const auditAction = (action, resourceType, options = {}) => {
  return (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Call original json method first
      const result = originalJson.call(this, data);
      
      // Perform audit logging asynchronously (don't block response)
      setImmediate(async () => {
        try {
          if (!req.admin) {
            logger.warn('Audit middleware called without admin context', { action });
            return;
          }
          
          const metadata = extractMetadata(req);
          const success = res.statusCode < 400;
          const errorMessage = success ? null : data?.error?.message || 'Unknown error';
          
          // Extract resource ID from various sources
          let resourceId = null;
          if (options.resourceIdParam) {
            resourceId = req.params[options.resourceIdParam];
          } else if (options.resourceIdBody) {
            resourceId = req.body[options.resourceIdBody];
          } else if (data?.data?._id) {
            resourceId = data.data._id;
          } else if (data?.data?.id) {
            resourceId = data.data.id;
          }
          
          // Extract details
          let details = {};
          if (options.includeBody && req.body) {
            details.requestBody = req.body;
          }
          if (options.includeParams && req.params) {
            details.requestParams = req.params;
          }
          if (options.includeQuery && req.query) {
            details.requestQuery = req.query;
          }
          if (options.customDetails && typeof options.customDetails === 'function') {
            details = { ...details, ...options.customDetails(req, res, data) };
          }
          
          await auditService.log({
            adminId: req.admin.id,
            action,
            resourceType,
            resourceId,
            details,
            metadata,
            success,
            errorMessage
          });
          
        } catch (error) {
          logger.error('Audit logging failed', { error: error.message, action });
        }
      });
      
      return result;
    };
    
    next();
  };
};

/**
 * Authentication audit middleware
 */
export const auditAuth = (action) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const result = originalJson.call(this, data);
      
      setImmediate(async () => {
        try {
          const metadata = extractMetadata(req);
          const success = res.statusCode < 400;
          const errorMessage = success ? null : data?.error?.message || 'Authentication failed';
          
          // For login, admin ID might be in response data
          let adminId = req.admin?.id;
          if (!adminId && data?.data?.admin?._id) {
            adminId = data.data.admin._id;
          }
          if (!adminId && data?.data?.admin?.id) {
            adminId = data.data.admin.id;
          }
          
          if (adminId) {
            await auditService.logAuth(adminId, action, metadata, success, errorMessage);
          }
          
        } catch (error) {
          logger.error('Auth audit logging failed', { error: error.message, action });
        }
      });
      
      return result;
    };
    
    next();
  };
};

/**
 * View action audit middleware (for sensitive data access)
 */
export const auditView = (resourceType, options = {}) => {
  return async (req, res, next) => {
    try {
      if (req.admin && options.logViews) {
        const metadata = extractMetadata(req);
        const resourceId = req.params.id || req.params.resourceId;
        
        // Log view action asynchronously
        setImmediate(async () => {
          try {
            let action;
            switch (resourceType) {
              case 'Report':
                action = AUDIT_ACTIONS.VIEW_REPORT;
                break;
              case 'ContactMessage':
                action = AUDIT_ACTIONS.VIEW_CONTACT_MESSAGE;
                break;
              case 'AuditLog':
                action = AUDIT_ACTIONS.VIEW_AUDIT_LOGS;
                break;
              default:
                action = 'VIEW_' + resourceType.toUpperCase();
            }
            
            await auditService.log({
              adminId: req.admin.id,
              action,
              resourceType,
              resourceId,
              metadata,
              success: true
            });
          } catch (error) {
            logger.error('View audit logging failed', { error: error.message });
          }
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Bulk action audit middleware
 */
export const auditBulkAction = (action, resourceType) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const result = originalJson.call(this, data);
      
      setImmediate(async () => {
        try {
          if (!req.admin) return;
          
          const metadata = extractMetadata(req);
          const success = res.statusCode < 400;
          const errorMessage = success ? null : data?.error?.message || 'Bulk operation failed';
          
          const details = {
            bulkOperation: true,
            affectedCount: data?.data?.affectedCount || 0,
            requestBody: req.body
          };
          
          await auditService.log({
            adminId: req.admin.id,
            action,
            resourceType,
            details,
            metadata,
            success,
            errorMessage
          });
          
        } catch (error) {
          logger.error('Bulk audit logging failed', { error: error.message, action });
        }
      });
      
      return result;
    };
    
    next();
  };
};

/**
 * File operation audit middleware
 */
export const auditFileOperation = (action, resourceType) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const result = originalJson.call(this, data);
      
      setImmediate(async () => {
        try {
          if (!req.admin) return;
          
          const metadata = extractMetadata(req);
          const success = res.statusCode < 400;
          
          const details = {
            fileName: req.file?.originalname || req.body?.fileName,
            fileSize: req.file?.size,
            fileType: req.file?.mimetype
          };
          
          await auditService.log({
            adminId: req.admin.id,
            action,
            resourceType,
            resourceId: req.params.id,
            details,
            metadata,
            success,
            errorMessage: success ? null : data?.error?.message
          });
          
        } catch (error) {
          logger.error('File operation audit logging failed', { error: error.message, action });
        }
      });
      
      return result;
    };
    
    next();
  };
};