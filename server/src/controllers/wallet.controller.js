import {
  getBalance,
  transfer,
  getTransactions,
  requestWithdrawal,
  getWithdrawals,
} from '../services/wallet.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '../utils/response.js';

// ─── GET /balance ─────────────────────────────────────────────────────────────
export async function getBalanceHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const data = await getBalance(associateId);
    return successResponse(res, data, 'Wallet balance fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /dashboard ───────────────────────────────────────────────────────────
import { getWalletDashboard } from '../services/wallet.service.js';

export async function getWalletDashboardHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const data = await getWalletDashboard(associateId);
    return successResponse(res, data, 'Wallet dashboard fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /all-activity ────────────────────────────────────────────────────────
import { getAllActivity } from '../services/wallet.service.js';

export async function getAllActivityHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const pagination = parsePagination(req.query);

    const { items, totalItems, page, pageSize } = await getAllActivity(associateId, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'All activity fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── POST /transfer ───────────────────────────────────────────────────────────
export async function transferHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const { recipientUserId, amount, description } = req.body;

    if (!recipientUserId) {
      return errorResponse(res, 'recipientUserId is required', 400);
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return errorResponse(res, 'amount must be a positive number', 400);
    }

    const result = await transfer(associateId, recipientUserId, parsedAmount, description);
    return successResponse(res, result, 'Transfer completed successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /transactions ────────────────────────────────────────────────────────
export async function getTransactionsHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const pagination = parsePagination(req.query);

    const { items, totalItems, page, pageSize } = await getTransactions(associateId, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Transactions fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── POST /withdraw ───────────────────────────────────────────────────────────
export async function requestWithdrawalHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const { amount } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return errorResponse(res, 'amount must be a positive number', 400);
    }

    const request = await requestWithdrawal(associateId, parsedAmount);
    return createdResponse(res, request, 'Withdrawal request submitted successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /withdrawals ─────────────────────────────────────────────────────────
export async function getWithdrawalsHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const pagination = parsePagination(req.query);

    const { items, totalItems, page, pageSize } = await getWithdrawals(associateId, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Withdrawal requests fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}
