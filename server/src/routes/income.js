import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimiter.js';
import {
  getIncomeSummaryHandler,
  getIncomeHistoryHandler,
} from '../controllers/income.controller.js';

const router = Router();

// All income routes require authentication
router.use(authenticate, authRateLimit);

// GET /api/v1/income/summary
router.get('/summary', getIncomeSummaryHandler);

// GET /api/v1/income/history?page=1&pageSize=20
router.get('/history', getIncomeHistoryHandler);


export default router;
