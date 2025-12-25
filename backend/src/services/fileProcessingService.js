import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * File Processing Service
 * Handles secure file upload, metadata stripping, and storage for evidence files
 */
class FileProcessingService {
  
  constructor() {
    this.uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
    this.evidenceDir = path.join(this.uploadDir, 'evidence');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB
    this.allowedMimeTypes = [
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
    
    this.initializeDirectories();
  }
  
  /**
   * Initialize upload directories
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.evidenceDir, { recursive: true });
      logger.info('Upload directories initialized');
    } catch (error) {
      logger.error('Failed to initialize upload directories:', error);
    }
  }
  
  /**
   * Validate uploaded file
   */
  validateFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('No file provided');
      return errors;
    }
    
    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }
    
    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }
    
    // Check filename
    if (!file.originalname || file.originalname.length > 255) {
      errors.push('Invalid filename');
    }
    
    return errors;
  }
  
  /**
   * Generate secure filename
   */
  generateSecureFilename(originalName) {
    const ext = path.extname(originalName).toLowerCase();
    const uuid = uuidv4();
    const timestamp = Date.now();
    return `${uuid}-${timestamp}${ext}`;
  }
  
  /**
   * Calculate file hash for integrity verification
   */
  async calculateFileHash(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      logger.error('Failed to calculate file hash:', error);
      throw error;
    }
  }
  
  /**
   * Strip metadata from image files
   * This is a basic implementation - in production, use specialized libraries
   */
  async stripImageMetadata(filePath, mimeType) {
    try {
      if (!mimeType.startsWith('image/')) {
        return; // Only process image files
      }
      
      // For basic implementation, we'll just log the action
      // In production, use libraries like 'sharp' or 'jimp' to strip EXIF data
      logger.info('Image metadata stripping would be performed here', { filePath, mimeType });
      
      // TODO: Implement actual metadata stripping using sharp or similar library
      // Example with sharp:
      // const sharp = require('sharp');
      // await sharp(filePath)
      //   .jpeg({ quality: 90 })
      //   .png({ compressionLevel: 9 })
      //   .toFile(filePath + '.clean');
      // await fs.rename(filePath + '.clean', filePath);
      
    } catch (error) {
      logger.error('Failed to strip image metadata:', error);
      // Don't throw error - file can still be stored
    }
  }
  
  /**
   * Process and store evidence file
   */
  async processEvidenceFile(file) {
    try {
      // Validate file
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(`File validation failed: ${validationErrors.join(', ')}`);
      }
      
      // Generate secure filename
      const secureFilename = this.generateSecureFilename(file.originalname);
      const filePath = path.join(this.evidenceDir, secureFilename);
      
      // Move file to secure location
      await fs.rename(file.path, filePath);
      
      // Strip metadata for privacy
      await this.stripImageMetadata(filePath, file.mimetype);
      
      // Calculate file hash
      const fileHash = await this.calculateFileHash(filePath);
      
      // Get file stats
      const stats = await fs.stat(filePath);
      
      // Return file metadata (no sensitive information)
      const fileMetadata = {
        filename: secureFilename,
        originalName: this.sanitizeFilename(file.originalname),
        mimeType: file.mimetype,
        size: stats.size,
        fileHash,
        uploadedAt: new Date()
      };
      
      logger.info('Evidence file processed successfully', {
        originalName: file.originalname,
        secureFilename,
        size: stats.size,
        mimeType: file.mimetype
      });
      
      return fileMetadata;
      
    } catch (error) {
      logger.error('Failed to process evidence file:', error);
      
      // Clean up file if it exists
      try {
        if (file.path) {
          await fs.unlink(file.path);
        }
      } catch (cleanupError) {
        logger.error('Failed to cleanup file:', cleanupError);
      }
      
      throw error;
    }
  }
  
  /**
   * Process multiple evidence files
   */
  async processEvidenceFiles(files) {
    if (!files || files.length === 0) {
      return [];
    }
    
    const processedFiles = [];
    const errors = [];
    
    for (const file of files) {
      try {
        const fileMetadata = await this.processEvidenceFile(file);
        processedFiles.push(fileMetadata);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Some files failed to process', { errors });
    }
    
    return {
      processedFiles,
      errors
    };
  }
  
  /**
   * Get evidence file path
   */
  getEvidenceFilePath(filename) {
    return path.join(this.evidenceDir, filename);
  }
  
  /**
   * Check if evidence file exists
   */
  async evidenceFileExists(filename) {
    try {
      const filePath = this.getEvidenceFilePath(filename);
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get evidence file for download (admin only)
   */
  async getEvidenceFile(filename) {
    try {
      const filePath = this.getEvidenceFilePath(filename);
      
      // Check if file exists
      const exists = await this.evidenceFileExists(filename);
      if (!exists) {
        throw new Error('Evidence file not found');
      }
      
      // Get file stats
      const stats = await fs.stat(filePath);
      
      return {
        filePath,
        size: stats.size,
        exists: true
      };
      
    } catch (error) {
      logger.error('Failed to get evidence file:', error);
      throw error;
    }
  }
  
  /**
   * Delete evidence file (admin only, for cleanup)
   */
  async deleteEvidenceFile(filename) {
    try {
      const filePath = this.getEvidenceFilePath(filename);
      await fs.unlink(filePath);
      
      logger.info('Evidence file deleted', { filename });
      return true;
      
    } catch (error) {
      logger.error('Failed to delete evidence file:', error);
      return false;
    }
  }
  
  /**
   * Sanitize filename to prevent path traversal
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/\.+/g, '.') // Replace multiple dots with single dot
      .substring(0, 255); // Limit length
  }
  
  /**
   * Get file type category for UI display
   */
  getFileTypeCategory(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType.startsWith('text/')) return 'text';
    return 'other';
  }
  
  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const files = await fs.readdir(this.evidenceDir);
      let totalSize = 0;
      let fileCount = 0;
      
      for (const file of files) {
        try {
          const filePath = path.join(this.evidenceDir, file);
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            totalSize += stats.size;
            fileCount++;
          }
        } catch (error) {
          // Skip files that can't be accessed
          continue;
        }
      }
      
      return {
        fileCount,
        totalSize,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
      };
      
    } catch (error) {
      logger.error('Failed to get storage stats:', error);
      return {
        fileCount: 0,
        totalSize: 0,
        totalSizeMB: 0
      };
    }
  }
}

export default new FileProcessingService();