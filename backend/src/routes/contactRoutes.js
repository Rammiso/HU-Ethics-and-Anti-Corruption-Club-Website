import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { auditView } from '../middleware/auditMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  submitContactMessage,
  getContactMessagesForAdmin,
  getContactMessageById,
  updateMessageStatus,
  addInternalNote,
  updateMessagePriority,
  markAsSpam,
  getContactStatistics,
  bulkUpdateMessages
} from '../controllers/contactController.js';

const router = express.Router();

/**
 * Public routes (no authentication required)
 */

// Submit contact message
router.post('/submit', asyncHandler(submitContactMessage));

/**
 * Admin routes (authentication required)
 */

// All admin routes require authentication
router.use(authenticate);

// Get all contact messages for admin (with filters and pagination)
router.get('/', 
  requireAdmin, 
  auditView('ContactMessage', { logViews: true }), 
  asyncHandler(getContactMessagesForAdmin)
);

// Get contact message statistics
router.get('/statistics', 
  requireAdmin, 
  asyncHandler(getContactStatistics)
);

// Bulk update contact messages
router.post('/bulk-update', 
  requireAdmin, 
  asyncHandler(bulkUpdateMessages)
);

// Get specific contact message by ID
router.get('/:id', 
  requireAdmin, 
  auditView('ContactMessage', { logViews: true }), 
  asyncHandler(getContactMessageById)
);

// Update contact message status
router.put('/:id/status', 
  requireAdmin, 
  asyncHandler(updateMessageStatus)
);

// Add internal note to contact message
router.post('/:id/notes', 
  requireAdmin, 
  asyncHandler(addInternalNote)
);

// Update message priority
router.put('/:id/priority', 
  requireAdmin, 
  asyncHandler(updateMessagePriority)
);

// Mark message as spam
router.put('/:id/spam', 
  requireAdmin, 
  asyncHandler(markAsSpam)
);

export default router;