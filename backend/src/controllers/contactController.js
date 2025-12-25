import ContactMessage, { MESSAGE_STATUS } from '../models/ContactMessage.js';
import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Contact Message Controller
 * Handles public contact form submissions and admin management
 */

/**
 * PUBLIC ENDPOINTS (No authentication required)
 */

/**
 * Submit contact message (public)
 */
export const submitContactMessage = async (req, res) => {
  try {
    const {
      senderName,
      email,
      subject,
      messageBody,
      category
    } = req.body;
    
    // Validate required fields
    if (!subject || !messageBody) {
      throw new AppError('Subject and message are required', 400, 'MISSING_REQUIRED_FIELDS');
    }
    
    // Additional validation
    if (subject.trim().length < 3) {
      throw new AppError('Subject must be at least 3 characters long', 400, 'SUBJECT_TOO_SHORT');
    }
    
    if (messageBody.trim().length < 10) {
      throw new AppError('Message must be at least 10 characters long', 400, 'MESSAGE_TOO_SHORT');
    }
    
    // Create contact message
    const contactMessage = new ContactMessage({
      senderName: senderName?.trim() || 'Anonymous',
      email: email?.trim() || null,
      subject: subject.trim(),
      messageBody: messageBody.trim(),
      category: category || 'GENERAL_INQUIRY',
      status: MESSAGE_STATUS.NEW
    });
    
    await contactMessage.save();
    
    // Log successful submission (no sensitive information)
    logger.info('Contact message submitted', {
      messageId: contactMessage._id,
      subject: contactMessage.subject,
      category: contactMessage.category,
      hasEmail: !!contactMessage.email,
      isSpam: contactMessage.isSpam,
      spamScore: contactMessage.spamScore
    });
    
    // Return success response (no sensitive data)
    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully. We will get back to you soon.',
      data: {
        id: contactMessage._id,
        subject: contactMessage.subject,
        status: contactMessage.status,
        submittedAt: contactMessage.createdAt
      }
    });
    
  } catch (error) {
    logger.error('Failed to submit contact message:', error);
    throw error;
  }
};

/**
 * ADMIN ENDPOINTS (Authentication required)
 */

/**
 * Get all contact messages for admin (with filters and pagination)
 */
export const getContactMessagesForAdmin = async (req, res) => {
  try {
    const {
      status,
      handledBy,
      category,
      priority,
      startDate,
      endDate,
      search,
      includeSpam = 'false',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filters = {
      status,
      handledBy,
      category,
      priority,
      startDate,
      endDate,
      search,
      includeSpam: includeSpam === 'true'
    };
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };
    
    const messages = await ContactMessage.getMessagesForAdmin(filters, options);
    const total = await ContactMessage.countDocuments(buildFilterQuery(filters));
    
    // Convert to admin data format (includes email)
    const adminMessages = messages.map(message => message.getAdminData());
    
    // Log admin access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_CONTACT_MESSAGE,
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      details: { filters, pagination: { page, limit } },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: {
        messages: adminMessages,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to get contact messages for admin:', error);
    throw error;
  }
};

/**
 * Get contact message by ID (admin)
 */
export const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findById(id)
      .populate('handledBy', 'name email')
      .populate('response.respondedBy', 'name email')
      .populate('internalNotes.addedBy', 'name');
    
    if (!message) {
      throw new AppError('Contact message not found', 404, 'MESSAGE_NOT_FOUND');
    }
    
    // Auto-mark as read if it's new and not spam
    if (message.status === MESSAGE_STATUS.NEW && !message.isSpam) {
      message.markAsRead(req.admin._id);
      await message.save();
    }
    
    // Log admin access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_CONTACT_MESSAGE,
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      resourceId: id,
      details: { 
        subject: message.subject,
        status: message.status,
        category: message.category
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: message.getAdminData()
    });
    
  } catch (error) {
    logger.error('Failed to get contact message by ID:', error);
    throw error;
  }
};

