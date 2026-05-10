import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import { listContactInquiriesHandler, getContactInquiryHandler } from '../../controllers/admin/contact.controller.js';

const router = Router();

router.get('/', requirePermission('contact:read'), listContactInquiriesHandler);
router.get('/:id', requirePermission('contact:read'), getContactInquiryHandler);

export default router;
