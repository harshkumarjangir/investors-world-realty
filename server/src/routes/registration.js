import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { publicRateLimit } from '../middleware/rateLimiter.js';
import {
  validateSponsorHandler,
  registerHandler,
  activateHandler,
} from '../controllers/registration.controller.js';

const router = Router();

// ─── GET /validate-sponsor?sponsorId=IW100001 ─────────────────────────────────
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

    body('address')
      .trim()
      .notEmpty()
      .withMessage('Address is required'),

    body('panNumber')
      .trim()
      .notEmpty()
      .withMessage('PAN number is required'),

    body('sponsorId')
      .trim()
      .notEmpty()
      .withMessage('Sponsor ID is required'),

    body('placement')
      .trim()
      .notEmpty()
      .withMessage('Placement is required')
      .isIn(['LEFT', 'RIGHT'])
      .withMessage('Placement must be LEFT or RIGHT'),

    body('packageId')
      .trim()
      .notEmpty()
      .withMessage('Package ID is required'),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),

    // Optional fields
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('pincode').optional().trim(),
    body('dateOfBirth').optional().isISO8601().withMessage('dateOfBirth must be a valid date'),
  ],
  validate,
  registerHandler,
);

// ─── POST /activate ───────────────────────────────────────────────────────────
router.post('/activate',
  authenticate,
  [
    body('associateId')
      .trim()
      .notEmpty()
      .withMessage('associateId is required'),

    body('packageId')
      .trim()
      .notEmpty()
      .withMessage('packageId is required'),
  ],
  validate,
  activateHandler,
);

export default router;
