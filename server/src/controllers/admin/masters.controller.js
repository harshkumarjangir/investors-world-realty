import * as svc from '../../services/admin/masters.service.js';
import { successResponse, paginatedResponse, parsePagination } from '../../utils/response.js';

// ─── Account Master ───────────────────────────────────────────────────────────
export async function listAccountMastersHandler(req, res, next) {
  try {
    const result = await svc.listAccountMasters(parsePagination(req.query));
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}
export async function createAccountMasterHandler(req, res, next) {
  try {
    const result = await svc.createAccountMaster(req.body);
    return successResponse(res, result, 'Account master created', 201);
  } catch (e) { return next(e); }
}
export async function updateAccountMasterHandler(req, res, next) {
  try {
    const result = await svc.updateAccountMaster(req.params.id, req.body);
    return successResponse(res, result, 'Account master updated');
  } catch (e) { return next(e); }
}
export async function deleteAccountMasterHandler(req, res, next) {
  try {
    await svc.deleteAccountMaster(req.params.id);
    return successResponse(res, null, 'Deleted');
  } catch (e) { return next(e); }
}

// ─── Schemes ──────────────────────────────────────────────────────────────────
export async function listSchemesHandler(req, res, next) {
  try {
    const result = await svc.listSchemes(parsePagination(req.query));
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}
export async function getSchemeHandler(req, res, next) {
  try {
    const result = await svc.getSchemeById(req.params.id);
    return successResponse(res, result);
  } catch (e) { return next(e); }
}
export async function createSchemeHandler(req, res, next) {
  try {
    const result = await svc.createScheme(req.body);
    return successResponse(res, result, 'Scheme created', 201);
  } catch (e) { return next(e); }
}
export async function updateSchemeHandler(req, res, next) {
  try {
    const result = await svc.updateScheme(req.params.id, req.body);
    return successResponse(res, result, 'Scheme updated');
  } catch (e) { return next(e); }
}
export async function deleteSchemeHandler(req, res, next) {
  try {
    await svc.deleteScheme(req.params.id);
    return successResponse(res, null, 'Scheme deleted');
  } catch (e) { return next(e); }
}

// ─── Scheme Images ────────────────────────────────────────────────────────────
export async function upsertSchemeImagesHandler(req, res, next) {
  try {
    const result = await svc.upsertSchemeImages(req.params.id, req.body.images || []);
    return successResponse(res, result, 'Images updated');
  } catch (e) { return next(e); }
}

// ─── Plc Charges ─────────────────────────────────────────────────────────────
export async function listPlcChargesHandler(req, res, next) {
  try {
    const result = await svc.listPlcCharges(parsePagination(req.query));
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}
export async function createPlcChargeHandler(req, res, next) {
  try {
    const result = await svc.createPlcCharge(req.body);
    return successResponse(res, result, 'Plc charge created', 201);
  } catch (e) { return next(e); }
}
export async function updatePlcChargeHandler(req, res, next) {
  try {
    const result = await svc.updatePlcCharge(req.params.id, req.body);
    return successResponse(res, result, 'Plc charge updated');
  } catch (e) { return next(e); }
}
export async function deletePlcChargeHandler(req, res, next) {
  try {
    await svc.deletePlcCharge(req.params.id);
    return successResponse(res, null, 'Deleted');
  } catch (e) { return next(e); }
}

// ─── Plot Types ───────────────────────────────────────────────────────────────
export async function listPlotTypesHandler(req, res, next) {
  try {
    const result = await svc.listPlotTypes(parsePagination(req.query));
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}
export async function createPlotTypeHandler(req, res, next) {
  try {
    const result = await svc.createPlotType(req.body);
    return successResponse(res, result, 'Plot type created', 201);
  } catch (e) { return next(e); }
}
export async function updatePlotTypeHandler(req, res, next) {
  try {
    const result = await svc.updatePlotType(req.params.id, req.body);
    return successResponse(res, result, 'Plot type updated');
  } catch (e) { return next(e); }
}
export async function deletePlotTypeHandler(req, res, next) {
  try {
    await svc.deletePlotType(req.params.id);
    return successResponse(res, null, 'Deleted');
  } catch (e) { return next(e); }
}

// ─── Plots ────────────────────────────────────────────────────────────────────
export async function listPlotsHandler(req, res, next) {
  try {
    const { schemeId } = req.query;
    const result = await svc.listPlots({ schemeId }, parsePagination(req.query));
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}
export async function createPlotHandler(req, res, next) {
  try {
    const result = await svc.createPlot(req.body);
    return successResponse(res, result, 'Plot created', 201);
  } catch (e) { return next(e); }
}
export async function updatePlotHandler(req, res, next) {
  try {
    const result = await svc.updatePlot(req.params.id, req.body);
    return successResponse(res, result, 'Plot updated');
  } catch (e) { return next(e); }
}
export async function deletePlotHandler(req, res, next) {
  try {
    await svc.deletePlot(req.params.id);
    return successResponse(res, null, 'Deleted');
  } catch (e) { return next(e); }
}
