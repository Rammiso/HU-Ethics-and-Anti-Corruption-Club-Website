import express from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { auditView } from '../middleware/auditMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAuditLogs,
  getAuditStatistics,
  getResourceAuditLogs,
  getAdminAuditLogs,
  exportAuditLogs,
  getMyAuditLogs
} from '../controllers/auditController.js';
import {
  getReportsForAdmin,
  getReportDetailsForAdmin,
  updateReportStatus,
  assignReport,
  addInternalNote,
  sendMessageToReporter,
  downloadEvidenceFile,
  getReportStatistics,
  bulkUpdateReports
} from '../controllers/reportController.js';
import reportCategoryRoutes from './reportCategoryRoutes.js';
import newsRoutes from './newsRoutes.js';
import eventRoutes from './eventRoutes.js';

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);

/**
 * Admin Dashboard Routes
 */

// Dashboard overview (all admins)
router.get('/dashboard', requireAdmin, asyncHandler(async (req, res) => {
  // TODO: Implement dashboard data aggregation
  res.status(501).json({
    success: false,
    message: 'Dashboard endpoint not implemented yet',
    note: 'This will return system statistics and overview data'
  });
}));

/**
 * Reports Management Routes (Admin access)
 */

// Get all reports (with filtering and pagination)
router.get('/reports', 
  requireAdmin, 
  auditView('Report', { logViews: true }), 
  asyncHandler(getReportsForAdmin)
);

// Get report statistics
router.get('/reports/statistics', 
  requireAdmin, 
  asyncHandler(getReportStatistics)
);

// Bulk update reports
router.post('/reports/bulk-update', 
  requireAdmin, 
  asyncHandler(bulkUpdateReports)
);

// Get specific report details
router.get('/reports/:id', 
  requireAdmin, 
  auditView('Report', { logViews: true }), 
  asyncHandler(getReportDetailsForAdmin)
);

// Update report status
router.put('/reports/:id/status', 
  requireAdmin, 
  asyncHandler(updateReportStatus)
);

// Assign report to admin
router.put('/reports/:id/assign', 
  requireAdmin, 
  asyncHandler(assignReport)
);

// Add internal note to report
router.post('/reports/:id/notes', 
  requireAdmin, 
  asyncHandler(addInternalNote)
);

// Send message to reporter
router.post('/reports/:id/messages', 
  requireAdmin, 
  asyncHandler(sendMessageToReporter)
);

// Download evidence file
router.get('/reports/:id/evidence/:filename', 
  requireAdmin, 
  asyncHandler(downloadEvidenceFile)
);

/**
 * Report Categories Management Routes (Admin access)
 */
router.use('/report-categories', reportCategoryRoutes);

/**
 * Content Management Routes (Admin access)
 */

// News management
router.use('/news', newsRoutes);

// Events management
router.use('/events', eventRoutes);

/**
 * Contact Messages Routes (Admin access)
 */

router.get('/contact-messages', requireAdmin, auditView('ContactMessage', { logViews: true }), asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Contact messages endpoint not implemented yet'
  });
}));

/**
 * Super Admin Only Routes
 */

// User management (Super Admin only)
router.get('/users', requireSuperAdmin, asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'User management endpoint not implemented yet',
    note: 'Super Admin access required'
  });
}));

router.post('/users', requireSuperAdmin, asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'User creation endpoint not implemented yet',
    note: 'Super Admin access required'
  });
}));

/**
 * Audit Logs Routes (Super Admin only)
 */

// Get all audit logs with filtering
router.get('/audit-logs', requireSuperAdmin, auditView('AuditLog', { logViews: true }), getAuditLogs);

// Get audit statistics
router.get('/audit-logs/statistics', requireSuperAdmin, getAuditStatistics);

// Export audit logs
router.get('/audit-logs/export', requireSuperAdmin, exportAuditLogs);

// Get audit logs for specific resource
router.get('/audit-logs/resource/:resourceType/:resourceId', requireSuperAdmin, getResourceAuditLogs);

// Get audit logs for specific admin
router.get('/audit-logs/admin/:adminId', requireSuperAdmin, getAdminAuditLogs);

// Get current admin's own activity logs (all admins can see their own)
router.get('/audit-logs/my-activity', requireAdmin, getMyAuditLogs);

// System settings (Super Admin only)
router.get('/settings', requireSuperAdmin, asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'System settings endpoint not implemented yet',
    note: 'Super Admin access required'
  });
}));

export default router;