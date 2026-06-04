import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listAssociatesHandler,
  getAssociateHandler,
  registerAssociateHandler,
  editAssociateHandler,
  activateAssociateHandler,
  suspendAssociateHandler,
  unsuspendAssociateHandler,
  deleteAssociateHandler,
} from '../../controllers/admin/associate.controller.js';

const router = Router();

router.get('/', requirePermission('associates:read'), listAssociatesHandler);
router.post('/', requirePermission('associates:write'), registerAssociateHandler);

// GET /admin/associates/pending — dedicated pending approvals endpoint
router.get('/pending', requirePermission('associates:read'), async (req, res, next) => {
  try {
    const { parsePagination, paginatedResponse } = await import('../../utils/response.js');
    const { adminListAssociates } = await import('../../services/admin/associate.service.js');
    const pagination = parsePagination(req.query);
    const result = await adminListAssociates({ status: 'INACTIVE' }, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Pending registrations');
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', requirePermission('associates:read'), getAssociateHandler);
router.patch('/:id', requirePermission('associates:write'), editAssociateHandler);
router.post('/:id/activate', requirePermission('associates:write'), activateAssociateHandler);
router.post('/:id/suspend', requirePermission('associates:write'), suspendAssociateHandler);
router.post('/:id/unsuspend', requirePermission('associates:write'), unsuspendAssociateHandler);
router.delete('/:id', requirePermission('associates:delete'), deleteAssociateHandler);

export default router;
