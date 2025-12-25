import express from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';
import { auditView } from '../middleware/auditMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  suspendUser,
  resetUserPassword,
  getUserStatistics
} from '../controllers/userManagementController.js';

const router = express.Router();

/**
 * All user management routes require authentication and SUPER_ADMIN role
 */
router.use(authenticate);
router.use(requireSuperAdmin);

// Get all users with pagination, sorting, and filtering
router.get('/', 
  auditView('Admin', { logViews: true }), 
  asyncHandler(getAllUsers)
);

// Get user statistics
router.get('/statistics', 
  asyncHandler(getUserStatistics)
);

// Get user by ID
router.get('/:id', 
  auditView('Admin', { logViews: true }), 
  asyncHandler(getUserById)
);

// Create new user
router.post('/', 
  asyncHandler(createUser)
);

// Update user
router.put('/:id', 
  asyncHandler(updateUser)
);

// Delete user
router.delete('/:id', 
  asyncHandler(deleteUser)
);

// Activate user
router.put('/:id/activate', 
  asyncHandler(activateUser)
);

// Deactivate user
router.put('/:id/deactivate', 
  asyncHandler(deactivateUser)
);

// Suspend user
router.put('/:id/suspend', 
  asyncHandler(suspendUser)
);

// Reset user password (force reset)
router.put('/:id/reset-password', 
  asyncHandler(resetUserPassword)
);

export default router;