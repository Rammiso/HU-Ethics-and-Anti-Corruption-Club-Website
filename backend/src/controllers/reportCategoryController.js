import ReportCategory, { CATEGORY_STATUS, SEVERITY_LEVELS } from '../models/ReportCategory.js';
import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Report Category Controller
 * Handles CRUD operations for report categories (Admin only)
 */

/**
 * Get all report categories (admin view with filters)
 */
export const getReportCategories = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const categories = await ReportCategory.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ displayOrder: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ReportCategory.countDocuments(query);
    
    // Log admin access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_REPORT_CATEGORY,
      resourceType: RESOURCE_TYPES.REPORT_CATEGORY,
      details: { filters: { status, search }, pagination: { page, limit } },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to get report categories:', error);
    throw error;
  }
};

/**
 * Get active report categories (public endpoint)
 */
export const getActiveReportCategories = async (req, res) => {
  try {
    const categories = await ReportCategory.getActiveCategories();
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    logger.error('Failed to get active report categories:', error);
    throw error;
  }
};

/**
 * Get report category by ID
 */
export const getReportCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await ReportCategory.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!category) {
      throw new AppError('Report category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    
    // Log admin access
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.VIEW_REPORT_CATEGORY,
      resourceType: RESOURCE_TYPES.REPORT_CATEGORY,
      resourceId: id,
      details: { categoryName: category.name },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: category
    });
    
  } catch (error) {
    logger.error('Failed to get report category:', error);
    throw error;
  }
};

/**
 * Create new report category
 */
export const createReportCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      defaultSeverity,
      displayOrder,
      guidelines,
      examples,
      icon,
      color
    } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      throw new AppError('Name and description are required', 400, 'MISSING_REQUIRED_FIELDS');
    }
    
    // Check if category with same name exists
    const existingCategory = await ReportCategory.findOne({ name: name.trim() });
    if (existingCategory) {
      throw new AppError('Category with this name already exists', 400, 'CATEGORY_EXISTS');
    }
    
    // Create category
    const category = new ReportCategory({
      name: name.trim(),
      description: description.trim(),
      defaultSeverity: defaultSeverity || SEVERITY_LEVELS.MEDIUM,
      displayOrder: displayOrder || 0,
      guidelines: guidelines?.trim() || '',
      examples: examples || [],
      icon: icon || 'report',
      color: color || '#6B7280',
      createdBy: req.admin._id
    });
    
    await category.save();
    
    // Populate creator info
    await category.populate('createdBy', 'name email');
    
    // Log category creation
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.CREATE_REPORT_CATEGORY,
      resourceType: RESOURCE_TYPES.REPORT_CATEGORY,
      resourceId: category._id,
      details: {
        categoryName: category.name,
        defaultSeverity: category.defaultSeverity,
        displayOrder: category.displayOrder
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Report category created', {
      categoryId: category._id,
      name: category.name,
      createdBy: req.admin._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Report category created successfully',
      data: category
    });
    
  } catch (error) {
    logger.error('Failed to create report category:', error);
    throw error;
  }
};

/**
 * Update report category
 */
export const updateReportCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      defaultSeverity,
      status,
      displayOrder,
      guidelines,
      examples,
      icon,
      color
    } = req.body;
    
    const category = await ReportCategory.findById(id);
    if (!category) {
      throw new AppError('Report category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    
    // Store old values for audit
    const oldValues = {
      name: category.name,
      description: category.description,
      defaultSeverity: category.defaultSeverity,
      status: category.status,
      displayOrder: category.displayOrder
    };
    
    // Update fields
    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (defaultSeverity !== undefined) category.defaultSeverity = defaultSeverity;
    if (status !== undefined) category.status = status;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (guidelines !== undefined) category.guidelines = guidelines.trim();
    if (examples !== undefined) category.examples = examples;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    
    category.updatedBy = req.admin._id;
    
    await category.save();
    
    // Populate updated info
    await category.populate(['createdBy', 'updatedBy'], 'name email');
    
    // Log category update
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.UPDATE_REPORT_CATEGORY,
      resourceType: RESOURCE_TYPES.REPORT_CATEGORY,
      resourceId: category._id,
      details: {
        categoryName: category.name,
        oldValues,
        newValues: {
          name: category.name,
          description: category.description,
          defaultSeverity: category.defaultSeverity,
          status: category.status,
          displayOrder: category.displayOrder
        }
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Report category updated', {
      categoryId: category._id,
      name: category.name,
      updatedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Report category updated successfully',
      data: category
    });
    
  } catch (error) {
    logger.error('Failed to update report category:', error);
    throw error;
  }
};

