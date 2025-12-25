import auditService from '../services/auditService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Audit Controller
 * Handles HTTP requests for audit log management (Super Admin only)
 */

/**
 * Get audit logs with filtering and pagination
 * GET /api/v1/admin/audit-logs
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    adminId,
    action,
    resourceType,
    resourceId,
    startDate,
    endDate,
    success,
    ipAddress,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
  
  const filters = {
    adminId,
    action,
    resourceType,
    resourceId,
    startDate,
    endDate,
    success: success !== undefined ? success === 'true' : undefined,
    ipAddress
  };
  
  const options = {
    page: pageNum,
    limit: limitNum,
    sortBy,
    sortOrder
  };
  
  const result = await auditService.getLogs(filters, options);
  
  res.status(200).json({
    success: true,
    data: result.logs,
    pagination: result.pagination,
    filters: filters
  });
});

/**
 * Get audit statistics
 * GET /api/v1/admin/audit-logs/statistics
 */
export const getAuditStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const filters = { startDate, endDate };
  const statistics = await auditService.getStatistics(filters);
  
  res.status(200).json({
    success: true,
    data: statistics,
    filters: filters
  });
});

/**
 * Get audit logs for a specific resource
 * GET /api/v1/admin/audit-logs/resource/:resourceType/:resourceId
 */
export const getResourceAuditLogs = asyncHandler(async (req, res) => {
  const { resourceType, resourceId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  
  const options = { page: pageNum, limit: limitNum };
  const logs = await auditService.getResourceLogs(resourceType, resourceId, options);
  
  res.status(200).json({
    success: true,
    data: logs,
    resourceType,
    resourceId
  });
});

/**
 * Get audit logs for a specific admin
 * GET /api/v1/admin/audit-logs/admin/:adminId
 */
export const getAdminAuditLogs = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { page = 1, limit = 50, startDate, endDate } = req.query;
  
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  
  const options = { 
    page: pageNum, 
    limit: limitNum,
    startDate,
    endDate
  };
  
  const logs = await auditService.getAdminLogs(adminId, options);
  
  res.status(200).json({
    success: true,
    data: logs,
    adminId
  });
});

/**
 * Export audit logs (for compliance)
 * GET /api/v1/admin/audit-logs/export
 */
export const exportAuditLogs = asyncHandler(async (req, res) => {
  const {
    adminId,
    action,
    resourceType,
    startDate,
    endDate,
    format = 'json'
  } = req.query;
  
  // Limit export to prevent performance issues
  const maxExportLimit = 10000;
  
  const filters = {
    adminId,
    action,
    resourceType,
    startDate,
    endDate
  };
  
  const options = {
    page: 1,
    limit: maxExportLimit,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  
  const result = await auditService.getLogs(filters, options);
  
  if (format === 'csv') {
    // Convert to CSV format
    const csvHeaders = [
      'Timestamp',
      'Admin ID',
      'Admin Name',
      'Action',
      'Resource Type',
      'Resource ID',
      'IP Address',
      'User Agent',
      'Success',
      'Error Message'
    ];
    
    const csvRows = result.logs.map(log => [
      log.createdAt,
      log.adminId._id,
      log.adminId.name,
      log.action,
      log.resourceType,
      log.resourceId || '',
      log.metadata.ipAddress,
      log.metadata.userAgent,
      log.success,
      log.errorMessage || ''
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } else {
    // JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`);
    res.status(200).json({
      success: true,
      exportDate: new Date().toISOString(),
      filters: filters,
      totalRecords: result.pagination.total,
      data: result.logs
    });
  }
});

/**
 * Get current admin's own audit logs
 * GET /api/v1/admin/audit-logs/my-activity
 */
export const getMyAuditLogs = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const { page = 1, limit = 50, startDate, endDate } = req.query;
  
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  
  const options = { 
    page: pageNum, 
    limit: limitNum,
    startDate,
    endDate
  };
  
  const logs = await auditService.getAdminLogs(adminId, options);
  
  res.status(200).json({
    success: true,
    data: logs,
    message: 'Your activity logs'
  });
});