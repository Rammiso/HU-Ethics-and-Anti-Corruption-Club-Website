import Report, { REPORT_STATUS, REPORT_SEVERITY } from '../models/Report.js';
import ReportCategory from '../models/ReportCategory.js';
import fileProcessingService from './fileProcessingService.js';
import auditService from './auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Report Service
 * Handles anonymous report submission and admin management
 */
class ReportService {
  
  /**
   * Submit anonymous report (public endpoint)
   * NO IP addresses, user agents, or identifying information stored
   */
  async submitAnonymousReport(reportData, files = []) {
    try {
      const {
        categoryId,
        title,
        description,
        incidentDate,
        location,
        severity
      } = reportData;
      
      // Validate category exists and is active
      const category = await ReportCategory.findById(categoryId);
      if (!category || category.status !== 'ACTIVE') {
        throw new AppError('Invalid or inactive report category', 400, 'INVALID_CATEGORY');
      }
      
      // Validate incident date
      const incidentDateObj = new Date(incidentDate);
      if (incidentDateObj > new Date()) {
        throw new AppError('Incident date cannot be in the future', 400, 'INVALID_DATE');
      }
      
      // Validate severity
      if (!Object.values(REPORT_SEVERITY).includes(severity)) {
        throw new AppError('Invalid severity level', 400, 'INVALID_SEVERITY');
      }
      
      // Process evidence files if provided
      let evidenceFiles = [];
      if (files && files.length > 0) {
        logger.info(`Processing ${files.length} evidence files`);
        
        const result = await fileProcessingService.processEvidenceFiles(files);
        evidenceFiles = result.processedFiles;
        
        if (result.errors.length > 0) {
          logger.warn('Some evidence files failed to process', { errors: result.errors });
          // Continue with successful files, don't fail the entire submission
        }
      }
      
      // Create report (tracking ID generated automatically)
      const report = new Report({
        category: categoryId,
        title: title.trim(),
        description: description.trim(),
        incidentDate: incidentDateObj,
        location: location.trim(),
        severity,
        status: REPORT_STATUS.SUBMITTED,
        evidence: evidenceFiles
      });
      
      // Save report
      await report.save();
      
      // Update category report count
      await category.incrementReportCount();
      
      // Log successful submission (no identifying information)
      logger.info('Anonymous report submitted successfully', {
        reportId: report._id,
        trackingId: report.trackingId,
        category: category.name,
        severity,
        evidenceCount: evidenceFiles.length
      });
      
      // Return only public information
      return {
        trackingId: report.trackingId,
        status: report.status,
        submittedAt: report.createdAt,
        message: 'Report submitted successfully. Save your tracking ID to check status later.'
      };
      
    } catch (error) {
      logger.error('Failed to submit anonymous report:', error);
      throw error;
    }
  }
  