/**
 * Update contact message status
 */
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseContent } = req.body;
    
    if (!status) {
      throw new AppError('Status is required', 400, 'MISSING_STATUS');
    }
    
    if (!Object.values(MESSAGE_STATUS).includes(status)) {
      throw new AppError('Invalid status', 400, 'INVALID_STATUS');
    }
    
    const message = await ContactMessage.findById(id);
    if (!message) {
      throw new AppError('Contact message not found', 404, 'MESSAGE_NOT_FOUND');
    }
    
    const oldStatus = message.status;
    
    // Update status based on the new status
    if (status === MESSAGE_STATUS.READ) {
      message.markAsRead(req.admin._id);
    } else if (status === MESSAGE_STATUS.RESPONDED) {
      if (!responseContent) {
        throw new AppError('Response content is required when marking as responded', 400, 'MISSING_RESPONSE');
      }
      message.markAsResponded(responseContent, req.admin._id);
    } else {
      message.status = status;
      message.handledBy = req.admin._id;
    }
    
    await message.save();
    
    // Log status update
    await auditService.log({
      adminId: req.admin._id,
      action: 'UPDATE_CONTACT_MESSAGE_STATUS',
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      resourceId: id,
      details: {
        subject: message.subject,
        oldStatus,
        newStatus: status,
        hasResponse: !!responseContent
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Contact message status updated', {
      messageId: id,
      subject: message.subject,
      oldStatus,
      newStatus: status,
      adminId: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: message.getAdminData()
    });
    
  } catch (error) {
    logger.error('Failed to update message status:', error);
    throw error;
  }
};

/**
 * Add internal note to contact message
 */
export const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    if (!note || note.trim().length === 0) {
      throw new AppError('Note cannot be empty', 400, 'EMPTY_NOTE');
    }
    
    if (note.length > 500) {
      throw new AppError('Note cannot exceed 500 characters', 400, 'NOTE_TOO_LONG');
    }
    
    const message = await ContactMessage.findById(id);
    if (!message) {
      throw new AppError('Contact message not found', 404, 'MESSAGE_NOT_FOUND');
    }
    
    // Add internal note
    message.addInternalNote(note.trim(), req.admin._id);
    await message.save();
    
    // Populate the new note
    await message.populate('internalNotes.addedBy', 'name');
    
    // Log note addition
    await auditService.log({
      adminId: req.admin._id,
      action: 'ADD_CONTACT_MESSAGE_NOTE',
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      resourceId: id,
      details: {
        subject: message.subject,
        noteLength: note.length
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Internal note added to contact message', {
      messageId: id,
      subject: message.subject,
      adminId: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Internal note added successfully',
      data: message.getAdminData()
    });
    
  } catch (error) {
    logger.error('Failed to add internal note:', error);
    throw error;
  }
};

/**
 * Update message priority
 */
export const updateMessagePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    
    const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
    if (!priority || !validPriorities.includes(priority)) {
      throw new AppError('Valid priority is required (LOW, NORMAL, HIGH, URGENT)', 400, 'INVALID_PRIORITY');
    }
    
    const message = await ContactMessage.findById(id);
    if (!message) {
      throw new AppError('Contact message not found', 404, 'MESSAGE_NOT_FOUND');
    }
    
    const oldPriority = message.priority;
    message.updatePriority(priority, req.admin._id);
    await message.save();
    
    // Log priority update
    await auditService.log({
      adminId: req.admin._id,
      action: 'UPDATE_CONTACT_MESSAGE_PRIORITY',
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      resourceId: id,
      details: {
        subject: message.subject,
        oldPriority,
        newPriority: priority
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Contact message priority updated', {
      messageId: id,
      subject: message.subject,
      oldPriority,
      newPriority: priority,
      adminId: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Message priority updated successfully',
      data: message.getAdminData()
    });
    
  } catch (error) {
    logger.error('Failed to update message priority:', error);
    throw error;
  }
};

/**
 * Mark message as spam
 */
