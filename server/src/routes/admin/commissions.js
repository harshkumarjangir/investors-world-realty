import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.js';
import prisma from '../../utils/prisma.js';
import { approvePropertyCommission, getPendingPropertyCommissions } from '../../services/propertyCommission.service.js';
import { successResponse, createdResponse, paginatedResponse, parsePagination, errorResponse } from '../../utils/response.js';
import { logAdminAction } from '../../middleware/auditLog.js';

const router = Router();

// ─── Commission Slabs CRUD ────────────────────────────────────────────────────

// GET /api/v1/admin/commissions/slabs
router.get('/slabs', requirePermission('config:read'), async (req, res, next) => {
  try {
    const slabs = await prisma.propertyCommissionSlab.findMany({ orderBy: { minArea: 'asc' } });
    return successResponse(res, slabs);
  } catch (e) { return next(e); }
});

// POST /api/v1/admin/commissions/slabs
router.post('/slabs', requirePermission('config:write'), async (req, res, next) => {
  try {
    const slab = await prisma.propertyCommissionSlab.create({ data: req.body });
    await logAdminAction(req.admin.id, 'CREATE_COMMISSION_SLAB', 'PropertyCommissionSlab', slab.id);
    return createdResponse(res, slab, 'Commission slab created');
  } catch (e) { return next(e); }
});

// PATCH /api/v1/admin/commissions/slabs/:id
router.patch('/slabs/:id', requirePermission('config:write'), async (req, res, next) => {
  try {
    const slab = await prisma.propertyCommissionSlab.update({ where: { id: req.params.id }, data: req.body });
    await logAdminAction(req.admin.id, 'UPDATE_COMMISSION_SLAB', 'PropertyCommissionSlab', slab.id);
    return successResponse(res, slab, 'Commission slab updated');
  } catch (e) { return next(e); }
});

// DELETE /api/v1/admin/commissions/slabs/:id
router.delete('/slabs/:id', requirePermission('config:write'), async (req, res, next) => {
  try {
    await prisma.propertyCommissionSlab.delete({ where: { id: req.params.id } });
    await logAdminAction(req.admin.id, 'DELETE_COMMISSION_SLAB', 'PropertyCommissionSlab', req.params.id);
    return successResponse(res, null, 'Commission slab deleted');
  } catch (e) { return next(e); }
});

// ─── Property Sale Commissions ────────────────────────────────────────────────

// GET /api/v1/admin/commissions/pending
router.get('/pending', requirePermission('payouts:read'), async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const result = await getPendingPropertyCommissions(pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
});

// GET /api/v1/admin/commissions/all
router.get('/all', requirePermission('payouts:read'), async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { status, associateId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (associateId) where.associateId = associateId;

    const [items, totalItems] = await Promise.all([
      prisma.propertySaleCommission.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      prisma.propertySaleCommission.count({ where }),
    ]);

    const RANK_NAMES = [
      '', 'Business Associate', 'Business Adviser', 'Business Head',
      'Dist. Business Head', 'State Business Head', 'Regional Business Head',
      'National Business Head', 'Vice President Sales', 'President Sales', 'President Club',
    ];

    const populated = await Promise.all(
      items.map(async (item) => {
        const assoc = await prisma.associate.findUnique({
          where: { id: item.associateId },
          select: { userId: true, name: true, rank: true },
        });
        return {
          ...item,
          associateCode: assoc?.userId || null,
          associateName: assoc?.name || null,
          associateRank: assoc?.rank || null,
          associateRankName: assoc ? (RANK_NAMES[assoc.rank] || 'Unknown') : null,
        };
      })
    );

    return paginatedResponse(res, populated, totalItems, pagination.page, pagination.pageSize);
  } catch (e) { return next(e); }
});

// POST /api/v1/admin/commissions/:id/approve
router.post('/:id/approve', requirePermission('payouts:write'), async (req, res, next) => {
  try {
    const result = await approvePropertyCommission(req.params.id, req.admin.id);
    return successResponse(res, result, 'Commission approved and credited to wallet');
  } catch (e) { return next(e); }
});

// POST /api/v1/admin/commissions/:id/reject
router.post('/:id/reject', requirePermission('payouts:write'), async (req, res, next) => {
  try {
    await prisma.propertySaleCommission.update({ where: { id: req.params.id }, data: { status: 'REJECTED' } });
    await logAdminAction(req.admin.id, 'REJECT_COMMISSION', 'PropertySaleCommission', req.params.id);
    return successResponse(res, null, 'Commission rejected');
  } catch (e) { return next(e); }
});

export default router;
