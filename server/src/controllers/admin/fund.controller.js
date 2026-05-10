import {
  adminCreditWallet,
  adminDebitWallet,
  adminTransferBetweenWallets,
  getAdminFundLogs,
} from '../../services/admin/fund.service.js';
import { successResponse, paginatedResponse, parsePagination } from '../../utils/response.js';

export async function creditWalletHandler(req, res, next) {
  try {
    const { associateId, amount, reason } = req.body;
    const adminId = req.admin.id;

    if (!associateId || !amount || !reason) {
      return res.status(400).json({ status: 'error', message: 'associateId, amount, and reason are required', data: null });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Amount must be greater than 0', data: null });
    }

    const transaction = await adminCreditWallet(associateId, Number(amount), reason, adminId);
    return successResponse(res, transaction, 'Wallet credited successfully');
  } catch (err) {
    return next(err);
  }
}

export async function debitWalletHandler(req, res, next) {
  try {
    const { associateId, amount, reason } = req.body;
    const adminId = req.admin.id;

    if (!associateId || !amount || !reason) {
      return res.status(400).json({ status: 'error', message: 'associateId, amount, and reason are required', data: null });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Amount must be greater than 0', data: null });
    }

    const transaction = await adminDebitWallet(associateId, Number(amount), reason, adminId);
    return successResponse(res, transaction, 'Wallet debited successfully');
  } catch (err) {
    return next(err);
  }
}

export async function transferWalletHandler(req, res, next) {
  try {
    const { fromAssociateId, toAssociateId, amount, reason } = req.body;
    const adminId = req.admin.id;

    if (!fromAssociateId || !toAssociateId || !amount || !reason) {
      return res.status(400).json({ status: 'error', message: 'fromAssociateId, toAssociateId, amount, and reason are required', data: null });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Amount must be greater than 0', data: null });
    }

    const result = await adminTransferBetweenWallets(fromAssociateId, toAssociateId, Number(amount), reason, adminId);
    return successResponse(res, result, 'Transfer completed successfully');
  } catch (err) {
    return next(err);
  }
}

export async function getFundLogsHandler(req, res, next) {
  try {
    const { associateId, startDate, endDate } = req.query;
    const pagination = parsePagination(req.query);
    const result = await getAdminFundLogs({ associateId, startDate, endDate }, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Fund logs');
  } catch (err) {
    return next(err);
  }
}
