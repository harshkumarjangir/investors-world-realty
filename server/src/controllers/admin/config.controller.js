import * as configService from '../../services/admin/config.service.js';
import { successResponse, createdResponse, errorResponse } from '../../utils/response.js';


// ─── System Config ──────────────────────────────────────────────────────────────
export async function getSystemConfigHandler(req, res, next) {
  try { return successResponse(res, await configService.getSystemConfigs()); } catch (e) { return next(e); }
}
export async function upsertSystemConfigHandler(req, res, next) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ status: 'error', message: 'key and value are required' });
    const result = await configService.upsertSystemConfig(key, value);
    return successResponse(res, result, 'Config updated');
  } catch (e) { return next(e); }
}

// ─── Property Categories ──────────────────────────────────────────────────────
export async function listCategoriesHandler(req, res, next) {
  try { return successResponse(res, await configService.listPropertyCategories()); } catch (e) { return next(e); }
}
export async function createCategoryHandler(req, res, next) {
  try { return createdResponse(res, await configService.createPropertyCategory(req.body.name), 'Category created'); } catch (e) { return next(e); }
}
export async function updateCategoryHandler(req, res, next) {
  try { return successResponse(res, await configService.updatePropertyCategory(req.params.id, req.body.name), 'Category updated'); } catch (e) { return next(e); }
}
export async function deleteCategoryHandler(req, res, next) {
  try { await configService.deletePropertyCategory(req.params.id); return successResponse(res, null, 'Category deleted'); } catch (e) { return next(e); }
}

// ─── Geographic Data ──────────────────────────────────────────────────────────
export async function listStatesHandler(req, res, next) {
  try { return successResponse(res, await configService.listStates()); } catch (e) { return next(e); }
}
export async function createStateHandler(req, res, next) {
  try { return createdResponse(res, await configService.createState(req.body.name), 'State created'); } catch (e) { return next(e); }
}
export async function listCitiesHandler(req, res, next) {
  try { return successResponse(res, await configService.listCities(req.query.stateId)); } catch (e) { return next(e); }
}
export async function createCityHandler(req, res, next) {
  try { return createdResponse(res, await configService.createCity(req.body.name, req.body.stateId), 'City created'); } catch (e) { return next(e); }
}

// ─── Admin Roles ──────────────────────────────────────────────────────────────
export async function listRolesHandler(req, res, next) {
  try { return successResponse(res, await configService.listAdminRoles()); } catch (e) { return next(e); }
}
export async function createRoleHandler(req, res, next) {
  try { return createdResponse(res, await configService.createAdminRole(req.body.name, req.body.permissions), 'Role created'); } catch (e) { return next(e); }
}
export async function updateRoleHandler(req, res, next) {
  try { return successResponse(res, await configService.updateAdminRole(req.params.id, req.body), 'Role updated'); } catch (e) { return next(e); }
}
export async function deleteRoleHandler(req, res, next) {
  try { await configService.deleteAdminRole(req.params.id); return successResponse(res, null, 'Role deleted'); } catch (e) { return next(e); }
}

export async function updateStateHandler(req, res, next) {
  try { return successResponse(res, await configService.renameState(req.params.id, req.body.name), 'State updated'); } catch (e) { return next(e); }
}
export async function deleteStateHandler(req, res, next) {
  try { await configService.deleteState(req.params.id); return successResponse(res, null, 'State deleted'); } catch (e) { return next(e); }
}
export async function updateCityHandler(req, res, next) {
  try { return successResponse(res, await configService.renameCity(req.params.id, req.body.name), 'City updated'); } catch (e) { return next(e); }
}
export async function deleteCityHandler(req, res, next) {
  try { await configService.deleteCity(req.params.id); return successResponse(res, null, 'City deleted'); } catch (e) { return next(e); }
}
