import {
  getJoiningReport,
  getActivationReport,
  getIncomeReport,
  getWithdrawalReport,
  getFundTransferReport,
  getUserWiseReport,
} from '../../services/admin/report.service.js';
import { paginatedResponse, successResponse } from '../../utils/response.js';
import { parsePagination } from '../../utils/response.js';

export async function getJoiningReportHandler(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const pagination = parsePagination(req.query);
    const result = await getJoiningReport(startDate, endDate, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Joining report');
  } catch (err) {
    return next(err);
  }
}

export async function getActivationReportHandler(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const pagination = parsePagination(req.query);
    const result = await getActivationReport(startDate, endDate, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Activation report');
  } catch (err) {
    return next(err);
  }
}

export async function getIncomeReportHandler(req, res, next) {
  try {
    const { type, startDate, endDate } = req.query;
    const pagination = parsePagination(req.query);
    const result = await getIncomeReport(type, startDate, endDate, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Income report');
  } catch (err) {
    return next(err);
  }
}

export async function getWithdrawalReportHandler(req, res, next) {
  try {
    const { status, startDate, endDate } = req.query;
    const pagination = parsePagination(req.query);
    const result = await getWithdrawalReport(status, startDate, endDate, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Withdrawal report');
  } catch (err) {
    return next(err);
  }
}

export async function getFundTransferReportHandler(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const pagination = parsePagination(req.query);
    const result = await getFundTransferReport(startDate, endDate, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Fund transfer report');
  } catch (err) {
    return next(err);
  }
}

export async function getUserWiseReportHandler(req, res, next) {
  try {
    const { associateId } = req.params;
    const result = await getUserWiseReport(associateId);
    return successResponse(res, result, 'User-wise report');
  } catch (err) {
    return next(err);
  }
}
