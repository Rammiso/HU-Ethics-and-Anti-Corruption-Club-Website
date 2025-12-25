import mongoose from 'mongoose';

// Audit action types enum
export const AUDIT_ACTIONS = {
  // Authentication actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  
  // Report management actions
  VIEW_REPORT: 'VIEW_REPORT',
  UPDATE_REPORT_STATUS: 'UPDATE_REPORT_STATUS',
  ASSIGN_REPORT: 'ASSIGN_REPORT',
  ADD_REPORT_NOTE: 'ADD_REPORT_NOTE',
  DOWNLOAD_EVIDENCE: 'DOWNLOAD_EVIDENCE',
  
  // News management actions
  CREATE_NEWS: 'CREATE_NEWS',
  UPDATE_NEWS: 'UPDATE_NEWS',
  DELETE_NEWS: 'DELETE_NEWS',
  PUBLISH_NEWS: 'PUBLISH_NEWS',
  UNPUBLISH_NEWS: 'UNPUBLISH_NEWS',
  VIEW_NEWS: 'VIEW_NEWS',
  
  // Event management actions
  CREATE_EVENT: 'CREATE_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  PUBLISH_EVENT: 'PUBLISH_EVENT',
  UNPUBLISH_EVENT: 'UNPUBLISH_EVENT',
  VIEW_EVENT: 'VIEW_EVENT',
  CANCEL_EVENT: 'CANCEL_EVENT',
  
  // Contact message actions
  VIEW_CONTACT_MESSAGE: 'VIEW_CONTACT_MESSAGE',
  REPLY_CONTACT_MESSAGE: 'REPLY_CONTACT_MESSAGE',
  ASSIGN_CONTACT_MESSAGE: 'ASSIGN_CONTACT_MESSAGE',
  
  // Admin management actions
  CREATE_ADMIN: 'CREATE_ADMIN',
  UPDATE_ADMIN: 'UPDATE_ADMIN',
  DEACTIVATE_ADMIN: 'DEACTIVATE_ADMIN',
  ACTIVATE_ADMIN: 'ACTIVATE_ADMIN',
  RESET_ADMIN_PASSWORD: 'RESET_ADMIN_PASSWORD',
  
  // System actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  EXPORT_DATA: 'EXPORT_DATA',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  
  // Report category actions
  CREATE_REPORT_CATEGORY: 'CREATE_REPORT_CATEGORY',
  UPDATE_REPORT_CATEGORY: 'UPDATE_REPORT_CATEGORY',
  DELETE_REPORT_CATEGORY: 'DELETE_REPORT_CATEGORY'
};

// Resource types enum
export const RESOURCE_TYPES = {
  ADMIN: 'Admin',
  REPORT: 'Report',
  NEWS: 'News',
  EVENT: 'Event',
  CONTACT_MESSAGE: 'ContactMessage',
  REPORT_CATEGORY: 'ReportCategory',
  SYSTEM_SETTINGS: 'SystemSettings',
  AUDIT_LOG: 'AuditLog'
};

const auditLogSchema = new mongoose.Schema({
  // Admin who performed the action
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Admin ID is required'],
    index: true
  },
  
  // Action performed
  action: {
    type: String,
    enum: {
      values: Object.values(AUDIT_ACTIONS),
      message: 'Invalid audit action type'
    },
    required: [true, 'Action is required'],
    index: true
  },
  
  // Resource type affected
  resourceType: {
    type: String,
    enum: {
      values: Object.values(RESOURCE_TYPES),
      message: 'Invalid resource type'
    },
    required: [true, 'Resource type is required'],
    index: true
  },
  
  // ID of the affected resource
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Some actions may not have a specific resource
    index: true
  },
  
  // Additional details about the action
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Request metadata
  metadata: {
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      validate: {
        validator: function(v) {
          // Basic IP validation (IPv4 and IPv6)
          const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
          return ipv4Regex.test(v) || ipv6Regex.test(v) || v === '::1' || v === '127.0.0.1';
        },
        message: 'Invalid IP address format'
      }
    },
    
    userAgent: {
      type: String,
      required: [true, 'User agent is required'],
      maxlength: [500, 'User agent cannot exceed 500 characters']
    },
    
    // Request URL and method for context
    requestUrl: {
      type: String,
      required: false,
      maxlength: [200, 'Request URL cannot exceed 200 characters']
    },
    
    requestMethod: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      required: false
    }
  },
  
  // Success or failure of the action
  success: {
    type: Boolean,
    default: true,
    required: true
  },
  
  // Error message if action failed
  errorMessage: {
    type: String,
    required: false,
    maxlength: [500, 'Error message cannot exceed 500 characters']
  }
}, {
  timestamps: { 
    createdAt: true, 
    updatedAt: false // Audit logs are immutable
  },
  // Prevent updates and deletes
  versionKey: false
});

// Indexes for efficient querying
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 }); // For chronological queries
auditLogSchema.index({ 'metadata.ipAddress': 1 });

// Compound indexes for common query patterns
auditLogSchema.index({ adminId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, action: 1, createdAt: -1 });

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toISOString();
});

// Prevent modifications to audit logs
auditLogSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('Audit logs cannot be modified'));
  }
  next();
});

auditLogSchema.pre('findOneAndUpdate', function(next) {
  next(new Error('Audit logs cannot be updated'));
});

auditLogSchema.pre('findOneAndDelete', function(next) {
  next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.pre('deleteOne', function(next) {
  next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.pre('deleteMany', function(next) {
  next(new Error('Audit logs cannot be deleted'));
});

// Static method to create audit log entry
auditLogSchema.statics.createEntry = async function(logData) {
  try {
    const auditLog = new this(logData);
    return await auditLog.save();
  } catch (error) {
    // Log the error but don't throw to prevent disrupting main operations
    console.error('Failed to create audit log entry:', error);
    return null;
  }
};

// Static method to find logs by admin
auditLogSchema.statics.findByAdmin = function(adminId, options = {}) {
  const { page = 1, limit = 50, startDate, endDate } = options;
  
  let query = { adminId };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .populate('adminId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to find logs by resource
auditLogSchema.statics.findByResource = function(resourceType, resourceId, options = {}) {
  const { page = 1, limit = 50 } = options;
  
  return this.find({ resourceType, resourceId })
    .populate('adminId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get audit statistics
auditLogSchema.statics.getStatistics = async function(options = {}) {
  const { startDate, endDate } = options;
  
  let matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          action: '$action',
          success: '$success'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.action',
        total: { $sum: '$count' },
        successful: {
          $sum: {
            $cond: [{ $eq: ['$_id.success', true] }, '$count', 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ['$_id.success', false] }, '$count', 0]
          }
        }
      }
    },
    { $sort: { total: -1 } }
  ];
  
  return await this.aggregate(pipeline);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;