export const markAsSpam = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findById(id);
    if (!message) {
      throw new AppError('Contact message not found', 404, 'MESSAGE_NOT_FOUND');
    }
    
    if (message.isSpam) {
      throw new AppError('Message is already marked as spam', 400, 'ALREADY_SPAM');
    }
    
    message.markAsSpam(req.admin._id);
    await message.save();
    
    // Log spam marking
    await auditService.log({
      adminId: req.admin._id,
      action: 'MARK_CONTACT_MESSAGE_SPAM',
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      resourceId: id,
      details: {
        subject: message.subject,
        originalSpamScore: message.spamScore
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Contact message marked as spam', {
      messageId: id,
      subject: message.subject,
      adminId: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Message marked as spam successfully',
      data: message.getAdminData()
    });
    
  } catch (error) {
    logger.error('Failed to mark message as spam:', error);
    throw error;
  }
};

/**
 * Get contact message statistics
 */
export const getContactStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filters = { startDate, endDate };
    const statistics = await ContactMessage.getStatistics(filters);
    
    // Log statistics access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_CONTACT_MESSAGE_STATISTICS',
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      details: { filters },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    logger.error('Failed to get contact statistics:', error);
    throw error;
  }
};

/**
 * Bulk update contact messages
 */
export const bulkUpdateMessages = async (req, res) => {
  try {
    const { messageIds, action, data } = req.body;
    
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw new AppError('Message IDs array is required', 400, 'MISSING_MESSAGE_IDS');
    }
    
    if (!action) {
      throw new AppError('Action is required', 400, 'MISSING_ACTION');
    }
    
    const results = [];
    const errors = [];
    
    for (const messageId of messageIds) {
      try {
        const message = await ContactMessage.findById(messageId);
        if (!message) {
          errors.push({
            messageId,
            success: false,
            error: 'Message not found'
          });
          continue;
        }
        
        let result;
        
        switch (action) {
          case 'markAsRead':
            message.markAsRead(req.admin._id);
            result = await message.save();
            break;
            
          case 'updatePriority':
            if (!data.priority) {
              throw new AppError('Priority is required for bulk priority update', 400, 'MISSING_PRIORITY');
            }
            message.updatePriority(data.priority, req.admin._id);
            result = await message.save();
            break;
            
          case 'markAsSpam':
            if (!message.isSpam) {
              message.markAsSpam(req.admin._id);
              result = await message.save();
            } else {
              result = message;
            }
            break;
            
          default:
            throw new AppError(`Unknown bulk action: ${action}`, 400, 'UNKNOWN_ACTION');
        }
        
        results.push({
          messageId,
          success: true,
          data: result.getAdminData()
        });
        
      } catch (error) {
        errors.push({
          messageId,
          success: false,
          error: error.message
        });
      }
    }
    
    // Log bulk operation
    await auditService.log({
      adminId: req.admin._id,
      action: `BULK_${action.toUpperCase()}_CONTACT_MESSAGES`,
      resourceType: RESOURCE_TYPES.CONTACT_MESSAGE,
      details: {
        action,
        totalMessages: messageIds.length,
        successCount: results.length,
        errorCount: errors.length,
        data
      },
      metadata: req.auditMetadata,
      success: errors.length === 0
    });
    
    logger.info('Bulk contact message operation completed', {
      action,
      totalMessages: messageIds.length,
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
          total: messageIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to perform bulk contact message operation:', error);
    throw error;
  }
};

/**
 * Helper function to build filter query
 */
function buildFilterQuery(filters) {
  const {
    status,
    handledBy,
    category,
    priority,
    startDate,
    endDate,
    search,
    includeSpam = false
  } = filters;
  
  let query = {};
  
  // Don't include spam by default
  if (!includeSpam) {
    query.isSpam = { $ne: true };
  }
  
  if (status) query.status = status;
  if (handledBy) query.handledBy = handledBy;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  if (search) {
    query.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { messageBody: { $regex: search, $options: 'i' } },
      { senderName: { $regex: search, $options: 'i' } }
    ];
  }
  
  return query;
}