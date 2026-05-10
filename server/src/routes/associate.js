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
  uploadPhotoHandler,
  submitPANHandler,
  submitAadhaarHandler,
  submitBankHandler,
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

router.post(
  '/profile/photo',
  uploadProfilePhoto.single('photo'),
  uploadPhotoHandler,
);

// ─── KYC ─────────────────────────────────────────────────────────────────────
router.post(
  '/kyc/pan',
  uploadKYCDocument.single('document'),
  [
    body('documentNumber')
      .trim()
      .notEmpty()
      .withMessage('PAN number is required')
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      .withMessage('Invalid PAN format (e.g. ABCDE1234F)'),
  ],
  validate,
  submitPANHandler,
);

router.post(
  '/kyc/aadhaar',
  uploadKYCDocument.single('document'),
  [
    body('documentNumber')
      .trim()
      .notEmpty()
      .withMessage('Aadhaar number is required')
      .matches(/^\d{12}$/)
      .withMessage('Aadhaar number must be 12 digits'),
  ],
  validate,
  submitAadhaarHandler,
);

router.post(
  '/kyc/bank',
  [
    body('accountNumber')
      .trim()
      .notEmpty()
      .withMessage('Account number is required'),
    body('ifsc')
      .trim()
      .notEmpty()
      .withMessage('IFSC code is required')
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .withMessage('Invalid IFSC code format'),
    body('bankName')
      .trim()
      .notEmpty()
      .withMessage('Bank name is required'),
  ],
  validate,
  submitBankHandler,
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
