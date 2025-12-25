import logger from '../utils/logger.js';

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error response formatter
 */
const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  };

  // Add details if available
  if (error.details) {
    response.error.details = error.details;
  }

  // Include stack trace in development
  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
};

/**
 * Handle different types of errors
 */
const handleSpecificErrors = (error) => {
  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    
    return new AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
  }

  // Mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400, 'INVALID_ID');
  }

  // MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return new AppError(`${field} '${value}' already exists`, 409, 'DUPLICATE_ENTRY');
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', 413, 'FILE_TOO_LARGE');
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
  }

  // Return original error if not handled
  return error;
};

/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
  // Handle specific error types
  const processedError = handleSpecificErrors(error);
  
  // Set default values for unhandled errors
  const statusCode = processedError.statusCode || 500;
  const isOperational = processedError.isOperational || false;
  
  // Log error details
  const logData = {
    message: processedError.message,
    statusCode,
    code: processedError.code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: processedError.stack
  };

  if (statusCode >= 500) {
    logger.error('💥 Server Error:', logData);
  } else if (statusCode >= 400) {
    logger.warn('⚠️ Client Error:', logData);
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const shouldExposeError = isOperational || isDevelopment;
  
  if (!shouldExposeError) {
    processedError.message = 'Something went wrong';
    processedError.code = 'INTERNAL_ERROR';
    processedError.details = null;
  }

  // Send error response
  res.status(statusCode).json(
    formatErrorResponse(processedError, isDevelopment)
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
