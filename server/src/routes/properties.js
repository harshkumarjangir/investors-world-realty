import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit, publicRateLimit } from '../middleware/rateLimiter.js';
import { createBookingHandler, getBookingsHandler } from '../controllers/booking.controller.js';
import { calculateEMIHandler, getEMIScheduleHandler } from '../controllers/emi.controller.js';
import {
  listPropertiesHandler,
  getPropertyByIdHandler,
  submitInquiryHandler,
} from '../controllers/property.controller.js';

const router = Router();

// ─── EMI Calculator (no auth required) ───────────────────────────────────────

// POST /api/v1/properties/emi-calculator
router.post('/emi-calculator', publicRateLimit, calculateEMIHandler);

// POST /api/v1/properties/emi-calculator/schedule
router.post('/emi-calculator/schedule', publicRateLimit, getEMIScheduleHandler);

// ─── Booking Routes (authenticated) ──────────────────────────────────────────

// GET  /api/v1/properties/bookings
router.get('/bookings', authenticate, authRateLimit, getBookingsHandler);

// ─── Property Listings (public) ───────────────────────────────────────────────

// GET  /api/v1/properties
router.get('/', publicRateLimit, listPropertiesHandler);

// ─── Dynamic :id routes — must come AFTER all static routes ──────────────────

// POST /api/v1/properties/:id/book — body: { amount }
router.post('/:id/book', authenticate, authRateLimit, createBookingHandler);

// GET  /api/v1/properties/:id
router.get('/:id', publicRateLimit, getPropertyByIdHandler);

// POST /api/v1/properties/:id/inquiry — body: { message }
router.post('/:id/inquiry', authenticate, authRateLimit, submitInquiryHandler);

export default router;
