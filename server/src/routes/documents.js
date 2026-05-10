import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimiter.js';
import {
  downloadWelcomeLetterHandler,
  downloadReceiptHandler,
  downloadAgreementHandler,
  getKYCDocumentsHandler,
} from '../controllers/document.controller.js';

const router = Router();

// All document routes require authentication
router.use(authenticate, authRateLimit);

// GET /api/v1/documents/welcome-letter
router.get('/welcome-letter', downloadWelcomeLetterHandler);

// GET /api/v1/documents/receipt/:transactionId
router.get('/receipt/:transactionId', downloadReceiptHandler);

// GET /api/v1/documents/agreement
router.get('/agreement', downloadAgreementHandler);

// GET /api/v1/documents/kyc
router.get('/kyc', getKYCDocumentsHandler);

export default router;
