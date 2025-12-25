import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadEvidence, cleanupTempFiles } from '../middleware/upload.js';
import {
  submitAnonymousReport,
  trackReportStatus,
  addReportMessage
} from '../controllers/reportController.js';
import { getActiveReportCategories } from '../controllers/reportCategoryController.js';

const router = express.Router();

/**
 * Public routes - No authentication required
 * These routes are accessible to anyone
 */

/**
 * Public content routes
 */

// Get published news articles
router.get('/news', asyncHandler(async (req, res) => {
  // TODO: Implement public news listing
  res.status(501).json({
    success: false,
    message: 'Public news endpoint not implemented yet',
    note: 'This will return published news articles'
  });
}));

// Get specific news article
router.get('/news/:id', asyncHandler(async (req, res) => {
  // TODO: Implement public news article retrieval
  res.status(501).json({
    success: false,
    message: 'Public news article endpoint not implemented yet',
    note: 'This will return a specific published news article'
  });
}));

// Get published events
router.get('/events', asyncHandler(async (req, res) => {
  // TODO: Implement public events listing
  res.status(501).json({
    success: false,
    message: 'Public events endpoint not implemented yet',
    note: 'This will return published events'
  });
}));

// Get specific event
router.get('/events/:id', asyncHandler(async (req, res) => {
  // TODO: Implement public event retrieval
  res.status(501).json({
    success: false,
    message: 'Public event endpoint not implemented yet',
    note: 'This will return a specific published event'
  });
}));

/**
 * Anonymous reporting routes
 */

// Get active report categories for report submission form
router.get('/report-categories', asyncHandler(getActiveReportCategories));

// Submit anonymous report with evidence files
router.post('/reports', 
  uploadEvidence, 
  cleanupTempFiles, 
  asyncHandler(submitAnonymousReport)
);

// Track report status using tracking ID
router.get('/reports/track/:trackingId', asyncHandler(trackReportStatus));

// Add message to existing report (anonymous follow-up)
router.post('/reports/:trackingId/messages', asyncHandler(addReportMessage));

/**
 * Contact routes
 */

// Submit contact message
router.post('/contact', asyncHandler(async (req, res) => {
  // TODO: Implement contact message submission
  res.status(501).json({
    success: false,
    message: 'Contact submission endpoint not implemented yet',
    note: 'This will handle public contact form submissions'
  });
}));

/**
 * Public statistics (for transparency)
 */

// Get public statistics
router.get('/statistics', asyncHandler(async (req, res) => {
  // TODO: Implement public statistics
  res.status(501).json({
    success: false,
    message: 'Public statistics endpoint not implemented yet',
    note: 'This will return anonymized system statistics for transparency'
  });
}));

export default router;