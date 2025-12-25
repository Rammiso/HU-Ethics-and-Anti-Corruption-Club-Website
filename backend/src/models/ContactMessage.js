import mongoose from 'mongoose';

// Contact message status enum
export const MESSAGE_STATUS = {
  NEW: 'NEW',
  READ: 'READ',
  RESPONDED: 'RESPONDED'
};

const contactMessageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    trim: true,
    maxlength: [100, 'Sender name cannot exceed 100 characters'],
    default: 'Anonymous'
  },
  
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    validate: {
      validator: function(email) {
        // Email is optional, but if provided, must be valid
        if (!email) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters'],
    minlength: [3, 'Subject must be at least 3 characters']
  },
  
  messageBody: {
    type: String,
    required: [true, 'Message body is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
    minlength: [10, 'Message must be at least 10 characters']
  },
  
  status: {
    type: String,
    enum: {
      values: Object.values(MESSAGE_STATUS),
      message: 'Status must be NEW, READ, or RESPONDED'
    },
    default: MESSAGE_STATUS.NEW,
    required: true
  },
  
  // Admin who handled the message
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  
  // Admin response (internal tracking)
  response: {
    content: {
      type: String,
      maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    respondedAt: {
      type: Date
    }
  },
  
  // Internal notes for admins
  internalNotes: [{
    note: {
      type: String,
      required: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
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
  
  // Priority level (for admin use)
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  
  // Category for organization
  category: {
    type: String,
    enum: [
      'GENERAL_INQUIRY',
      'REPORT_ISSUE',
      'SUGGESTION',
      'COMPLAINT',
      'TECHNICAL_SUPPORT',
      'OTHER'
    ],
    default: 'GENERAL_INQUIRY'
  },
  
  // Spam detection flags
  isSpam: {
    type: Boolean,
    default: false
  },
  
  spamScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      // Remove sensitive information from JSON output
      if (ret.email) {
        ret.hasEmail = true;
        delete ret.email; // Don't expose email in general JSON output
      }
      return ret;
    }
  }
});

// Indexes for performance
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ handledBy: 1, status: 1 });
contactMessageSchema.index({ category: 1, status: 1 });
contactMessageSchema.index({ priority: 1, status: 1 });
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ isSpam: 1 });

// Compound indexes for common queries
contactMessageSchema.index({ status: 1, priority: -1, createdAt: -1 });
contactMessageSchema.index({ category: 1, status: 1, createdAt: -1 });

// Static method to get messages with filters (admin only)
contactMessageSchema.statics.getMessagesForAdmin = function(filters = {}, options = {}) {
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
  
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  
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
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('handledBy', 'name email')
    .populate('response.respondedBy', 'name email')
    .populate('internalNotes.addedBy', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get message statistics
contactMessageSchema.statics.getStatistics = async function(filters = {}) {
  const { startDate, endDate } = filters;
  
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }
  
  const [
    totalMessages,
    newMessages,
    readMessages,
    respondedMessages,
    statusStats,
    categoryStats,
    priorityStats,
    spamMessages
  ] = await Promise.all([
    this.countDocuments({ ...dateFilter, isSpam: { $ne: true } }),
    this.countDocuments({ ...dateFilter, status: MESSAGE_STATUS.NEW, isSpam: { $ne: true } }),
    this.countDocuments({ ...dateFilter, status: MESSAGE_STATUS.READ, isSpam: { $ne: true } }),
    this.countDocuments({ ...dateFilter, status: MESSAGE_STATUS.RESPONDED, isSpam: { $ne: true } }),
    this.aggregate([
      { $match: { ...dateFilter, isSpam: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { ...dateFilter, isSpam: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { ...dateFilter, isSpam: { $ne: true } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    this.countDocuments({ ...dateFilter, isSpam: true })
  ]);
  
  return {
    totalMessages,
    newMessages,
    readMessages,
    respondedMessages,
    statusStats,
    categoryStats,
    priorityStats,
    spamMessages
  };
};

// Instance method to mark as read
contactMessageSchema.methods.markAsRead = function(adminId) {
  this.status = MESSAGE_STATUS.READ;
  this.handledBy = adminId;
  return this;
};

// Instance method to mark as responded
contactMessageSchema.methods.markAsResponded = function(responseContent, adminId) {
  this.status = MESSAGE_STATUS.RESPONDED;
  this.response = {
    content: responseContent,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  this.handledBy = adminId;
  return this;
};

// Instance method to add internal note
contactMessageSchema.methods.addInternalNote = function(note, adminId) {
  this.internalNotes.push({
    note,
    addedBy: adminId,
    addedAt: new Date()
  });
  return this;
};

// Instance method to update priority
contactMessageSchema.methods.updatePriority = function(priority, adminId) {
  this.priority = priority;
  this.handledBy = adminId;
  return this;
};

// Instance method to mark as spam
contactMessageSchema.methods.markAsSpam = function(adminId) {
  this.isSpam = true;
  this.spamScore = 100;
  this.handledBy = adminId;
  return this;
};

// Instance method to get safe data for admin view (includes email)
contactMessageSchema.methods.getAdminData = function() {
  const data = this.toObject();
  // For admin view, include email but mark it as sensitive
  return {
    ...data,
    email: this.email, // Include actual email for admin
    hasEmail: !!this.email
  };
};

// Virtual for public data (excludes sensitive information)
contactMessageSchema.virtual('publicData').get(function() {
  return {
    _id: this._id,
    subject: this.subject,
    status: this.status,
    category: this.category,
    createdAt: this.createdAt,
    hasEmail: !!this.email,
    senderName: this.senderName || 'Anonymous'
  };
});

// Pre-save middleware for basic spam detection
contactMessageSchema.pre('save', function(next) {
  if (this.isNew) {
    // Basic spam detection
    let spamScore = 0;
    
    // Check for excessive caps
    const capsRatio = (this.messageBody.match(/[A-Z]/g) || []).length / this.messageBody.length;
    if (capsRatio > 0.5) spamScore += 20;
    
    // Check for excessive exclamation marks
    const exclamationCount = (this.messageBody.match(/!/g) || []).length;
    if (exclamationCount > 5) spamScore += 15;
    
    // Check for suspicious keywords
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations', 'click here', 'free money'];
    const messageText = this.messageBody.toLowerCase();
    spamKeywords.forEach(keyword => {
      if (messageText.includes(keyword)) spamScore += 25;
    });
    
    // Check for very short messages with email
    if (this.messageBody.length < 20 && this.email) spamScore += 10;
    
    this.spamScore = Math.min(spamScore, 100);
    
    // Auto-mark as spam if score is high
    if (spamScore >= 70) {
      this.isSpam = true;
    }
  }
  
  next();
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;