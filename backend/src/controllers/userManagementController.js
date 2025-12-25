import Admin, { ADMIN_ROLES, ADMIN_STATUS } from '../models/Admin.js';
import auditService from '../services/auditService.js';
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * User Management Controller
 * Handles CRUD operations for admin users (SUPER_ADMIN only)
 */

/**
 * Get all users with pagination, sorting, and filtering
 */
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      status,
      search
    } = req.query;
    
    // Build query
    let query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const users = await Admin.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password'); // Never include password
    
    const total = await Admin.countDocuments(query);
    
    // Log access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_USERS',
      resourceType: RESOURCE_TYPES.ADMIN,
      details: { filters: { role, status, search }, pagination: { page, limit } },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to get all users:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await Admin.findById(id).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Log access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_USER',
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: id,
      details: { userName: user.name, userEmail: user.email },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    logger.error('Failed to get user by ID:', error);
    throw error;
  }
};

/**
 * Create new user
 */
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      role,
      status
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400, 'MISSING_REQUIRED_FIELDS');
    }
    
    // Validate password strength
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      throw new AppError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 400, 'WEAK_PASSWORD');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
    }
    
    // Check if email already exists
    const existingEmail = await Admin.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new AppError('Email already exists', 400, 'EMAIL_EXISTS');
    }
    
    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await Admin.findOne({ username: username.toLowerCase() });
      if (existingUsername) {
        throw new AppError('Username already exists', 400, 'USERNAME_EXISTS');
      }
    }
    
    // Create user
    const user = new Admin({
      username: username?.toLowerCase(),
      email: email.toLowerCase(),
      password,
      name: name.trim(),
      role: role || ADMIN_ROLES.ADMIN,
      status: status || ADMIN_STATUS.ACTIVE
    });
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    // Log user creation
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.CREATE_ADMIN,
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: user._id,
      details: {
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        userStatus: user.status
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('User created', {
      userId: user._id,
      email: user.email,
      role: user.role,
      createdBy: req.admin._id
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
    
  } catch (error) {
    logger.error('Failed to create user:', error);
    throw error;
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      name,
      role,
      status
    } = req.body;
    
    const user = await Admin.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Prevent self-modification of critical fields
    if (user._id.toString() === req.admin._id.toString()) {
      if (role && role !== user.role) {
        throw new AppError('Cannot change your own role', 403, 'CANNOT_MODIFY_SELF_ROLE');
      }
      if (status && status !== user.status) {
        throw new AppError('Cannot change your own status', 403, 'CANNOT_MODIFY_SELF_STATUS');
      }
    }
    
    // Store old values for audit
    const oldValues = {
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };
    
    // Update fields
    if (username !== undefined) {
      if (username && username !== user.username) {
        const existingUsername = await Admin.findOne({ 
          username: username.toLowerCase(),
          _id: { $ne: id }
        });
        if (existingUsername) {
          throw new AppError('Username already exists', 400, 'USERNAME_EXISTS');
        }
        user.username = username.toLowerCase();
      }
    }
    
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
      }
      
      if (email.toLowerCase() !== user.email) {
        const existingEmail = await Admin.findOne({ 
          email: email.toLowerCase(),
          _id: { $ne: id }
        });
        if (existingEmail) {
          throw new AppError('Email already exists', 400, 'EMAIL_EXISTS');
        }
        user.email = email.toLowerCase();
      }
    }
    
    if (name !== undefined) user.name = name.trim();
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    // Log user update
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.UPDATE_ADMIN,
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: user._id,
      details: {
        userName: user.name,
        oldValues,
        newValues: {
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        }
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('User updated', {
      userId: user._id,
      email: user.email,
      updatedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
    
  } catch (error) {
    logger.error('Failed to update user:', error);
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await Admin.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Prevent self-deletion
    if (user._id.toString() === req.admin._id.toString()) {
      throw new AppError('Cannot delete your own account', 403, 'CANNOT_DELETE_SELF');
    }
    
    // Store user info for audit
    const userInfo = {
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };
    
    await Admin.findByIdAndDelete(id);
    
    // Log user deletion
    await auditService.log({
      adminId: req.admin._id,
      action: 'DELETE_ADMIN',
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: id,
      details: userInfo,
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('User deleted', {
      userId: id,
      email: userInfo.email,
      deletedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    logger.error('Failed to delete user:', error);
    throw error;
  }
};

/**
 * Activate user
 */
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await Admin.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    const oldStatus = user.status;
    user.status = ADMIN_STATUS.ACTIVE;
    await user.save();
    
    // Log status change
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.ACTIVATE_ADMIN,
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: user._id,
      details: {
        userName: user.name,
        userEmail: user.email,
        oldStatus,
        newStatus: user.status
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('User activated', {
      userId: user._id,
      email: user.email,
      activatedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
    
  } catch (error) {
    logger.error('Failed to activate user:', error);
    throw error;
  }
};

/**
 * Deactivate user
 */
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await Admin.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Prevent self-deactivation
    if (user._id.toString() === req.admin._id.toString()) {
      throw new AppError('Cannot deactivate your own account', 403, 'CANNOT_DEACTIVATE_SELF');
    }
    
    const oldStatus = user.status;
    user.status = ADMIN_STATUS.INACTIVE;
    await user.save();
    
    // Log status change
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.DEACTIVATE_ADMIN,
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: user._id,
      details: {
        userName: user.name,
        userEmail: user.email,
        oldStatus,
        newStatus: user.status
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('User deactivated', {
      userId: user._id,
      email: user.email,
      deactivatedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
    
  } catch (error) {
    logger.error('Failed to deactivate user:', error);
    throw error;
  }
};

/**
 * Suspend user
 */
export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const user = await Admin.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Prevent self-suspension
    if (user._id.toString() === req.admin._id.toString()) {
      throw new AppError('Cannot suspend your own account', 403, 'CANNOT_SUSPEND_SELF');
    }
    
    const oldStatus = user.status;
    user.status = ADMIN_STATUS.SUSPENDED;
    await user.save();
    
    // Log status change
    await auditService.log({
      adminId: req.admin._id,
      action: 'SUSPEND_ADMIN',
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: user._id,
      details: {
        userName: user.name,
        userEmail: user.email,
        oldStatus,
        newStatus: user.status,
        reason: reason || 'No reason provided'
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('User suspended', {
      userId: user._id,
      email: user.email,
      reason,
      suspendedBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
    
  } catch (error) {
    logger.error('Failed to suspend user:', error);
    throw error;
  }
};

/**
 * Reset user password (force reset)
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      throw new AppError('New password is required', 400, 'MISSING_PASSWORD');
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      throw new AppError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 400, 'WEAK_PASSWORD');
    }
    
    const user = await Admin.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    user.password = newPassword;
    await user.save();
    
    // Log password reset
    await auditService.log({
      adminId: req.admin._id,
      action: AUDIT_ACTIONS.RESET_ADMIN_PASSWORD,
      resourceType: RESOURCE_TYPES.ADMIN,
      resourceId: user._id,
      details: {
        userName: user.name,
        userEmail: user.email,
        resetType: 'forced_by_super_admin'
      },
      metadata: req.auditMetadata,
      success: true
    });
    
    logger.info('User password reset', {
      userId: user._id,
      email: user.email,
      resetBy: req.admin._id
    });
    
    res.json({
      success: true,
      message: 'User password reset successfully'
    });
    
  } catch (error) {
    logger.error('Failed to reset user password:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      adminCount,
      superAdminCount,
      roleStats,
      statusStats,
      recentUsers
    ] = await Promise.all([
      Admin.countDocuments(),
      Admin.countDocuments({ status: ADMIN_STATUS.ACTIVE }),
      Admin.countDocuments({ status: ADMIN_STATUS.INACTIVE }),
      Admin.countDocuments({ status: ADMIN_STATUS.SUSPENDED }),
      Admin.countDocuments({ role: ADMIN_ROLES.ADMIN }),
      Admin.countDocuments({ role: ADMIN_ROLES.SUPER_ADMIN }),
      Admin.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Admin.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Admin.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role status createdAt')
    ]);
    
    const statistics = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      adminCount,
      superAdminCount,
      roleStats,
      statusStats,
      recentUsers
    };
    
    // Log statistics access
    await auditService.log({
      adminId: req.admin._id,
      action: 'VIEW_USER_STATISTICS',
      resourceType: RESOURCE_TYPES.ADMIN,
      details: { totalUsers },
      metadata: req.auditMetadata,
      success: true
    });
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    logger.error('Failed to get user statistics:', error);
    throw error;
  }
};