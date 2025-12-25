import mongoose from 'mongoose';

// Report category status enum
export const CATEGORY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

// Severity levels enum
export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

const reportCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    minlength: [2, 'Category name must be at least 2 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  
  defaultSeverity: {
    type: String,
    enum: {
      values: Object.values(SEVERITY_LEVELS),
      message: 'Invalid severity level'
    },
    default: SEVERITY_LEVELS.MEDIUM,
    required: true
  },
  
  status: {
    type: String,
    enum: {
      values: Object.values(CATEGORY_STATUS),
      message: 'Status must be either ACTIVE or INACTIVE'
    },
    default: CATEGORY_STATUS.ACTIVE,
    required: true
  },
  
  displayOrder: {
    type: Number,
    default: 0,
    min: [0, 'Display order cannot be negative']
  },
  
  // Guidelines for this category
  guidelines: {
    type: String,
    maxlength: [1000, 'Guidelines cannot exceed 1000 characters'],
    default: ''
  },
  
  // Examples of what falls under this category
  examples: [{
    type: String,
    maxlength: [200, 'Example cannot exceed 200 characters']
  }],
  
  // Icon or color for UI representation
  icon: {
    type: String,
    maxlength: [50, 'Icon name cannot exceed 50 characters'],
    default: 'report'
  },
  
  color: {
    type: String,
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code'],
    default: '#6B7280'
  },
  
  // Statistics (updated periodically)
  reportCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
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

// Indexes for performance
reportCategorySchema.index({ status: 1, displayOrder: 1 });
reportCategorySchema.index({ slug: 1 });
reportCategorySchema.index({ name: 1 });

// Pre-save middleware to generate slug
reportCategorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  next();
});

// Static method to get active categories
reportCategorySchema.statics.getActiveCategories = function() {
  return this.find({ status: CATEGORY_STATUS.ACTIVE })
    .sort({ displayOrder: 1, name: 1 })
    .select('-reportCount -createdBy -updatedBy');
};

// Static method to get category by slug
reportCategorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: CATEGORY_STATUS.ACTIVE });
};

// Instance method to increment report count
reportCategorySchema.methods.incrementReportCount = async function() {
  this.reportCount += 1;
  return await this.save();
};

// Instance method to update report count
reportCategorySchema.methods.updateReportCount = async function() {
  const Report = mongoose.model('Report');
  const count = await Report.countDocuments({ category: this._id });
  this.reportCount = count;
  return await this.save();
};

const ReportCategory = mongoose.model('ReportCategory', reportCategorySchema);

export default ReportCategory;