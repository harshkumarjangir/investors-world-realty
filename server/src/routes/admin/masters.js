import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import {
  listAccountMastersHandler, createAccountMasterHandler, updateAccountMasterHandler, deleteAccountMasterHandler,
  listSchemesHandler, getSchemeHandler, createSchemeHandler, updateSchemeHandler, deleteSchemeHandler,
  upsertSchemeImagesHandler,
  listPlcChargesHandler, createPlcChargeHandler, updatePlcChargeHandler, deletePlcChargeHandler,
  listPlotTypesHandler, createPlotTypeHandler, updatePlotTypeHandler, deletePlotTypeHandler,
} from '../../controllers/admin/masters.controller.js';

const router = Router();
const perm = requirePermission('config:read');
const permW = requirePermission('config:write');

// Account Master
router.get('/accounts', perm, listAccountMastersHandler);
router.post('/accounts', permW, createAccountMasterHandler);
router.put('/accounts/:id', permW, updateAccountMasterHandler);
router.delete('/accounts/:id', permW, deleteAccountMasterHandler);

// Schemes
router.get('/schemes', perm, listSchemesHandler);
router.get('/schemes/:id', perm, getSchemeHandler);
router.post('/schemes', permW, createSchemeHandler);
router.put('/schemes/:id', permW, updateSchemeHandler);
router.delete('/schemes/:id', permW, deleteSchemeHandler);
router.put('/schemes/:id/images', permW, upsertSchemeImagesHandler);

// Plc Charges
router.get('/plc-charges', perm, listPlcChargesHandler);
router.post('/plc-charges', permW, createPlcChargeHandler);
router.put('/plc-charges/:id', permW, updatePlcChargeHandler);
router.delete('/plc-charges/:id', permW, deletePlcChargeHandler);

// Plot Types
router.get('/plot-types', perm, listPlotTypesHandler);
router.post('/plot-types', permW, createPlotTypeHandler);
router.put('/plot-types/:id', permW, updatePlotTypeHandler);
router.delete('/plot-types/:id', permW, deletePlotTypeHandler);

export default router;
