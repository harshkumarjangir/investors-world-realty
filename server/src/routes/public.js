import { Router } from 'express';
import { publicRateLimit } from '../middleware/rateLimiter.js';
import {
  publicCommissionCalculatorHandler,
  publicListPropertiesHandler,
  publicAppVersionHandler,
  publicBrandingHandler,
  publicContactHandler,
  publicHealthHandler,
} from '../controllers/public.controller.js';
import { calculateEMIHandler } from '../controllers/emi.controller.js';

const router = Router();

// POST /api/v1/public/commission-calculator
router.post('/commission-calculator', publicRateLimit, publicCommissionCalculatorHandler);

// POST /api/v1/public/emi-calculator
router.post('/emi-calculator', publicRateLimit, calculateEMIHandler);

// GET /api/v1/public/properties
router.get('/properties', publicRateLimit, publicListPropertiesHandler);

// GET /api/v1/public/app-version?platform=android&version=1.0.0
router.get('/app-version', publicRateLimit, publicAppVersionHandler);

// GET /api/v1/public/branding
router.get('/branding', publicRateLimit, publicBrandingHandler);

// POST /api/v1/public/contact
router.post('/contact', publicRateLimit, publicContactHandler);

// GET /api/v1/public/health
router.get('/health', publicHealthHandler);

export default router;
