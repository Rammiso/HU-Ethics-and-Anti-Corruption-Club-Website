import SystemSettings, { SETTING_TYPES } from '../models/SystemSettings.js';
import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * System Settings Controller
 * Handles system configuration management (SUPER_ADMIN only)
 */

/**
 * Get all system settings
 */
export const getAllSettings = async (req, res) => {
  try {
    const { category, isPublic } = req.query;
    
    let query = {};
    if (category) query.category = category.toUpperCase();
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    
    const settings = await SystemSettings.find(query)
      .populate('lastModifiedBy', 'name email')
      .sort({ category: 1, key: 1 });
    
    // Log access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_SETTINGS,
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      details: { filters: { category, isPublic }, count: settings.length },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    logger.error('Failed to get all settings:', error);
    throw error;
  }
};

/**
 * Get setting by key
 */
export const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await SystemSettings.findOne({ key: key.toUpperCase() })
      .populate('lastModifiedBy', 'name email');
    
    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }
    
    // Log access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_SETTING',
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      resourceId: setting._id,
      details: { key: setting.key },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: setting
    });
    
  } catch (error) {
    logger.error('Failed to get setting by key:', error);
    throw error;
  }
};

/**
 * Create or update setting
 */
export const createOrUpdateSetting = async (req, res) => {
  try {
    const {
      key,
      value,
      type,
      description,
      category,
      isPublic,
      isEditable
    } = req.body;
    
    // Validate required fields
    if (!key || value === undefined || !type) {
      throw new AppError('Key, value, and type are required', 400, 'MISSING_REQUIRED_FIELDS');
    }
    
    // Validate type
    if (!Object.values(SETTING_TYPES).includes(type)) {
      throw new AppError('Invalid setting type', 400, 'INVALID_TYPE');
    }
    
    // Check if setting exists
    const existingSetting = await SystemSettings.findOne({ key: key.toUpperCase() });
    
    if (existingSetting && !existingSetting.isEditable) {
      throw new AppError('This setting is not editable', 403, 'SETTING_NOT_EDITABLE');
    }
    
    // Create or update setting
    const setting = await SystemSettings.setSetting(
      key,
      value,
      type,
      req.admin._id,
      {
        description,
        category,
        isPublic,
        isEditable
      }
    );
    
    // Populate last modified by
    await setting.populate('lastModifiedBy', 'name email');
    
    // Log action
    await auditService.log({
      adminId: req.admin._id,
      action: existingSetting ? AUDIT_ACTIONS.UPDATE_SETTINGS : 'CREATE_SETTING',
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      resourceId: setting._id,
      details: {
        key: setting.key,
        type: setting.type,
        category: setting.category,
        oldValue: existingSetting ? existingSetting.value : null,
        newValue: setting.value
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Setting created/updated', {
      key: setting.key,
      type: setting.type,
      modifiedBy: req.admin._id
    });
    
    res.status(existingSetting ? 200 : 201).json({
      success: true,
      message: existingSetting ? 'Setting updated successfully' : 'Setting created successfully',
      data: setting
    });
    
  } catch (error) {
    logger.error('Failed to create/update setting:', error);
    throw error;
  }
};

/**
 * Update setting value
 */
export const updateSettingValue = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      throw new AppError('Value is required', 400, 'MISSING_VALUE');
    }
    
    const setting = await SystemSettings.findOne({ key: key.toUpperCase() });
    
    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }
    
    if (!setting.isEditable) {
      throw new AppError('This setting is not editable', 403, 'SETTING_NOT_EDITABLE');
    }
    
    const oldValue = setting.value;
    
    // Update value
    await setting.updateValue(value, req.admin._id);
    
    // Populate last modified by
    await setting.populate('lastModifiedBy', 'name email');
    
    // Log update
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.UPDATE_SETTINGS,
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      resourceId: setting._id,
      details: {
        key: setting.key,
        oldValue,
        newValue: setting.value
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Setting value updated', {
      key: setting.key,
      modifiedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Setting value updated successfully',
      data: setting
    });
    
  } catch (error) {
    logger.error('Failed to update setting value:', error);
    throw error;
  }
};

/**
 * Delete setting
 */
export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await SystemSettings.findOne({ key: key.toUpperCase() });
    
    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }
    
    if (!setting.isEditable) {
      throw new AppError('This setting cannot be deleted', 403, 'SETTING_NOT_DELETABLE');
    }
    
    // Store setting info for audit
    const settingInfo = {
      key: setting.key,
      value: setting.value,
      type: setting.type,
      category: setting.category
    };
    
    await SystemSettings.findByIdAndDelete(setting._id);
    
    // Log deletion
    await auditService.log({
      adminId: req.admin._id,
      action: 'DELETE_SETTING',
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      resourceId: setting._id,
      details: settingInfo,
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Setting deleted', {
      key: settingInfo.key,
      deletedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
    
  } catch (error) {
    logger.error('Failed to delete setting:', error);
    throw error;
  }
};

