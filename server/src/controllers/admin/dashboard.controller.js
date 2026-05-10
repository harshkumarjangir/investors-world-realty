import { getAdminDashboard, getRecentTransactions } from '../../services/admin/dashboard.service.js';
import { successResponse } from '../../utils/response.js';

export async function getAdminDashboardHandler(req, res, next) {
  try {
    const data = await getAdminDashboard();
    return successResponse(res, data, 'Admin dashboard data retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function getRecentTransactionsHandler(req, res, next) {
  try {
    const data = await getRecentTransactions();
    return successResponse(res, data, 'Recent transactions retrieved');
  } catch (err) {
    return next(err);
  }
}
