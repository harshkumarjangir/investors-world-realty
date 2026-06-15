import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listCategoriesHandler, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler,
  createStateHandler, updateStateHandler, deleteStateHandler,
  createCityHandler, updateCityHandler, deleteCityHandler,
  listRolesHandler, createRoleHandler, updateRoleHandler, deleteRoleHandler,
  getSystemConfigHandler, upsertSystemConfigHandler,
} from '../../controllers/admin/config.controller.js';
import {
  listBrandingAssetsHandler, upsertBrandingAssetHandler
} from '../../controllers/admin/appVersion.controller.js';
import { uploadBrandingAsset } from '../../utils/multer.js';

const router = Router();

// System Config
router.get('/', requirePermission('config:read'), getSystemConfigHandler);
router.patch('/', requirePermission('config:write'), upsertSystemConfigHandler);

// Branding Assets
router.get('/branding', requirePermission('config:read'), listBrandingAssetsHandler);
router.post('/branding', requirePermission('config:write'), uploadBrandingAsset.single('file'), upsertBrandingAssetHandler);

// Property Categories
router.get('/categories', requirePermission('config:read'), listCategoriesHandler);
router.post('/categories', requirePermission('config:write'), createCategoryHandler);
router.patch('/categories/:id', requirePermission('config:write'), updateCategoryHandler);
router.delete('/categories/:id', requirePermission('config:write'), deleteCategoryHandler);

// Geographic Data (reads: GET /public/states, GET /public/cities)
router.post('/states', requirePermission('config:write'), createStateHandler);
router.patch('/states/:id', requirePermission('config:write'), updateStateHandler);
router.delete('/states/:id', requirePermission('config:write'), deleteStateHandler);
router.post('/cities', requirePermission('config:write'), createCityHandler);
router.patch('/cities/:id', requirePermission('config:write'), updateCityHandler);
router.delete('/cities/:id', requirePermission('config:write'), deleteCityHandler);

// Admin Roles
router.get('/roles', requirePermission('admins:read'), listRolesHandler);
router.post('/roles', requirePermission('admins:write'), createRoleHandler);
router.patch('/roles/:id', requirePermission('admins:write'), updateRoleHandler);
router.delete('/roles/:id', requirePermission('admins:write'), deleteRoleHandler);

export default router;