  /**
   * Track report status (public endpoint)
   * Uses tracking ID only, no authentication required
   */
  async trackReportStatus(trackingId) {
    try {
      // Validate tracking ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trackingId)) {
        throw new AppError('Invalid tracking ID format', 400, 'INVALID_TRACKING_ID');
      }
      
      // Find report by tracking ID
      const report = await Report.findByTrackingId(trackingId);
      
      if (!report) {
        throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
      }
      
      // Return only public data (no admin information)
      return report.publicData;
      
    } catch (error) {
      logger.error('Failed to track report status:', error);
      throw error;
    }
  }
  
  /**
   * Add message to report (public endpoint)
   * Allows anonymous follow-up communication
   */
  async addReportMessage(trackingId, message) {
    try {
      // Validate tracking ID
      const report = await Report.findOne({ trackingId });
      if (!report) {
        throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
      }
      
      // Validate message
      if (!message || message.trim().length === 0) {
        throw new AppError('Message cannot be empty', 400, 'EMPTY_MESSAGE');
      }
      
      if (message.length > 1000) {
        throw new AppError('Message cannot exceed 1000 characters', 400, 'MESSAGE_TOO_LONG');
      }
      
      // Add message from reporter
      report.addMessage(message.trim(), false);
      await report.save();
      
      logger.info('Message added to report', {
        reportId: report._id,
        trackingId: report.trackingId,
        messageLength: message.length
      });
      
      return {
        success: true,
        message: 'Message added successfully'
      };
      
    } catch (error) {
      logger.error('Failed to add report message:', error);
      throw error;
    }
  }
  
  /**
   * Get reports for admin (with filters and pagination)
   */
  async getReportsForAdmin(filters = {}, options = {}, adminId) {
    try {
      const {
        status,
        category,
        assignedTo,
        severity,
        startDate,
        endDate,
        search
      } = filters;
      
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;
      
      // Build query
      const reports = await Report.getReportsWithFilters(filters, options);
      const total = await Report.countDocuments(this.buildFilterQuery(filters));
      
      // Log admin access to reports list
      if (adminId) {
        await auditService.log({
          adminId,
          action: AUDIT_ACTIONS.VIEW_REPORT,
          resourceType: RESOURCE_TYPES.REPORT,
          details: { filters, pagination: { page, limit } },
          metadata: {},
          success: true
        });
      }
      
      return {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      logger.error('Failed to get reports for admin:', error);
      throw error;
    }
  }
  
  /**
   * Get report details for admin
   */
  async getReportDetailsForAdmin(reportId, adminId, metadata = {}) {
    try {
      const report = await Report.findById(reportId)
        .populate('category', 'name description')
        .populate('assignedTo', 'name email')
        .populate('statusHistory.changedBy', 'name')
        .populate('internalNotes.addedBy', 'name')
        .populate('messages.sentBy', 'name');
      
      if (!report) {
        throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
      }
      
      // Log admin access to specific report
      await auditService.logReportAction(
        adminId,
        AUDIT_ACTIONS.VIEW_REPORT,
        reportId,
        { trackingId: report.trackingId },
        metadata,
        true
      );
      
      return report;
      
    } catch (error) {
      logger.error('Failed to get report details for admin:', error);
      throw error;
    }
  }
  
  /**
   * Update report status (admin only)
   */
  async updateReportStatus(reportId, newStatus, notes, adminId, metadata = {}) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
      }
      
      // Validate status
      if (!Object.values(REPORT_STATUS).includes(newStatus)) {
        throw new AppError('Invalid status', 400, 'INVALID_STATUS');
      }
      
      const oldStatus = report.status;
      
      // Add status history and update status
      report.addStatusHistory(newStatus, adminId, notes || '');
      await report.save();
      
      // Log status update
      await auditService.logReportAction(
        adminId,
        AUDIT_ACTIONS.UPDATE_REPORT_STATUS,
        reportId,
        {
          trackingId: report.trackingId,
          oldStatus,
          newStatus,
          notes
        },
        metadata,
        true
      );
      
      logger.info('Report status updated', {
        reportId,
        trackingId: report.trackingId,
        oldStatus,
        newStatus,
        adminId
      });
      
      return report;
      
    } catch (error) {
      logger.error('Failed to update report status:', error);
      throw error;
    }
  }
  
  /**
   * Assign report to admin
   */
  async assignReport(reportId, assignToAdminId, adminId, notes, metadata = {}) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
      }
      
      const oldAssignee = report.assignedTo;
      
      // Assign report
      report.assignTo(assignToAdminId, adminId, notes || 'Report assigned');
      await report.save();
      
      // Log assignment
      await auditService.logReportAction(
        adminId,
        AUDIT_ACTIONS.ASSIGN_REPORT,
        reportId,
        {
          trackingId: report.trackingId,
          oldAssignee,
          newAssignee: assignToAdminId,
          notes
        },
        metadata,
        true
      );
      
      logger.info('Report assigned', {
        reportId,
        trackingId: report.trackingId,
        assignedTo: assignToAdminId,
        assignedBy: adminId
      });
      
      return report;
      
    } catch (error) {
      logger.error('Failed to assign report:', error);
      throw error;
    }
  }
  
  /**
   * Add internal note to report (admin only)
   */
  async addInternalNote(reportId, note, adminId, metadata = {}) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
      }
      
      // Add internal note
      report.addInternalNote(note, adminId);
      await report.save();
      
      // Log note addition
      await auditService.logReportAction(
        adminId,
        AUDIT_ACTIONS.ADD_REPORT_NOTE,
        reportId,
        {
          trackingId: report.trackingId,
          noteLength: note.length
        },
        metadata,
        true
      );
      
      logger.info('Internal note added to report', {
        reportId,
        trackingId: report.trackingId,
        adminId
      });
      
      return report;
      
    } catch (error) {
      logger.error('Failed to add internal note:', error);
      throw error;
    }
  }
  
  /**
   * Send message to reporter (admin only)
   */
  async sendMessageToReporter(reportId, message, adminId, metadata = {}) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
      }
      
      // Add message from admin
      report.addMessage(message, true, adminId);
      await report.save();
      
      // Log message sending
      await auditService.logReportAction(
        adminId,
        'SEND_MESSAGE_TO_REPORTER',
        reportId,
        {
          trackingId: report.trackingId,
          messageLength: message.length
        },
        metadata,
        true
      );
      
      logger.info('Message sent to reporter', {
        reportId,
        trackingId: report.trackingId,
        adminId
      });
      
      return report;
      
    } catch (error) {
      logger.error('Failed to send message to reporter:', error);
      throw error;
    }
  }
  
  /**
   * Get report statistics
   */
  async getReportStatistics(filters = {}) {
    try {
      const { startDate, endDate } = filters;
      
      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }
      
      const [
        totalReports,
        statusStats,
        severityStats,
        categoryStats
      ] = await Promise.all([
        Report.countDocuments(dateFilter),
        Report.aggregate([
          { $match: dateFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Report.aggregate([
          { $match: dateFilter },
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]),
        Report.aggregate([
          { $match: dateFilter },
          { $lookup: { from: 'reportcategories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
          { $group: { _id: '$category', name: { $first: '$categoryInfo.name' }, count: { $sum: 1 } } }
        ])
      ]);
      
      return {
        totalReports,
        statusStats,
        severityStats,
        categoryStats
      };
      
    } catch (error) {
      logger.error('Failed to get report statistics:', error);
      throw error;
    }
  }
  
  /**
   * Build filter query for reports
   */
  buildFilterQuery(filters) {
    const {
      status,
      category,
      assignedTo,
      severity,
      startDate,
      endDate,
      search
    } = filters;
    
    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (severity) query.severity = severity;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } }
      ];
    }
    
    return query;
  }
}

export default new ReportService();