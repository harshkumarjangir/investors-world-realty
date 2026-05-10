import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimiter.js';
import {
  registerDeviceTokenHandler,
  removeDeviceTokenHandler,
  getNotificationsHandler,
  markAsReadHandler,
} from '../controllers/notification.controller.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate, authRateLimit);

// POST   /api/v1/notifications/device-token — body: { token, platform }
router.post('/device-token', registerDeviceTokenHandler);

// DELETE /api/v1/notifications/device-token — body: { token }
router.delete('/device-token', removeDeviceTokenHandler);

// GET    /api/v1/notifications?page=1&pageSize=20
router.get('/', getNotificationsHandler);

// PATCH  /api/v1/notifications/:id/read
router.patch('/:id/read', markAsReadHandler);

export default router;
