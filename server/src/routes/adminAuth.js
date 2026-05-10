import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { publicRateLimit } from '../middleware/rateLimiter.js';
import {
  adminLogin,
  adminVerifyOtp,
  adminLogout,
} from '../controllers/adminAuth.controller.js';

const router = Router();

router.post('/login',
  publicRateLimit,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  adminLogin,
);

router.post('/verify-otp',
  publicRateLimit,
  [
    body('adminId').notEmpty().withMessage('Admin ID is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  adminVerifyOtp,
);

router.post('/logout', authenticateAdmin, adminLogout);

export default router;
