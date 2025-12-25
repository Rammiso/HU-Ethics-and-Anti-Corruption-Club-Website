import logger from '../utils/logger.js';

/**
 * Request logging middleware
 * Logs incoming requests with timing information
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request start
  logger.info(`📥 ${method} ${url}`, {
    ip: ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Determine log level based on status code
    const logLevel = statusCode >= 400 ? 'warn' : 'info';
    const statusEmoji = statusCode >= 500 ? '💥' : statusCode >= 400 ? '⚠️' : '✅';
    
    logger[logLevel](`${statusEmoji} ${method} ${url} ${statusCode} - ${duration}ms`, {
      method,
      url,
      statusCode,
      duration,
      ip: ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length') || 0
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};