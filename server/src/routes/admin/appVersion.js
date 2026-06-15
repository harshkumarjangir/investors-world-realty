import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listAppVersionsHandler, upsertAppVersionHandler,
} from '../../controllers/admin/appVersion.controller.js';

const router = Router();

router.get('/', requirePermission('config:read'), listAppVersionsHandler);
router.post('/', requirePermission('config:write'), upsertAppVersionHandler);

export default router;
