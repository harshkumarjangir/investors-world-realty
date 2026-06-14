import { Router } from 'express';
import { publicRateLimit } from '../middleware/rateLimiter.js';
import {
  publicListPropertiesHandler,
  publicAppVersionHandler,
  publicBrandingHandler,
  publicContactHandler,
  publicHealthHandler,
  publicPrivacyHandler,
  publicTermsHandler,
  publicSupportPageHandler,
  publicHelpCenterHandler,
} from '../controllers/public.controller.js';
import { calculateEMIHandler } from '../controllers/emi.controller.js';
import prisma from '../utils/prisma.js';

const router = Router();


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

// GET /api/v1/public/privacy | /terms | /support — JSON responses containing HTML for mobile WebView
router.get('/privacy', publicRateLimit, publicPrivacyHandler);
router.get('/terms', publicRateLimit, publicTermsHandler);
router.get('/support', publicRateLimit, publicSupportPageHandler);
router.get('/help-center', publicRateLimit, publicHelpCenterHandler);

// ─── Location Endpoints (for Flutter dropdowns — no auth required) ────────────

// GET /api/v1/public/states
// Returns all 31 Indian states sorted alphabetically
router.get('/states', publicRateLimit, async (req, res, next) => {
  try {
    const states = await prisma.masterState.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    return res.json({ status: 'success', message: 'States retrieved', data: states });
  } catch (err) { return next(err); }
});

// GET /api/v1/public/cities?state=Rajasthan
// Returns cities for the given state name. No state param = all cities.
router.get('/cities', publicRateLimit, async (req, res, next) => {
  try {
    const { state } = req.query;
    let cities;

    if (state) {
      const stateRecord = await prisma.masterState.findFirst({
        where: { name: { contains: state, mode: 'insensitive' } },
        select: { id: true },
      });
      if (!stateRecord) {
        return res.json({ status: 'success', message: 'No cities found for this state', data: [] });
      }
      cities = await prisma.masterCity.findMany({
        where: { stateId: stateRecord.id },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
    } else {
      cities = await prisma.masterCity.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, stateId: true },
      });
    }

    return res.json({ status: 'success', message: 'Cities retrieved', data: cities });
  } catch (err) { return next(err); }
});

export default router;
