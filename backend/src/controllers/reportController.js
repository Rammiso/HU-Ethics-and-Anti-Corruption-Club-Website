import reportService from '../services/reportService.js';
import fileProcessingService from '../services/fileProcessingService.js';
import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import { REPORT_STATUS, REPORT_SEVERITY } from '../models/Report.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Report Controller
 * Handles anonymous report submission and admin management
 */

/**
 * PUBLIC ENDPOINTS (No authentication required)
 */

/**
 * Submit anonymous report
 */
export const submitAnonymousReport = async (req, res) => {
  try {
    const {
      categoryId,
      title,
      description,
      incidentDate,
      location,
      severity
    } = req.body;
    
    // Validate required fields
    if (!categoryId || !title || !description || !incidentDate || !location || !severity) {
      throw new AppError('All fields are required', 400, 'MISSING_REQUIRED_FIELDS');
    }
    
    // Get uploaded files (if any)
    const files = req.files || [];
    
    // Submit report through service
    const result = await reportService.submitAnonymousReport({
      categoryId,
      title,
      description,
      incidentDate,
      location,
      severity
    }, files);
    
    // Log successful submission (no identifying information)
    logger.info('Anonymous report submitted via API', {
      trackingId: result.trackingId,
      hasEvidence: files.length > 0,
      evidenceCount: files.length
    });
    
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: result
    });
    
  } catch (error) {
    logger.error('Failed to submit anonymous report via API:', error);
    throw error;
  }
};

/**
 * Track report status using tracking ID
 */
export const trackReportStatus = async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    if (!trackingId) {
      throw new AppError('Tracking ID is required', 400, 'MISSING_TRACKING_ID');
    }
    
    const reportData = await reportService.trackReportStatus(trackingId);
    
    res.json({
      success: true,
      data: reportData
    });
    
  } catch (error) {
    logger.error('Failed to track report status:', error);
    throw error;
  }
};

/**
 * Add message to report (anonymous follow-up)
 */
export const addReportMessage = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { message } = req.body;
    
    if (!trackingId || !message) {
      throw new AppError('Tracking ID and message are required', 400, 'MISSING_REQUIRED_FIELDS');
    }
    
    const result = await reportService.addReportMessage(trackingId, message);
    
    res.json({
      success: true,
      message: 'Message added successfully',
      data: result
    });
    
  } catch (error) {
    logger.error('Failed to add report message:', error);
    throw error;
  }
};

/**
 * ADMIN ENDPOINTS (Authentication required)
 */

/**
 * Get reports for admin (with filters and pagination)
 */
export const getReportsForAdmin = async (req, res) => {
  try {
    const {
      status,
      category,
      assignedTo,
      severity,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filters = {
      status,
      category,
      assignedTo,
      severity,
      startDate,
      endDate,
      search
    };
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };
    
    const result = await reportService.getReportsForAdmin(
      filters,
      options,
      req.admin._id
    );
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Failed to get reports for admin:', error);
    throw error;
  }
};

/**
 * Get report details for admin
 */
export const getReportDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await reportService.getReportDetailsForAdmin(
      id,
      req.admin._id,
      req.auditMetadata
    );
    
    res.json({
      success: true,
      data: report
    });
    
  } catch (error) {
    logger.error('Failed to get report details for admin:', error);
    throw error;
  }
};

/**
 * Update report status
 */
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      throw new AppError('Status is required', 400, 'MISSING_STATUS');
    }
    
    if (!Object.values(REPORT_STATUS).includes(status)) {
      throw new AppError('Invalid status', 400, 'INVALID_STATUS');
    }
    
    const report = await reportService.updateReportStatus(
      id,
      status,
      notes,
      req.admin._id,
      req.auditMetadata
    );
    
    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });
    
  } catch (error) {
    logger.error('Failed to update report status:', error);
    throw error;
  }
};

/**
 * Assign report to admin
 */
export const assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignToAdminId, notes } = req.body;
    
    if (!assignToAdminId) {
      throw new AppError('Admin ID is required for assignment', 400, 'MISSING_ADMIN_ID');
    }
    
    const report = await reportService.assignReport(
      id,
      assignToAdminId,
      req.admin._id,
      notes,
      req.auditMetadata
    );
    
    res.json({
      success: true,
      message: 'Report assigned successfully',
      data: report
    });
    
  } catch (error) {
    logger.error('Failed to assign report:', error);
    throw error;
  }
};

/**
 * Add internal note to report
 */
export const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    if (!note || note.trim().length === 0) {
      throw new AppError('Note cannot be empty', 400, 'EMPTY_NOTE');
    }
    
    if (note.length > 1000) {
      throw new AppError('Note cannot exceed 1000 characters', 400, 'NOTE_TOO_LONG');
    }
    
    const report = await reportService.addInternalNote(
      id,
      note.trim(),
      req.admin._id,
      req.auditMetadata
    );
    
    res.json({
      success: true,
      message: 'Internal note added successfully',
      data: report
    });
    
  } catch (error) {
    logger.error('Failed to add internal note:', error);
    throw error;
  }
};

/**
 * Send message to reporter
 */
