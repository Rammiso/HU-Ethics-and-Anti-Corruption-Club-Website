import express from 'express';
import { authenticate, requireSuperAdmin, requireAdmin } from '../middleware/auth.js';
import { auditView } from '../middleware/auditMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAllSettings,
  getSettingByKey,
  createOrUpdateSetting,
  updateSettingValue,
  deleteSetting,
  getSettingsByCategory,
  getPublicSettings,
  bulkUpdateSettings,
  initializeDefaultSettings
} from '../controllers/systemSettingsController.js';

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * Public settings (accessible by all admins)
 */
router.get('/public', 
  requireAdmin,
  asyncHandler(getPublicSettings)
);

/**
 * All other routes require SUPER_ADMIN role
 */

// Get all settings
router.get('/', 
  requireSuperAdmin,
  auditView('SystemSettings', { logViews: true }), 
  asyncHandler(getAllSettings)
);

// Initialize default settings
router.post('/initialize', 
  requireSuperAdmin,
  asyncHandler(initializeDefaultSettings)
);

// Bulk update settings
router.put('/bulk-update', 
  requireSuperAdmin,
  asyncHandler(bulkUpdateSettings)
);

// Get settings by category
router.get('/category/:category', 
  requireSuperAdmin,
  asyncHandler(getSettingsByCategory)
);

// Get setting by key
router.get('/:key', 
  requireSuperAdmin,
  auditView('SystemSettings', { logViews: true }), 
  asyncHandler(getSettingByKey)
);

// Create or update setting
router.post('/', 
  requireSuperAdmin,
  asyncHandler(createOrUpdateSetting)
);

// Update setting value
router.put('/:key', 
  requireSuperAdmin,
  asyncHandler(updateSettingValue)
);

// Delete setting
router.delete('/:key', 
  requireSuperAdmin,
  asyncHandler(deleteSetting)
);

export default router;