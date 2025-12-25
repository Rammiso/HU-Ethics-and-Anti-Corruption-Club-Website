import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// API version and info endpoint
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'HUEACC API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      v1: '/api/v1'
    }
  });
}));

// Health check endpoint with detailed system info
router.get('/health', asyncHandler(async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    },
    database: {
      // TODO: Add database connection status check
      status: 'connected' // Placeholder
    }
  };

  res.status(200).json({
    success: true,
    data: healthData
  });
}));

// API v1 routes (placeholder structure)
router.use('/v1', (req, res, next) => {
  // TODO: Add v1 API routes here
  // This will include:
  // - Authentication routes (/auth)
  // - Reports routes (/reports, /admin/reports)
  // - News routes (/news, /admin/news)
  // - Events routes (/events, /admin/events)
  // - Contact routes (/contact, /admin/contact-messages)
  // - Admin routes (/admin/*)
  
  res.status(501).json({
    success: false,
    message: 'API v1 endpoints not implemented yet',
    availableEndpoints: [
      'POST /api/v1/auth/login',
      'GET /api/v1/reports/track/:trackingId',
      'POST /api/v1/reports',
      'GET /api/v1/news',
      'GET /api/v1/events',
      'POST /api/v1/contact'
    ],
    note: 'These endpoints will be implemented in the next development phase'
  });
});

export default router;
