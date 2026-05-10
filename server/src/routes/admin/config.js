import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listPackagesHandler, createPackageHandler, updatePackageHandler, deletePackageHandler,
  listIncomePlansHandler, createIncomePlanHandler, updateIncomePlanHandler, deleteIncomePlanHandler,
  listCategoriesHandler, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler,
  listStatesHandler, createStateHandler, listCitiesHandler, createCityHandler,
  listRolesHandler, createRoleHandler, updateRoleHandler, deleteRoleHandler,
} from '../../controllers/admin/config.controller.js';

const router = Router();

// Packages
router.get('/packages', requirePermission('config:read'), listPackagesHandler);
router.post('/packages', requirePermission('config:write'), createPackageHandler);
router.patch('/packages/:id', requirePermission('config:write'), updatePackageHandler);
router.delete('/packages/:id', requirePermission('config:write'), deletePackageHandler);

// Income Plans
router.get('/income-plans', requirePermission('config:read'), listIncomePlansHandler);
router.post('/income-plans', requirePermission('config:write'), createIncomePlanHandler);
router.patch('/income-plans/:id', requirePermission('config:write'), updateIncomePlanHandler);
router.delete('/income-plans/:id', requirePermission('config:write'), deleteIncomePlanHandler);

// Property Categories
router.get('/categories', requirePermission('config:read'), listCategoriesHandler);
router.post('/categories', requirePermission('config:write'), createCategoryHandler);
router.patch('/categories/:id', requirePermission('config:write'), updateCategoryHandler);
router.delete('/categories/:id', requirePermission('config:write'), deleteCategoryHandler);

// Geographic Data
router.get('/states', requirePermission('config:read'), listStatesHandler);
router.post('/states', requirePermission('config:write'), createStateHandler);
router.get('/cities', requirePermission('config:read'), listCitiesHandler);
router.post('/cities', requirePermission('config:write'), createCityHandler);

// Admin Roles
router.get('/roles', requirePermission('admins:read'), listRolesHandler);
router.post('/roles', requirePermission('admins:write'), createRoleHandler);
router.patch('/roles/:id', requirePermission('admins:write'), updateRoleHandler);
router.delete('/roles/:id', requirePermission('admins:write'), deleteRoleHandler);

export default router;
