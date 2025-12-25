import express from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { auditView } from '../middleware/auditMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getReportCategories,
  getActiveReportCategories,
  getReportCategoryById,
  createReportCategory,
  updateReportCategory,
  deleteReportCategory,
  updateCategoryOrder,
  getCategoryStatistics
} from '../controllers/reportCategoryController.js';

const router = express.Router();

/**
 * Public routes (no authentication required)
 */

// Get active report categories for public use
router.get('/active', asyncHandler(getActiveReportCategories));

/**
 * Admin routes (authentication required)
 */

// All admin routes require authentication
router.use(authenticate);

// Get all report categories (admin view with filters)
router.get('/', 
  requireAdmin, 
  auditView('ReportCategory', { logViews: true }), 
  asyncHandler(getReportCategories)
);

// Get specific report category
router.get('/:id', 
  requireAdmin, 
  auditView('ReportCategory', { logViews: true }), 
  asyncHandler(getReportCategoryById)
);

// Create new report category
router.post('/', 
  requireAdmin, 
  asyncHandler(createReportCategory)
);

// Update report category
router.put('/:id', 
  requireAdmin, 
  asyncHandler(updateReportCategory)
);

// Delete report category (Super Admin only)
router.delete('/:id', 
  requireSuperAdmin, 
  asyncHandler(deleteReportCategory)
);

// Update category display order
router.put('/order/update', 
  requireAdmin, 
  asyncHandler(updateCategoryOrder)
);

// Get category statistics
router.get('/:id/statistics', 
  requireAdmin, 
  auditView('ReportCategory', { logViews: true }), 
  asyncHandler(getCategoryStatistics)
);

export default router;