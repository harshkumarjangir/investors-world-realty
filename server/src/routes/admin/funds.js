import { Router } from 'express';
import { authenticateAdmin, requirePermission } from '../../middleware/auth.js';
import {
  creditWalletHandler,
  debitWalletHandler,
  transferWalletHandler,
  getFundLogsHandler,
  advancePaymentHandler,
  getAdvanceLedgerHandler,
  getAdvanceBalanceHandler,
} from '../../controllers/admin/fund.controller.js';

const router = Router();

router.use(authenticateAdmin);

router.post('/credit',   requirePermission('funds:write'), creditWalletHandler);
router.post('/debit',    requirePermission('funds:write'), debitWalletHandler);
router.post('/transfer', requirePermission('funds:write'), transferWalletHandler);
router.get('/logs',      requirePermission('funds:read'),  getFundLogsHandler);

// Advance Payment
router.post('/advance',              requirePermission('funds:write'), advancePaymentHandler);
router.get('/advance/ledger',        requirePermission('funds:read'),  getAdvanceLedgerHandler);
router.get('/advance/balance/:userId', requirePermission('funds:read'), getAdvanceBalanceHandler);

export default router;
