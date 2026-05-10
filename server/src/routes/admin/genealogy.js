import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  getTreeHandler,
  searchAssociateHandler,
  getLevelAnalysisHandler,
  getBusinessTrackingHandler,
} from '../../controllers/admin/genealogy.controller.js';

const router = Router();

router.get('/tree/:associateId', requirePermission('genealogy:read'), getTreeHandler);
router.get('/search', requirePermission('genealogy:read'), searchAssociateHandler);
router.get('/level-analysis', requirePermission('genealogy:read'), getLevelAnalysisHandler);
router.get('/business-tracking/:associateId', requirePermission('genealogy:read'), getBusinessTrackingHandler);

export default router;
