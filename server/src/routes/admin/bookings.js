import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  createBookingHandler,
  listUnapprovedHandler,
  approveBookingHandler,
  unapproveBookingHandler,
  listAllBookingsHandler,
  listReceiptsHandler,
  getReceiptHandler,
} from '../../controllers/admin/booking.controller.js';

const router = Router();

// POST /api/v1/admin/bookings — Create a new plot booking
router.post('/', requirePermission('transactions:read'), createBookingHandler);

// GET /api/v1/admin/bookings/unapproved — List pending bookings
router.get('/unapproved', requirePermission('transactions:read'), listUnapprovedHandler);

// POST /api/v1/admin/bookings/:id/approve — Approve a booking
router.post('/:id/approve', requirePermission('transactions:read'), approveBookingHandler);

// POST /api/v1/admin/bookings/:id/unapprove — Reject a booking
router.post('/:id/unapprove', requirePermission('transactions:read'), unapproveBookingHandler);

// GET /api/v1/admin/bookings — List all bookings with filters
router.get('/', requirePermission('transactions:read'), listAllBookingsHandler);

// GET /api/v1/admin/bookings/receipts — List receipts (confirmed bookings)
router.get('/receipts', requirePermission('transactions:read'), listReceiptsHandler);

// GET /api/v1/admin/bookings/receipts/:id — Get single receipt
router.get('/receipts/:id', requirePermission('transactions:read'), getReceiptHandler);

export default router;