/**
 * Delete report category
 */
export const deleteReportCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await ReportCategory.findById(id);
    if (!category) {
      throw new AppError('Report category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    
    // Check if category has reports
    const Report = (await import('../models/Report.js')).default;
    const reportCount = await Report.countDocuments({ category: id });
    
    if (reportCount > 0) {
      throw new AppError(
        `Cannot delete category with ${reportCount} existing reports. Set status to INACTIVE instead.`,
        400,
        'CATEGORY_HAS_REPORTS'
      );
    }
    
    // Store category info for audit
    const categoryInfo = {
      name: category.name,
      description: category.description,
      reportCount: category.reportCount
    };
    
    await ReportCategory.findByIdAndDelete(id);
    
    // Log category deletion
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.DELETE_REPORT_CATEGORY,
      resourceType: RESOURCE_TYPES.REPORT_CATEGORY,
      resourceId: id,
      details: categoryInfo,
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Report category deleted', {
      categoryId: id,
      name: categoryInfo.name,
      deletedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Report category deleted successfully'
    });
    
  } catch (error) {
    logger.error('Failed to delete report category:', error);
    throw error;
  }
};

/**
 * Update category display order
 */
export const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body; // Array of { id, displayOrder }
    
    if (!Array.isArray(categories)) {
      throw new AppError('Categories must be an array', 400, 'INVALID_INPUT');
    }
    
    // Update display orders
    const updatePromises = categories.map(({ id, displayOrder }) =>
      ReportCategory.findByIdAndUpdate(
        id,
        { displayOrder, updatedBy: req.admin._id },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    // Log order update
    await auditService.log({
      adminId: req.admin._id,
      action: 'UPDATE_CATEGORY_ORDER',
      resourceType: RESOURCE_TYPES.REPORT_CATEGORY,
      details: { categoriesUpdated: categories.length },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('Category display order updated', {
      categoriesUpdated: categories.length,
      updatedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'Category order updated successfully'
    });
    
  } catch (error) {
    logger.error('Failed to update category order:', error);
    throw error;
  }
};

/**
 * Get category statistics
 */
export const getCategoryStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await ReportCategory.findById(id);
    if (!category) {
      throw new AppError('Report category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    
    // Get report statistics for this category
    const Report = (await import('../models/Report.js')).default;
    const { REPORT_STATUS, REPORT_SEVERITY } = await import('../models/Report.js');
    
    const [
      totalReports,
      statusStats,
      severityStats,
      recentReports
    ] = await Promise.all([
      Report.countDocuments({ category: id }),
      Report.aggregate([
        { $match: { category: category._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $match: { category: category._id } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Report.find({ category: id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('trackingId title status severity createdAt')
    ]);
    
    const statistics = {
      category: {
        id: category._id,
        name: category.name,
        status: category.status
      },
      totalReports,
      statusStats,
      severityStats,
      recentReports
    };
    
    // Log statistics access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_CATEGORY_STATISTICS',
      resourceType: RESOURCE_TYPES.REPORT_CATEGORY,
      resourceId: id,
      details: { categoryName: category.name },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    logger.error('Failed to get category statistics:', error);
    throw error;
  }
};