import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { publicRateLimit, authRateLimit } from '../middleware/rateLimiter.js';
import {
  validateSponsorHandler,
  registerHandler,
  activateHandler,
  requestDeleteHandler,
} from '../controllers/registration.controller.js';

const router = Router();

// ─── GET /validate-sponsor?sponsorId=IW100001 ─────────────────────────────────
// Public — anyone can check if a sponsor/referral ID is valid
router.get('/validate-sponsor',
  publicRateLimit,
  [
    query('sponsorId')
      .trim()
      .notEmpty()
      .withMessage('sponsorId is required'),
  ],
  validate,
  validateSponsorHandler,
);

// ─── POST /register ───────────────────────────────────────────────────────────
// Public — anyone can register with a referral/sponsor ID
// Status will be INACTIVE (pending admin approval)
router.post('/register',
  publicRateLimit,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),

    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Enter a valid email address')
      .normalizeEmail(),

    body('sponsorId')
      .trim()
      .notEmpty()
      .withMessage('Sponsor/Referral ID is required'),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),

    // Optional fields
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('pincode').optional().trim(),
    body('panNumber').optional().trim(),
    body('dateOfBirth').optional().isISO8601().withMessage('dateOfBirth must be a valid date'),
  ],
  validate,
  registerHandler,
);

// ─── POST /activate ───────────────────────────────────────────────────────────
// Authenticated — admin approves and activates a pending associate
router.post('/activate',
  authenticate,
  [
    body('associateId')
      .trim()
      .notEmpty()
      .withMessage('associateId is required'),
  ],
  validate,
  activateHandler,
);

// ─── POST /request-delete ─────────────────────────────────────────────────────
// Authenticated — associate requests their own account deletion
// Admin must approve the deletion
router.post('/request-delete',
  authenticate,
  authRateLimit,
  requestDeleteHandler,
);

export default router;
