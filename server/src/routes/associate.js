import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimiter.js';
import { uploadProfilePhoto, uploadKYCDocument } from '../utils/multer.js';

// Controllers
import {
  getDashboardHandler,
  getAdvancePaymentHandler,
  getReferralLinkHandler,
  getReferralQRHandler,
} from '../controllers/dashboard.controller.js';

import {
  getProfileHandler,
  updateProfileHandler,
  submitKYCHandler,
} from '../controllers/profile.controller.js';

import {
  getSettingsHandler,
  updateSettingsHandler,
} from '../controllers/settings.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate, authRateLimit);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardHandler);

router.get('/advance-payment', getAdvancePaymentHandler);

router.get('/referral-link', getReferralLinkHandler);

router.get('/referral-qr', getReferralQRHandler);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get('/profile', getProfileHandler);

router.patch(
  '/profile',
  uploadProfilePhoto.single('photo'),
  [
    body('phone')
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid email address'),
    body('pincode')
      .optional()
      .trim()
      .isLength({ min: 4, max: 10 })
      .withMessage('Invalid pincode'),
  ],
  validate,
  updateProfileHandler,
);

// ─── KYC ─────────────────────────────────────────────────────────────────────
router.post(
  '/kyc',
  uploadKYCDocument.fields([
    { name: 'panDocument', maxCount: 1 },
    { name: 'panDocumentBack', maxCount: 1 },
    { name: 'aadhaarDocument', maxCount: 1 },
    { name: 'aadhaarDocumentBack', maxCount: 1 },
    { name: 'chequeDocument', maxCount: 1 },
  ]),
  [
    body('panNumber')
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      .withMessage('Invalid PAN format (e.g. ABCDE1234F)'),
    body('aadhaarNumber')
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^\d{12}$/)
      .withMessage('Aadhaar number must be 12 digits'),
    body('bankIfsc')
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .withMessage('Invalid IFSC code format'),
  ],
  validate,
  submitKYCHandler,
);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', getSettingsHandler);

router.patch(
  '/settings',
  [
    body('theme')
      .optional()
      .isIn(['light', 'dark'])
      .withMessage('Theme must be light or dark'),
    body('language')
      .optional()
      .isIn(['en', 'hi'])
      .withMessage('Language must be en or hi'),
  ],
  validate,
  updateSettingsHandler,
);

export default router;
