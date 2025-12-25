import mongoose from 'mongoose';

// Setting data types enum
export const SETTING_TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON'
};

const systemSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [100, 'Key cannot exceed 100 characters'],
    match: [/^[A-Z0-9_]+$/, 'Key can only contain uppercase letters, numbers, and underscores']
  },
  
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Setting value is required']
  },
  
  type: {
    type: String,
    enum: {
      values: Object.values(SETTING_TYPES),
      message: 'Type must be STRING, NUMBER, BOOLEAN, or JSON'
    },
    required: true
  },
  
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  
  category: {
    type: String,
    enum: [
      'GENERAL',
      'SECURITY',
      'EMAIL',
      'NOTIFICATIONS',
      'FEATURES',
      'LIMITS',
      'APPEARANCE',
      'OTHER'
    ],
    default: 'GENERAL'
  },
  
  isPublic: {
    type: Boolean,
    default: false // Most settings should be private by default
  },
  
  isEditable: {
    type: Boolean,
    default: true // Some settings might be read-only
  },
  
  lastModifiedBy: {
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
systemSettingsSchema.index({ key: 1 });
systemSettingsSchema.index({ category: 1 });
systemSettingsSchema.index({ isPublic: 1 });

// Static method to get setting by key
systemSettingsSchema.statics.getSetting = async function(key) {
  const setting = await this.findOne({ key: key.toUpperCase() });
  return setting ? setting.value : null;
};

// Static method to get all settings by category
systemSettingsSchema.statics.getByCategory = function(category) {
  return this.find({ category: category.toUpperCase() });
};

// Static method to get public settings
systemSettingsSchema.statics.getPublicSettings = function() {
  return this.find({ isPublic: true }).select('key value type description category');
};

// Static method to set or update setting
systemSettingsSchema.statics.setSetting = async function(key, value, type, adminId, options = {}) {
  const {
    description = '',
    category = 'GENERAL',
    isPublic = false,
    isEditable = true
  } = options;
  
  // Validate type and value
  const validatedValue = this.validateValue(value, type);
  
  const setting = await this.findOneAndUpdate(
    { key: key.toUpperCase() },
    {
      value: validatedValue,
      type,
      description,
      category,
      isPublic,
      isEditable,
      lastModifiedBy: adminId
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );
  
  return setting;
};

// Static method to validate value based on type
systemSettingsSchema.statics.validateValue = function(value, type) {
  switch (type) {
    case SETTING_TYPES.STRING:
      return String(value);
      
    case SETTING_TYPES.NUMBER:
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error('Invalid number value');
      }
      return num;
      
    case SETTING_TYPES.BOOLEAN:
      if (typeof value === 'boolean') return value;
      if (value === 'true' || value === '1' || value === 1) return true;
      if (value === 'false' || value === '0' || value === 0) return false;
      throw new Error('Invalid boolean value');
      
    case SETTING_TYPES.JSON:
      if (typeof value === 'object') return value;
      try {
        return JSON.parse(value);
      } catch (error) {
        throw new Error('Invalid JSON value');
      }
      
    default:
      throw new Error('Invalid setting type');
  }
};

// Instance method to update value
systemSettingsSchema.methods.updateValue = async function(newValue, adminId) {
  if (!this.isEditable) {
    throw new Error('This setting is not editable');
  }
  
  // Validate new value
  const validatedValue = this.constructor.validateValue(newValue, this.type);
  
  this.value = validatedValue;
  this.lastModifiedBy = adminId;
  
  return await this.save();
};

// Pre-save middleware to validate value
systemSettingsSchema.pre('save', function(next) {
  try {
    // Validate value matches type
    this.value = this.constructor.validateValue(this.value, this.type);
    next();
  } catch (error) {
    next(error);
  }
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;