export const sendMessageToReporter = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      throw new AppError('Message cannot be empty', 400, 'EMPTY_MESSAGE');
    }
    
    if (message.length > 1000) {
      throw new AppError('Message cannot exceed 1000 characters', 400, 'MESSAGE_TOO_LONG');
    }
    
    const report = await reportService.sendMessageToReporter(
      id,
      message.trim(),
      req.admin._id,
      req.auditMetadata
    );
    
    res.json({
      success: true,
      message: 'Message sent to reporter successfully',
      data: report
    });
    
  } catch (error) {
    logger.error('Failed to send message to reporter:', error);
    throw error;
  }
};

/**
 * Download evidence file
 */
export const downloadEvidenceFile = async (req, res) => {
  try {
    const { id, filename } = req.params;
    
    // First verify the report exists and admin has access
    const report = await reportService.getReportDetailsForAdmin(
      id,
      req.admin._id,
      req.auditMetadata
    );
    
    // Check if the file belongs to this report
    const evidenceFile = report.evidence.find(file => file.filename === filename);
    if (!evidenceFile) {
      throw new AppError('Evidence file not found in this report', 404, 'FILE_NOT_FOUND');
    }
    
    // Get file from storage
    const fileInfo = await fileProcessingService.getEvidenceFile(filename);
    
    if (!fileInfo.exists) {
      throw new AppError('Evidence file not found in storage', 404, 'FILE_NOT_FOUND_STORAGE');
    }
    
    // Log file access
    await auditService.logReportAction(
      req.admin._id,
      'DOWNLOAD_EVIDENCE_FILE',
      id,
      {
        trackingId: report.trackingId,
        filename: evidenceFile.filename,
        originalName: evidenceFile.originalName,
        fileSize: evidenceFile.size
      },
      req.auditMetadata,
      true
    );
    
    // Set appropriate headers
    res.setHeader('Content-Type', evidenceFile.mimeType);
    res.setHeader('Content-Length', fileInfo.size);
    res.setHeader('Content-Disposition', `attachment; filename="${evidenceFile.originalName}"`);
    
    // Stream file to response
    const fs = await import('fs');
    const fileStream = fs.createReadStream(fileInfo.filePath);
    fileStream.pipe(res);
    
    logger.info('Evidence file downloaded', {
      reportId: id,
      trackingId: report.trackingId,
      filename: evidenceFile.filename,
      adminId: req.admin._id
    });
    
  } catch (error) {
    logger.error('Failed to download evidence file:', error);
    throw error;
  }
};

/**
 * Get report statistics
 */
export const getReportStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filters = { startDate, endDate };
    const statistics = await reportService.getReportStatistics(filters);
    
    // Log statistics access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_REPORT_STATISTICS',
      resourceType: RESOURCE_TYPES.REPORT,
      details: { filters },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    logger.error('Failed to get report statistics:', error);
    throw error;
  }
};

/**
 * Bulk update reports
 */
export const bulkUpdateReports = async (req, res) => {
  try {
    const { reportIds, action, data } = req.body;
    
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      throw new AppError('Report IDs array is required', 400, 'MISSING_REPORT_IDS');
    }
    
    if (!action) {
      throw new AppError('Action is required', 400, 'MISSING_ACTION');
    }
    
    const results = [];
    const errors = [];
    
    for (const reportId of reportIds) {
      try {
        let result;
        
        switch (action) {
          case 'updateStatus':
            if (!data.status) {
              throw new AppError('Status is required for bulk status update', 400, 'MISSING_STATUS');
            }
            result = await reportService.updateReportStatus(
              reportId,
              data.status,
              data.notes || 'Bulk status update',
              req.admin._id,
              req.auditMetadata
            );
            break;
            
          case 'assign':
            if (!data.assignToAdminId) {
              throw new AppError('Admin ID is required for bulk assignment', 400, 'MISSING_ADMIN_ID');
            }
            result = await reportService.assignReport(
              reportId,
              data.assignToAdminId,
              req.admin._id,
              data.notes || 'Bulk assignment',
              req.auditMetadata
            );
            break;
            
          default:
            throw new AppError(`Unknown bulk action: ${action}`, 400, 'UNKNOWN_ACTION');
        }
        
        results.push({
          reportId,
          success: true,
          data: result
        });
        
      } catch (error) {
        errors.push({
          reportId,
          success: false,
          error: error.message
        });
      }
    }
    
    // Log bulk operation
    await auditService.log({
      adminId: req.admin._id,
      action: `BULK_${action.toUpperCase()}_REPORTS`,
      resourceType: RESOURCE_TYPES.REPORT,
      details: {
        action,
        totalReports: reportIds.length,
        successCount: results.length,
        errorCount: errors.length,
        data
      },
      metadata: req.auditMetadata,
      success: errors.length === 0
    });
    
    logger.info('Bulk report operation completed', {
      action,
      totalReports: reportIds.length,
      successCount: results.length,
      errorCount: errors.length,
      adminId: req.admin._id
    });
    
    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: {
        results,
        errors,
        summary: {
          total: reportIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to perform bulk report operation:', error);
    throw error;
  }
};