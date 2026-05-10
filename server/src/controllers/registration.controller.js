import {
  validateSponsor,
  registerAssociate,
  activateAssociate,
} from '../services/registration.service.js';
import { successResponse, createdResponse } from '../utils/response.js';

// ─── GET /validate-sponsor?sponsorId=IW100001 ─────────────────────────────────
export async function validateSponsorHandler(req, res, next) {
  try {
    const { sponsorId } = req.query;

    if (!sponsorId) {
      return res.status(400).json({ status: 'error', message: 'sponsorId query param is required', data: null });
    }

    const sponsor = await validateSponsor(sponsorId);

    return successResponse(res, {
      id: sponsor.id,
      userId: sponsor.userId,
      name: sponsor.name,
      status: sponsor.status,
    }, 'Sponsor is valid');
  } catch (err) {
    return next(err);
  }
}

// ─── POST /register ───────────────────────────────────────────────────────────
export async function registerHandler(req, res, next) {
  try {
    const associate = await registerAssociate(req.body);

    return createdResponse(res, {
      id: associate.id,
      userId: associate.userId,
      name: associate.name,
      email: associate.email,
      phone: associate.phone,
      status: associate.status,
    }, 'Registration successful. Account is pending activation.');
  } catch (err) {
    return next(err);
  }
}

// ─── POST /activate ───────────────────────────────────────────────────────────
export async function activateHandler(req, res, next) {
  try {
    const { associateId, packageId } = req.body;
    const updated = await activateAssociate(associateId, packageId);

    return successResponse(res, {
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      status: updated.status,
      activationDate: updated.activationDate,
      package: updated.package
        ? { id: updated.package.id, name: updated.package.name }
        : null,
    }, 'Associate activated successfully');
  } catch (err) {
    return next(err);
  }
}
