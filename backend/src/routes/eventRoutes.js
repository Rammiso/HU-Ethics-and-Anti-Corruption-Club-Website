import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { auditView } from '../middleware/auditMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getUpcomingEvents,
  getPastEvents,
  getEventBySlug,
  getEventsForAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  unpublishEvent,
  getEventStatistics
} from '../controllers/eventController.js';

const router = express.Router();

/**
 * Public routes (no authentication required)
 */

// Get upcoming published events
router.get('/upcoming', asyncHandler(getUpcomingEvents));

// Get past published events
router.get('/past', asyncHandler(getPastEvents));

// Get event by slug
router.get('/slug/:slug', asyncHandler(getEventBySlug));

/**
 * Admin routes (authentication required)
 */

// All admin routes require authentication
router.use(authenticate);

// Get all events for admin (with filters and pagination)
router.get('/', 
  requireAdmin, 
  auditView('Event', { logViews: true }), 
  asyncHandler(getEventsForAdmin)
);

// Get event statistics
router.get('/statistics', 
  requireAdmin, 
  asyncHandler(getEventStatistics)
);

// Get specific event by ID
router.get('/:id', 
  requireAdmin, 
  auditView('Event', { logViews: true }), 
  asyncHandler(getEventById)
);

// Create new event
router.post('/', 
  requireAdmin, 
  asyncHandler(createEvent)
);

// Update event
router.put('/:id', 
  requireAdmin, 
  asyncHandler(updateEvent)
);

// Delete event
router.delete('/:id', 
  requireAdmin, 
  asyncHandler(deleteEvent)
);

// Publish event
router.put('/:id/publish', 
  requireAdmin, 
  asyncHandler(publishEvent)
);

// Unpublish event
router.put('/:id/unpublish', 
  requireAdmin, 
  asyncHandler(unpublishEvent)
);

export default router;