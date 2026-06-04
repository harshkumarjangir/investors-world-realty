import {
  validateSponsor,
  registerAssociate,
  activateAssociate,
} from '../services/registration.service.js';
import { successResponse, createdResponse } from '../utils/response.js';
import prisma from '../utils/prisma.js';

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
      rank: sponsor.rank,
    }, 'Sponsor is valid');
  } catch (err) {
    return next(err);
  }
}

// ─── POST /register ───────────────────────────────────────────────────────────
export async function registerHandler(req, res, next) {
  try {
    const associate = await registerAssociate(req.body);

    // Log new registration
    console.log(`[NEW REGISTRATION] ${associate.userId} — ${associate.name} | phone: ${associate.phone} | email: ${associate.email} | sponsor: ${req.body.sponsorId || 'none'}`);

    // Send registration confirmation email (non-blocking)
    try {
      const { sendRegistrationEmail } = await import('../utils/email.js');
      await sendRegistrationEmail(associate.email, {
        name:      associate.name,
        userId:    associate.userId,
        sponsorId: req.body.sponsorId || null,
      });
    } catch (emailErr) {
      console.error('[REGISTRATION EMAIL] Failed:', emailErr.message);
    }

    return createdResponse(res, {
      id:        associate.id,
      userId:    associate.userId,
      name:      associate.name,
      email:     associate.email,
      phone:     associate.phone,
      status:    associate.status,
      sponsorId: req.body.sponsorId || null,
    }, 'Registration successful. Your account is pending admin approval. Check your email for your User ID.');
  } catch (err) {
    return next(err);
  }
}

// ─── POST /activate ───────────────────────────────────────────────────────────
export async function activateHandler(req, res, next) {
  try {
    const { associateId } = req.body;
    const updated = await activateAssociate(associateId);

    // Send activation email (non-blocking)
    try {
      const { sendActivationEmail } = await import('../utils/email.js');
      await sendActivationEmail(updated.email, {
        name:   updated.name,
        userId: updated.userId,
      });
    } catch (emailErr) {
      console.error('[ACTIVATION EMAIL] Failed:', emailErr.message);
    }

    return successResponse(res, {
      id:             updated.id,
      userId:         updated.userId,
      name:           updated.name,
      status:         updated.status,
      activationDate: updated.activationDate,
    }, 'Associate activated successfully');
  } catch (err) {
    return next(err);
  }
}

// ─── POST /request-delete ─────────────────────────────────────────────────────
export async function requestDeleteHandler(req, res, next) {
  try {
    const associateId = req.associate.id;

    // Mark as pending deletion (admin will approve)
    await prisma.associate.update({
      where: { id: associateId },
      data: { status: 'SUSPENDED' }, // Use SUSPENDED as pending-delete marker
    });

    return successResponse(res, null, 'Account deletion request submitted. Admin will review and process.');
  } catch (err) {
    return next(err);
  }
}
