import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  getAdminDashboardHandler,
  getRecentTransactionsHandler,
} from '../../controllers/admin/dashboard.controller.js';

const router = Router();

router.get('/', requirePermission('dashboard:read'), getAdminDashboardHandler);
router.get('/recent-transactions', requirePermission('dashboard:read'), getRecentTransactionsHandler);

export default router;
