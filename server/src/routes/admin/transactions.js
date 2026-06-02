import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listTransactionsHandler,
  getWalletTransactionsHandler,
  listWithdrawalsHandler,
  approveWithdrawalHandler,
  rejectWithdrawalHandler,
} from '../../controllers/admin/transaction.controller.js';

const router = Router();

// Wallet transactions
router.get('/', requirePermission('transactions:read'), listTransactionsHandler);
router.get('/wallet/:associateId', requirePermission('transactions:read'), getWalletTransactionsHandler);
router.get('/withdrawals', requirePermission('transactions:read'), listWithdrawalsHandler);
router.post('/withdrawals/:id/approve', requirePermission('payouts:write'), approveWithdrawalHandler);
router.post('/withdrawals/:id/reject', requirePermission('payouts:write'), rejectWithdrawalHandler);

export default router;
