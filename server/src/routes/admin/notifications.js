import { Router } from 'express';
import { authenticateAdmin, requirePermission } from '../../middleware/auth.js';
import {
  sendNotificationHandler,
  getNotificationHistoryHandler,
} from '../../controllers/admin/notification.controller.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// POST /api/v1/admin/notifications
router.post('/', requirePermission('notifications:write'), sendNotificationHandler);

// GET /api/v1/admin/notifications/history
router.get('/history', requirePermission('notifications:read'), getNotificationHistoryHandler);

export default router;
