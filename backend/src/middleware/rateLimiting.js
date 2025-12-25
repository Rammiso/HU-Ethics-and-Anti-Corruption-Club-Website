import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Rate limiting middleware configurations
 */

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Strict rate limiting for contact form submissions
export const contactFormRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 contact form submissions per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many contact form submissions. Please wait 15 minutes before submitting another message.',
    error: 'CONTACT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  handler: (req, res) => {
    logger.warn('Contact form rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: {
        subject: req.body?.subject,
        hasEmail: !!req.body?.email,
        messageLength: req.body?.messageBody?.length
      }
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many contact form submissions. Please wait 15 minutes before submitting another message.',
      error: 'CONTACT_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiting for anonymous report submissions
export const reportSubmissionRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 report submissions per hour per IP
  message: {
    success: false,
    message: 'Too many report submissions. Please wait 1 hour before submitting another report.',
    error: 'REPORT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn('Report submission rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: {
        title: req.body?.title,
        category: req.body?.categoryId,
        hasFiles: !!(req.files && req.files.length > 0)
      }
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many report submissions. Please wait 1 hour before submitting another report.',
      error: 'REPORT_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 hour'
    });
  }
});

// Authentication rate limiting (for login attempts)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    logger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    });
  }
});

// Admin API rate limiting (more lenient for authenticated users)
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes for admin users
  message: {
    success: false,
    message: 'Too many admin API requests. Please slow down.',
    error: 'ADMIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Admin rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      adminId: req.admin?._id,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many admin API requests. Please slow down.',
      error: 'ADMIN_RATE_LIMIT_EXCEEDED'
    });
  }
});

// File upload rate limiting
export const fileUploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 file uploads per hour per IP
  message: {
    success: false,
    message: 'Too many file uploads. Please wait before uploading more files.',
    error: 'FILE_UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('File upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      fileCount: req.files?.length || 0
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many file uploads. Please wait before uploading more files.',
      error: 'FILE_UPLOAD_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 hour'
    });
  }
});

export default {
  generalRateLimit,
  contactFormRateLimit,
  reportSubmissionRateLimit,
  authRateLimit,
  adminRateLimit,
  fileUploadRateLimit
};