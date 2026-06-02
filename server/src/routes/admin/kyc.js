import { Router } from 'express';
import { authenticateAdmin, requirePermission } from '../../middleware/auth.js';
import {
  getPendingKYCHandler,
  getKYCByStatusHandler,
  approveKYCHandler,
  rejectKYCHandler,
  getAssociateKYCHandler,
} from '../../controllers/admin/kyc.controller.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/v1/admin/kyc/pending
router.get('/pending', requirePermission('kyc:read'), getPendingKYCHandler);

// GET /api/v1/admin/kyc/list?status=APPROVED|REJECTED
router.get('/list', requirePermission('kyc:read'), getKYCByStatusHandler);

// POST /api/v1/admin/kyc/:id/approve
router.post('/:id/approve', requirePermission('kyc:write'), approveKYCHandler);

// POST /api/v1/admin/kyc/:id/reject
router.post('/:id/reject', requirePermission('kyc:write'), rejectKYCHandler);

// GET /api/v1/admin/kyc/:associateId
router.get('/:associateId', requirePermission('kyc:read'), getAssociateKYCHandler);

export default router;
