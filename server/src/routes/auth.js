import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { publicRateLimit, authRateLimit } from '../middleware/rateLimiter.js';
import {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPasswordHandler,
  changePasswordHandler,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/login',
  publicRateLimit,
  [
    body('userId').trim().notEmpty().withMessage('User ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login,
);

router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  refresh,
);

router.post('/logout', authenticate, authRateLimit, logout);

router.post('/forgot-password',
  publicRateLimit,
  [body('identifier').trim().notEmpty().withMessage('Phone number or email is required')],
  validate,
  forgotPassword,
);

router.post('/reset-password',
  publicRateLimit,
  [
    body('identifier').trim().notEmpty().withMessage('Phone or email is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').notEmpty().withMessage('New password is required'),
  ],
  validate,
  resetPasswordHandler,
);

router.post('/change-password',
  authenticate,
  authRateLimit,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').notEmpty().withMessage('New password is required'),
  ],
  validate,
  changePasswordHandler,
);

export default router;
