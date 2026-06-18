import {
  adminListAssociates,
  adminGetAssociate,
  adminRegisterAssociate,
  adminEditAssociate,
  adminActivateAssociate,
  adminSuspendAssociate,
  adminUnsuspendAssociate,
  adminDeleteAssociate,
  adminListDeletionRequests,
  adminRejectDeletionRequest,
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
      status:        req.query.status        || undefined,
      search:        req.query.search        || undefined,
      rank:          req.query.rank          || undefined,
      city:          req.query.city          || undefined,
      state:         req.query.state         || undefined,
      phone:         req.query.phone         || undefined,
      panNumber:     req.query.panNumber     || undefined,
      sponsorUserId: req.query.sponsorUserId || undefined,
      fromDate:      req.query.fromDate      || undefined,
      toDate:        req.query.toDate        || undefined,
      approveFrom:   req.query.approveFrom   || undefined,
      approveTo:     req.query.approveTo     || undefined,
      dobFrom:       req.query.dobFrom       || undefined,
      dobTo:         req.query.dobTo         || undefined,
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
    const data = await adminActivateAssociate(req.params.id, null, req.admin.id);

    // Send activation email (non-blocking)
    try {
      const { sendActivationEmail } = await import('../../utils/email.js');
      if (data.email) {
        await sendActivationEmail(data.email, { name: data.name, userId: data.userId });
      } else {
        // Fetch email if not in returned data
        const { default: prisma } = await import('../../utils/prisma.js');
        const assoc = await prisma.associate.findUnique({ where: { id: req.params.id }, select: { email: true, name: true, userId: true } });
        if (assoc) await sendActivationEmail(assoc.email, { name: assoc.name, userId: assoc.userId });
      }
    } catch (emailErr) {
      console.error('[ACTIVATION EMAIL] Failed:', emailErr.message);
    }

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

export async function unsuspendAssociateHandler(req, res, next) {
  try {
    const data = await adminUnsuspendAssociate(req.params.id, req.admin.id);
    return successResponse(res, data, 'Associate re-activated successfully');
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

export async function listDeletionRequestsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const { items, totalItems, page, pageSize } = await adminListDeletionRequests(pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Deletion requests retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function rejectDeletionHandler(req, res, next) {
  try {
    const data = await adminRejectDeletionRequest(req.params.id, req.admin.id);
    return successResponse(res, data, 'Deletion request rejected successfully');
  } catch (err) {
    return next(err);
  }
}
