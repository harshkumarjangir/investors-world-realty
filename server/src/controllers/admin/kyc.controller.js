import {
  getPendingKYC,
  getKYCByStatus,
  approveKYC,
  rejectKYC,
  getAssociateKYC,
} from '../../services/admin/kyc.service.js';
import { successResponse, paginatedResponse, parsePagination } from '../../utils/response.js';

export async function getPendingKYCHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const result = await getPendingKYC(pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Pending KYC documents');
  } catch (err) {
    return next(err);
  }
}

export async function getKYCByStatusHandler(req, res, next) {
  try {
    const { status } = req.query;
    const pagination = parsePagination(req.query);
    const result = await getKYCByStatus(status, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, `${status} KYC documents`);
  } catch (err) {
    return next(err);
  }
}

export async function approveKYCHandler(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const updated = await approveKYC(id, adminId);
    return successResponse(res, updated, 'KYC document approved successfully');
  } catch (err) {
    return next(err);
  }
}

export async function rejectKYCHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;

    if (!reason) {
      return res.status(400).json({ status: 'error', message: 'reason is required', data: null });
    }

    const updated = await rejectKYC(id, reason, adminId);
    return successResponse(res, updated, 'KYC document rejected');
  } catch (err) {
    return next(err);
  }
}

export async function getAssociateKYCHandler(req, res, next) {
  try {
    const { associateId } = req.params;
    const documents = await getAssociateKYC(associateId);
    return successResponse(res, documents, 'Associate KYC documents');
  } catch (err) {
    return next(err);
  }
}
