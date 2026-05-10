import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimiter.js';
import {
  createTicketHandler,
  getTicketsHandler,
  getTicketByIdHandler,
  replyToTicketHandler,
} from '../controllers/support.controller.js';

const router = Router();

// All support routes require authentication
router.use(authenticate, authRateLimit);

// GET  /api/v1/support/tickets?page=1&pageSize=20
router.get('/tickets', getTicketsHandler);

// POST /api/v1/support/tickets — body: { subject, description }
router.post('/tickets', createTicketHandler);

// GET  /api/v1/support/tickets/:id
router.get('/tickets/:id', getTicketByIdHandler);

// POST /api/v1/support/tickets/:id/reply — body: { message }
router.post('/tickets/:id/reply', replyToTicketHandler);

export default router;
