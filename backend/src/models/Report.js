import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Report status enum
export const REPORT_STATUS = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  INVESTIGATING: 'INVESTIGATING',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

// Report severity enum
export const REPORT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Evidence file schema (embedded)
const evidenceFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    maxlength: [255, 'Filename cannot exceed 255 characters']
  },
  
  originalName: {
    type: String,
    required: true,
    maxlength: [255, 'Original filename cannot exceed 255 characters']
  },
  
  mimeType: {
    type: String,
    required: true,
    maxlength: [100, 'MIME type cannot exceed 100 characters']
  },
  
  size: {
    type: Number,
    required: true,
    min: [0, 'File size cannot be negative']
  },
  
  uploadedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Hash for integrity verification
  fileHash: {
    type: String,
    required: true,
    maxlength: [128, 'File hash cannot exceed 128 characters']
  }
}, {
  _id: true,
  timestamps: false
});

// Status history schema (embedded)
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(REPORT_STATUS),
    required: true
  },
  
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: ''
  },
  
  changedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  _id: true,
  timestamps: false
});

const reportSchema = new mongoose.Schema({
  // Public tracking identifier (UUID v4)
  trackingId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
    match: [/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, 'Invalid UUID format']
  },
  
  // Report category reference
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReportCategory',
    required: [true, 'Report category is required']
  },
  
  // Report title/subject
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    minlength: [5, 'Title must be at least 5 characters']
  },
  
  // Detailed description of the incident
  description: {
    type: String,
    required: [true, 'Report description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  
  // When the incident occurred
  incidentDate: {
    type: Date,
    required: [true, 'Incident date is required'],
    validate: {
      validator: function(date) {
        // Incident date cannot be in the future
        return date <= new Date();
      },
      message: 'Incident date cannot be in the future'
    }
  },
  
  // General location (no specific addresses for privacy)
  location: {
    type: String,
    required: [true, 'Incident location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
    minlength: [3, 'Location must be at least 3 characters']
  },
  
  // Severity level
  severity: {
    type: String,
    enum: {
      values: Object.values(REPORT_SEVERITY),
      message: 'Invalid severity level'
    },
    required: true
  },
  
  // Current status
  status: {
    type: String,
    enum: {
      values: Object.values(REPORT_STATUS),
      message: 'Invalid report status'
    },
    default: REPORT_STATUS.SUBMITTED,
    required: true
  },
  
  // Admin assigned to handle this report
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  
  // Evidence files (metadata only, no actual file content)
  evidence: [evidenceFileSchema],
  
  // Status change history
  statusHistory: [statusHistorySchema],
  
  // Internal admin notes (not visible to reporter)
  internalNotes: [{
    note: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  }],
  
  // Anonymous communication messages
  messages: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    fromAdmin: {
      type: Boolean,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    // For admin messages, track who sent it (for audit)
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: function() {
        return this.fromAdmin === true;
      }
    }
  }],
  
  // Priority level (internal use)
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  
  // Tags for categorization (internal use)
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Resolution summary (when resolved)
  resolution: {
    summary: {
      type: String,
      maxlength: [2000, 'Resolution summary cannot exceed 2000 characters']
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    resolvedAt: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance and querying
reportSchema.index({ trackingId: 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ assignedTo: 1, status: 1 });
reportSchema.index({ severity: 1, status: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ incidentDate: -1 });

// Compound indexes for common queries
reportSchema.index({ status: 1, category: 1, createdAt: -1 });
reportSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });

// Pre-save middleware to add initial status history
reportSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add initial status history entry
    this.statusHistory.push({
      status: this.status,
      changedBy: this.assignedTo || new mongoose.Types.ObjectId(), // Temporary admin ID
      notes: 'Report submitted',
      changedAt: new Date()
    });
  }
  next();
});

// Static method to find by tracking ID
reportSchema.statics.findByTrackingId = function(trackingId) {
  return this.findOne({ trackingId })
    .populate('category', 'name description')
    .populate('assignedTo', 'name email')
    .populate('statusHistory.changedBy', 'name')
    .populate('messages.sentBy', 'name');
};

// Static method to get reports with filters
reportSchema.statics.getReportsWithFilters = function(filters = {}, options = {}) {
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
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('category', 'name description')
    .populate('assignedTo', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Instance method to add status history
reportSchema.methods.addStatusHistory = function(status, changedBy, notes = '') {
  this.statusHistory.push({
    status,
    changedBy,
    notes,
    changedAt: new Date()
  });
  this.status = status;
  return this;
};

// Instance method to add internal note
reportSchema.methods.addInternalNote = function(note, addedBy) {
  this.internalNotes.push({
    note,
    addedBy,
    addedAt: new Date()
  });
  return this;
};

// Instance method to add message
reportSchema.methods.addMessage = function(content, fromAdmin = false, sentBy = null) {
  const message = {
    content,
    fromAdmin,
    sentAt: new Date()
  };
  
  if (fromAdmin && sentBy) {
    message.sentBy = sentBy;
  }
  
  this.messages.push(message);
  return this;
};

// Instance method to add evidence
reportSchema.methods.addEvidence = function(evidenceData) {
  this.evidence.push(evidenceData);
  return this;
};

// Instance method to assign to admin
reportSchema.methods.assignTo = function(adminId, assignedBy, notes = '') {
  this.assignedTo = adminId;
  this.addStatusHistory(REPORT_STATUS.UNDER_REVIEW, assignedBy, notes);
  return this;
};

// Instance method to resolve report
reportSchema.methods.resolve = function(summary, resolvedBy) {
  this.status = REPORT_STATUS.RESOLVED;
  this.resolution = {
    summary,
    resolvedBy,
    resolvedAt: new Date()
  };
  this.addStatusHistory(REPORT_STATUS.RESOLVED, resolvedBy, 'Report resolved');
  return this;
};

// Virtual for public data (excludes sensitive admin information)
reportSchema.virtual('publicData').get(function() {
  return {
    trackingId: this.trackingId,
    title: this.title,
    description: this.description,
    category: this.category,
    status: this.status,
    severity: this.severity,
    incidentDate: this.incidentDate,
    location: this.location,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    messages: this.messages.map(msg => ({
      content: msg.content,
      fromAdmin: msg.fromAdmin,
      sentAt: msg.sentAt
    })),
    statusHistory: this.statusHistory.map(history => ({
      status: history.status,
      notes: history.notes,
      changedAt: history.changedAt
    }))
  };
});

const Report = mongoose.model('Report', reportSchema);

export default Report;