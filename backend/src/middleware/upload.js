import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from './errorHandler.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Multer configuration for file uploads
 */

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use temporary directory - files will be moved by fileProcessingService
    const tempDir = process.env.TEMP_UPLOAD_PATH || path.join(__dirname, '../../temp');
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Generate temporary filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed MIME types for evidence files
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} is not allowed`, 400, 'INVALID_FILE_TYPE'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
    files: parseInt(process.env.MAX_FILES_PER_UPLOAD) || 5 // 5 files max per upload
  }
});

/**
 * Middleware for handling evidence file uploads
 */
export const uploadEvidence = (req, res, next) => {
  const uploadMiddleware = upload.array('evidence', 5); // Max 5 files
  
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error('Multer error during file upload:', err);
      
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return next(new AppError(
            `File size too large. Maximum size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024}MB`,
            400,
            'FILE_TOO_LARGE'
          ));
        case 'LIMIT_FILE_COUNT':
          return next(new AppError(
            `Too many files. Maximum is ${parseInt(process.env.MAX_FILES_PER_UPLOAD) || 5} files`,
            400,
            'TOO_MANY_FILES'
          ));
        case 'LIMIT_UNEXPECTED_FILE':
          return next(new AppError(
            'Unexpected file field. Use "evidence" field name for file uploads',
            400,
            'UNEXPECTED_FILE_FIELD'
          ));
        default:
          return next(new AppError(
            'File upload error: ' + err.message,
            400,
            'UPLOAD_ERROR'
          ));
      }
    } else if (err) {
      logger.error('File upload error:', err);
      return next(err);
    }
    
    // Log successful upload
    if (req.files && req.files.length > 0) {
      logger.info('Files uploaded successfully', {
        fileCount: req.files.length,
        files: req.files.map(file => ({
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        }))
      });
    }
    
    next();
  });
};

/**
 * Middleware for single file upload (if needed)
 */
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error during single file upload:', err);
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return next(new AppError(
              `File size too large. Maximum size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024}MB`,
              400,
              'FILE_TOO_LARGE'
            ));
          default:
            return next(new AppError(
              'File upload error: ' + err.message,
              400,
              'UPLOAD_ERROR'
            ));
        }
      } else if (err) {
        logger.error('Single file upload error:', err);
        return next(err);
      }
      
      // Log successful upload
      if (req.file) {
        logger.info('File uploaded successfully', {
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        });
      }
      
      next();
    });
  };
};

/**
 * Cleanup middleware to remove temporary files on error
 */
export const cleanupTempFiles = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  const cleanup = async () => {
    if (req.files && req.files.length > 0) {
      const fs = await import('fs/promises');
      
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
          logger.debug('Temporary file cleaned up', { path: file.path });
        } catch (error) {
          logger.warn('Failed to cleanup temporary file', { 
            path: file.path, 
            error: error.message 
          });
        }
      }
    }
    
    if (req.file) {
      const fs = await import('fs/promises');
      
      try {
        await fs.unlink(req.file.path);
        logger.debug('Temporary file cleaned up', { path: req.file.path });
      } catch (error) {
        logger.warn('Failed to cleanup temporary file', { 
          path: req.file.path, 
          error: error.message 
        });
      }
    }
  };
  
  // Override response methods to cleanup on completion
  res.send = function(data) {
    cleanup();
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    cleanup();
    return originalJson.call(this, data);
  };
  
  // Cleanup on error
  res.on('error', cleanup);
  
  next();
};

export default upload;