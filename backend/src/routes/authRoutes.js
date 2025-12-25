import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  login, 
  logout, 
  getProfile, 
  changePassword, 
  validateToken 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true
});

// Stricter rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    code: 'TOO_MANY_LOGIN_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public authentication routes (no auth required)
router.post('/login', loginLimiter, login);

// Protected authentication routes (require valid JWT)
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/change-password', authLimiter, changePassword);
router.get('/validate', validateToken);

export default router;