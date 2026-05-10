import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimiter.js';
import {
  getTreeHandler,
  getDownlineHandler,
  getSponsorHandler,
  getTeamSummaryHandler,
} from '../controllers/genealogy.controller.js';

const router = Router();

// All genealogy routes require authentication
router.use(authenticate, authRateLimit);

// GET /api/v1/genealogy/tree?depth=5
router.get('/tree', getTreeHandler);

// GET /api/v1/genealogy/downline?status=ACTIVE&leg=left&level=2&page=1&pageSize=20
router.get('/downline', getDownlineHandler);

// GET /api/v1/genealogy/sponsor
router.get('/sponsor', getSponsorHandler);

// GET /api/v1/genealogy/team-summary
router.get('/team-summary', getTeamSummaryHandler);

export default router;
