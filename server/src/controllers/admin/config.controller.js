import * as configService from '../../services/admin/config.service.js';
import { successResponse, createdResponse, errorResponse } from '../../utils/response.js';

// ─── Packages ─────────────────────────────────────────────────────────────────
export async function listPackagesHandler(req, res, next) {
  try { return successResponse(res, await configService.listPackages()); } catch (e) { return next(e); }
}
export async function createPackageHandler(req, res, next) {
  try { return createdResponse(res, await configService.createPackage(req.body), 'Package created'); } catch (e) { return next(e); }
}
export async function updatePackageHandler(req, res, next) {
  try { return successResponse(res, await configService.updatePackage(req.params.id, req.body), 'Package updated'); } catch (e) { return next(e); }
}
export async function deletePackageHandler(req, res, next) {
  try { await configService.deletePackage(req.params.id); return successResponse(res, null, 'Package deleted'); } catch (e) { return next(e); }
}

// ─── Income Plans ─────────────────────────────────────────────────────────────
export async function listIncomePlansHandler(req, res, next) {
  try { return successResponse(res, await configService.listIncomePlans()); } catch (e) { return next(e); }
}
export async function createIncomePlanHandler(req, res, next) {
  try { return createdResponse(res, await configService.createIncomePlan(req.body), 'Income plan created'); } catch (e) { return next(e); }
}
export async function updateIncomePlanHandler(req, res, next) {
  try { return successResponse(res, await configService.updateIncomePlan(req.params.id, req.body), 'Income plan updated'); } catch (e) { return next(e); }
}
export async function deleteIncomePlanHandler(req, res, next) {
  try { await configService.deleteIncomePlan(req.params.id); return successResponse(res, null, 'Income plan deleted'); } catch (e) { return next(e); }
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
