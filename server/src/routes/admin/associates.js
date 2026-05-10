import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listAssociatesHandler,
  getAssociateHandler,
  registerAssociateHandler,
  editAssociateHandler,
  activateAssociateHandler,
  suspendAssociateHandler,
  deleteAssociateHandler,
} from '../../controllers/admin/associate.controller.js';

const router = Router();

router.get('/', requirePermission('associates:read'), listAssociatesHandler);
router.post('/', requirePermission('associates:write'), registerAssociateHandler);
router.get('/:id', requirePermission('associates:read'), getAssociateHandler);
router.patch('/:id', requirePermission('associates:write'), editAssociateHandler);
router.post('/:id/activate', requirePermission('associates:write'), activateAssociateHandler);
router.post('/:id/suspend', requirePermission('associates:write'), suspendAssociateHandler);
router.delete('/:id', requirePermission('associates:delete'), deleteAssociateHandler);

export default router;
