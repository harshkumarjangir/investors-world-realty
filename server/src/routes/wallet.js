import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimiter.js';
import {
  getBalanceHandler,
  transferHandler,
  getTransactionsHandler,
  requestWithdrawalHandler,
  getWithdrawalsHandler,
} from '../controllers/wallet.controller.js';

const router = Router();

// All wallet routes require authentication
router.use(authenticate, authRateLimit);

// GET  /api/v1/wallet/balance
router.get('/balance', getBalanceHandler);

import { getWalletDashboardHandler, getAllActivityHandler } from '../controllers/wallet.controller.js';
// GET  /api/v1/wallet/dashboard
router.get('/dashboard', getWalletDashboardHandler);

// GET  /api/v1/wallet/all-activity?page=1&pageSize=20
router.get('/all-activity', getAllActivityHandler);

// POST /api/v1/wallet/transfer — body: { recipientUserId, amount, description? }
router.post('/transfer', transferHandler);

// GET  /api/v1/wallet/transactions?page=1&pageSize=20
router.get('/transactions', getTransactionsHandler);

// POST /api/v1/wallet/withdraw — body: { amount }
router.post('/withdraw', requestWithdrawalHandler);

// GET  /api/v1/wallet/withdrawals?page=1&pageSize=20
router.get('/withdrawals', getWithdrawalsHandler);

export default router;
