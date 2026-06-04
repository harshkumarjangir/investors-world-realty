import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { publicRateLimit, authRateLimit } from '../middleware/rateLimiter.js';
import {
  login,
  verifyOtpHandler,
  refresh,
  logout,
  forgotPassword,
  verifyForgotOtpHandler,
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

// verify-otp is kept for registration email verification (signup OTP)
// NOT used for login anymore — login returns tokens directly
router.post('/verify-otp',
  publicRateLimit,
  [
    body('associateId').trim().notEmpty().withMessage('Associate ID is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyOtpHandler,
);

router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  refresh,
);

router.post('/logout', authenticate, authRateLimit, logout);

// ─── Forgot Password — 3 steps ───────────────────────────────────────────────

// Step 1 — Send OTP
router.post('/forgot-password',
  publicRateLimit,
  [body('identifier').trim().notEmpty().withMessage('Email or phone is required')],
  validate,
  forgotPassword,
);

// Step 2 — Verify OTP, get reset token
router.post('/verify-forgot-otp',
  publicRateLimit,
  [
    body('identifier').trim().notEmpty().withMessage('Email or phone is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyForgotOtpHandler,
);

// Step 3 — Set new password using reset token
router.post('/reset-password',
  publicRateLimit,
  [
    body('resetToken').trim().notEmpty().withMessage('Reset token is required'),
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
