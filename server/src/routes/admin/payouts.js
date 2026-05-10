import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  generatePayoutsHandler,
  getPendingPayoutsHandler,
  approvePayoutHandler,
  rejectPayoutHandler,
  getPayoutReportsHandler,
} from '../../controllers/admin/payout.controller.js';

const router = Router();

router.post('/generate', requirePermission('payouts:write'), generatePayoutsHandler);
router.get('/pending', requirePermission('payouts:read'), getPendingPayoutsHandler);
router.get('/reports', requirePermission('payouts:read'), getPayoutReportsHandler);
router.post('/:id/approve', requirePermission('payouts:write'), approvePayoutHandler);
router.post('/:id/reject', requirePermission('payouts:write'), rejectPayoutHandler);

export default router;