/**
 * Get settings by category
 */
export const getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const settings = await SystemSettings.getByCategory(category)
      .populate('lastModifiedBy', 'name email');
    
    // Log access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_SETTINGS_BY_CATEGORY',
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      details: { category, count: settings.length },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    logger.error('Failed to get settings by category:', error);
    throw error;
  }
};

/**
 * Get public settings (can be accessed by all admins)
 */
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getPublicSettings();
    
    res.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    logger.error('Failed to get public settings:', error);
    throw error;
  }
};

/**
 * Bulk update settings
 */
export const bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!Array.isArray(settings) || settings.length === 0) {
      throw new AppError('Settings array is required', 400, 'MISSING_SETTINGS');
    }
    
    const results = [];
    const errors = [];
    
    for (const settingData of settings) {
      try {
        const { key, value } = settingData;
        
        if (!key || value === undefined) {
          errors.push({
            key,
            success: false,
            error: 'Key and value are required'
          });
          continue;
        }
        
        const setting = await SystemSettings.findOne({ key: key.toUpperCase() });
        
        if (!setting) {
          errors.push({
            key,
            success: false,
            error: 'Setting not found'
          });
          continue;
        }
        
        if (!setting.isEditable) {
          errors.push({
            key,
            success: false,
            error: 'Setting is not editable'
          });
          continue;
        }
        
        await setting.updateValue(value, req.admin._id);
        
        results.push({
          key,
          success: true,
          data: setting
        });
        
      } catch (error) {
        errors.push({
          key: settingData.key,
          success: false,
          error: error.message
        });
      }
    }
    
    // Log bulk operation
    await auditService.log({
      adminId: req.admin._id,
      action: 'BULK_UPDATE_SETTINGS',
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      details: {
        totalSettings: settings.length,
        successCount: results.length,
        errorCount: errors.length
      },
      metadata: req.auditMetadata,
      success: errors.length === 0
    });
    
    logger.info('Bulk settings update completed', {
      totalSettings: settings.length,
      successCount: results.length,
      errorCount: errors.length,
      modifiedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Bulk settings update completed',
      data: {
        results,
        errors,
        summary: {
          total: settings.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to bulk update settings:', error);
    throw error;
  }
};

/**
 * Initialize default settings
 */
export const initializeDefaultSettings = async (req, res) => {
  try {
    const defaultSettings = [
      {
        key: 'SITE_NAME',
        value: 'HUEACC - Haramaya University Ethics and Anti-Corruption Club',
        type: SETTING_TYPES.STRING,
        description: 'Name of the website',
        category: 'GENERAL',
        isPublic: true,
        isEditable: true
      },
      {
        key: 'SITE_DESCRIPTION',
        value: 'Official website for Haramaya University Ethics and Anti-Corruption Club',
        type: SETTING_TYPES.STRING,
        description: 'Description of the website',
        category: 'GENERAL',
        isPublic: true,
        isEditable: true
      },
      {
        key: 'MAX_LOGIN_ATTEMPTS',
        value: 5,
        type: SETTING_TYPES.NUMBER,
        description: 'Maximum login attempts before account lockout',
        category: 'SECURITY',
        isPublic: false,
        isEditable: true
      },
      {
        key: 'SESSION_TIMEOUT',
        value: 28800000,
        type: SETTING_TYPES.NUMBER,
        description: 'Session timeout in milliseconds (8 hours)',
        category: 'SECURITY',
        isPublic: false,
        isEditable: true
      },
      {
        key: 'ENABLE_REGISTRATION',
        value: false,
        type: SETTING_TYPES.BOOLEAN,
        description: 'Enable public user registration',
        category: 'FEATURES',
        isPublic: false,
        isEditable: true
      },
      {
        key: 'MAINTENANCE_MODE',
        value: false,
        type: SETTING_TYPES.BOOLEAN,
        description: 'Enable maintenance mode',
        category: 'GENERAL',
        isPublic: true,
        isEditable: true
      }
    ];
    
    const results = [];
    
    for (const settingData of defaultSettings) {
      const existing = await SystemSettings.findOne({ key: settingData.key });
      
      if (!existing) {
        const setting = await SystemSettings.setSetting(
          settingData.key,
          settingData.value,
          settingData.type,
          req.admin._id,
          {
            description: settingData.description,
            category: settingData.category,
            isPublic: settingData.isPublic,
            isEditable: settingData.isEditable
          }
        );
        results.push(setting);
      }
    }
    
    // Log initialization
    await auditService.log({
      adminId: req.admin._id,
      action: 'INITIALIZE_DEFAULT_SETTINGS',
      resourceType: RESOURCE_TYPES.SYSTEM_SETTINGS,
      details: { settingsCreated: results.length },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Default settings initialized', {
      settingsCreated: results.length,
      initializedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Default settings initialized successfully',
      data: {
        settingsCreated: results.length,
        settings: results
      }
    });
    
  } catch (error) {
    logger.error('Failed to initialize default settings:', error);
    throw error;
  }
};