import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listAppVersionsHandler, upsertAppVersionHandler,
  listBrandingAssetsHandler, upsertBrandingAssetHandler,
} from '../../controllers/admin/appVersion.controller.js';

const router = Router();

router.get('/', requirePermission('config:read'), listAppVersionsHandler);
router.post('/', requirePermission('config:write'), upsertAppVersionHandler);
router.get('/branding', requirePermission('config:read'), listBrandingAssetsHandler);
router.post('/branding', requirePermission('config:write'), upsertBrandingAssetHandler);

export default router;
