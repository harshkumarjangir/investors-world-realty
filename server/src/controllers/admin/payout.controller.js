import {
  generatePayouts,
  getPendingPayouts,
  approvePayout,
  rejectPayout,
  getPayoutReports,
} from '../../services/admin/payout.service.js';
import {
  successResponse,
  paginatedResponse,
  parsePagination,
} from '../../utils/response.js';

export async function generatePayoutsHandler(req, res, next) {
  try {
    const data = await generatePayouts(req.admin.id);
    return successResponse(res, data, `${data.count} payout(s) generated successfully`);
  } catch (err) {
    return next(err);
  }
}

export async function getPendingPayoutsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const { items, totalItems, page, pageSize } = await getPendingPayouts(pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Pending payouts retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function approvePayoutHandler(req, res, next) {
  try {
    const data = await approvePayout(req.params.id, req.admin.id);
    return successResponse(res, data, 'Payout approved successfully');
  } catch (err) {
    return next(err);
  }
}

export async function rejectPayoutHandler(req, res, next) {
  try {
    const { reason } = req.body;
    const data = await rejectPayout(req.params.id, reason, req.admin.id);
    return successResponse(res, data, 'Payout rejected successfully');
  } catch (err) {
    return next(err);
  }
}

export async function getPayoutReportsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const filters = {
      startDate: req.query.startDate || undefined,
      endDate: req.query.endDate || undefined,
      type: req.query.type || undefined,
      associateId: req.query.associateId || undefined,
    };
    const { items, totalItems, page, pageSize } = await getPayoutReports(filters, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Payout reports retrieved');
  } catch (err) {
    return next(err);
  }
}
