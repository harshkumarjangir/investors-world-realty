import * as txService from '../../services/admin/transaction.service.js';
import { paginatedResponse, successResponse, parsePagination } from '../../utils/response.js';

export async function listTransactionsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const { startDate, endDate, type, associateId, status } = req.query;
    const result = await txService.listAllTransactions({ startDate, endDate, type, associateId, status }, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}

export async function getWalletTransactionsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const result = await txService.getWalletTransactions(req.params.associateId, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}

export async function listWithdrawalsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const { status, startDate, endDate } = req.query;
    const result = await txService.listWithdrawalRequests({ status, startDate, endDate }, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}

export async function approveWithdrawalHandler(req, res, next) {
  try {
    const result = await txService.approveWithdrawal(req.params.id, req.admin.id);
    return successResponse(res, result, 'Withdrawal approved');
  } catch (e) { return next(e); }
}

export async function rejectWithdrawalHandler(req, res, next) {
  try {
    const result = await txService.rejectWithdrawal(req.params.id, req.body.reason, req.admin.id);
    return successResponse(res, result, 'Withdrawal rejected');
  } catch (e) { return next(e); }
}
