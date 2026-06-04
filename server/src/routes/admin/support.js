import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listSupportTicketsHandler,
  getSupportTicketHandler,
  replySupportTicketHandler,
  updateSupportTicketStatusHandler,
} from '../../controllers/admin/support.controller.js';

const router = Router();

router.get('/', requirePermission('support:read'), listSupportTicketsHandler);
router.get('/:id', requirePermission('support:read'), getSupportTicketHandler);
router.post('/:id/reply', requirePermission('support:write'), replySupportTicketHandler);
router.patch('/:id/status', requirePermission('support:write'), updateSupportTicketStatusHandler);

export default router;
