import {
  adminListAssociates,
  adminGetAssociate,
  adminRegisterAssociate,
  adminEditAssociate,
  adminActivateAssociate,
  adminSuspendAssociate,
  adminDeleteAssociate,
} from '../../services/admin/associate.service.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  parsePagination,
} from '../../utils/response.js';

export async function listAssociatesHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const filters = {
      status: req.query.status || undefined,
      search: req.query.search || undefined,
    };
    const { items, totalItems, page, pageSize } = await adminListAssociates(filters, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Associates retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function getAssociateHandler(req, res, next) {
  try {
    const data = await adminGetAssociate(req.params.id);
    return successResponse(res, data, 'Associate retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function registerAssociateHandler(req, res, next) {
  try {
    const data = await adminRegisterAssociate(req.body, req.admin.id);
    return createdResponse(res, data, 'Associate registered successfully');
  } catch (err) {
    return next(err);
  }
}

export async function editAssociateHandler(req, res, next) {
  try {
    const data = await adminEditAssociate(req.params.id, req.body, req.admin.id);
    return successResponse(res, data, 'Associate updated successfully');
  } catch (err) {
    return next(err);
  }
}

export async function activateAssociateHandler(req, res, next) {
  try {
    const { packageId } = req.body;
    const data = await adminActivateAssociate(req.params.id, packageId, req.admin.id);
    return successResponse(res, data, 'Associate activated successfully');
  } catch (err) {
    return next(err);
  }
}

export async function suspendAssociateHandler(req, res, next) {
  try {
    const data = await adminSuspendAssociate(req.params.id, req.admin.id);
    return successResponse(res, data, 'Associate suspended successfully');
  } catch (err) {
    return next(err);
  }
}

export async function deleteAssociateHandler(req, res, next) {
  try {
    const data = await adminDeleteAssociate(req.params.id, req.admin.id);
    return successResponse(res, data, 'Associate deleted successfully');
  } catch (err) {
    return next(err);
  }
}
