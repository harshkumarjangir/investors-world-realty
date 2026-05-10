import { Router } from 'express';
import { authenticateAdmin, requirePermission } from '../../middleware/auth.js';
import {
  creditWalletHandler,
  debitWalletHandler,
  transferWalletHandler,
  getFundLogsHandler,
} from '../../controllers/admin/fund.controller.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// POST /api/v1/admin/funds/credit
router.post('/credit', requirePermission('funds:write'), creditWalletHandler);

// POST /api/v1/admin/funds/debit
router.post('/debit', requirePermission('funds:write'), debitWalletHandler);

// POST /api/v1/admin/funds/transfer
router.post('/transfer', requirePermission('funds:write'), transferWalletHandler);

// GET /api/v1/admin/funds/logs
router.get('/logs', requirePermission('funds:read'), getFundLogsHandler);

export default router;
