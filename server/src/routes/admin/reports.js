import { Router } from 'express';
import { authenticateAdmin, requirePermission } from '../../middleware/auth.js';
import {
  getJoiningReportHandler,
  getActivationReportHandler,
  getIncomeReportHandler,
  getWithdrawalReportHandler,
  getFundTransferReportHandler,
  getUserWiseReportHandler,
} from '../../controllers/admin/report.controller.js';
import {
  exportExcelHandler,
  exportPdfHandler,
} from '../../controllers/admin/reportExport.controller.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/v1/admin/reports/joining
router.get('/joining', requirePermission('reports:read'), getJoiningReportHandler);

// GET /api/v1/admin/reports/activation
router.get('/activation', requirePermission('reports:read'), getActivationReportHandler);

// GET /api/v1/admin/reports/income
router.get('/income', requirePermission('reports:read'), getIncomeReportHandler);

// GET /api/v1/admin/reports/withdrawal
router.get('/withdrawal', requirePermission('reports:read'), getWithdrawalReportHandler);

// GET /api/v1/admin/reports/fund-transfer
router.get('/fund-transfer', requirePermission('reports:read'), getFundTransferReportHandler);

// GET /api/v1/admin/reports/user/:associateId
router.get('/user/:associateId', requirePermission('reports:read'), getUserWiseReportHandler);

// GET /api/v1/admin/reports/rank-achievers?rank=2
router.get('/rank-achievers', requirePermission('reports:read'), async (req, res, next) => {
  try {
    const { getRankAchieversReport } = await import('../../services/admin/report.service.js');
    const { parsePagination, paginatedResponse } = await import('../../utils/response.js');
    const { rank } = req.query;
    if (!rank) {
      return res.status(400).json({ status: 'error', message: 'rank query param is required', data: null });
    }
    const pagination = parsePagination(req.query);
    const result = await getRankAchieversReport(parseInt(rank, 10), pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Rank achievers report');
  } catch (err) {
    return next(err);
  }
});

// ─── Export Endpoints ─────────────────────────────────────────────────────────
// GET /api/v1/admin/reports/export/excel/:reportType
router.get('/export/excel/:reportType', requirePermission('reports:read'), exportExcelHandler);

// GET /api/v1/admin/reports/export/pdf/:reportType
router.get('/export/pdf/:reportType', requirePermission('reports:read'), exportPdfHandler);

export default router;
