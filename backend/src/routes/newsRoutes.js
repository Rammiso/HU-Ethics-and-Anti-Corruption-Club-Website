import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { auditView } from '../middleware/auditMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getPublishedNews,
  getNewsBySlug,
  getNewsForAdmin,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  publishNews,
  unpublishNews,
  getNewsStatistics
} from '../controllers/newsController.js';

const router = express.Router();

/**
 * Public routes (no authentication required)
 */

// Get published news articles
router.get('/published', asyncHandler(getPublishedNews));

// Get news article by slug
router.get('/slug/:slug', asyncHandler(getNewsBySlug));

/**
 * Admin routes (authentication required)
 */

// All admin routes require authentication
router.use(authenticate);

// Get all news for admin (with filters and pagination)
router.get('/', 
  requireAdmin, 
  auditView('News', { logViews: true }), 
  asyncHandler(getNewsForAdmin)
);

// Get news statistics
router.get('/statistics', 
  requireAdmin, 
  asyncHandler(getNewsStatistics)
);

// Get specific news article by ID
router.get('/:id', 
  requireAdmin, 
  auditView('News', { logViews: true }), 
  asyncHandler(getNewsById)
);

// Create new news article
router.post('/', 
  requireAdmin, 
  asyncHandler(createNews)
);

// Update news article
router.put('/:id', 
  requireAdmin, 
  asyncHandler(updateNews)
);

// Delete news article
router.delete('/:id', 
  requireAdmin, 
  asyncHandler(deleteNews)
);

// Publish news article
router.put('/:id/publish', 
  requireAdmin, 
  asyncHandler(publishNews)
);

// Unpublish news article
router.put('/:id/unpublish', 
  requireAdmin, 
  asyncHandler(unpublishNews)
);

export default router;