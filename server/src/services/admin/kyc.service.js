import prisma from '../../utils/prisma.js';
import { logAdminAction } from '../../middleware/auditLog.js';
import { sendNotificationToAssociate } from '../notification.service.js';

// ─── getPendingKYC ────────────────────────────────────────────────────────────

/**
 * Return paginated KYCDocuments with status PENDING.
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getPendingKYC(pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = { status: 'PENDING' };

  const [records, totalItems] = await Promise.all([
    prisma.kYCDocument.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip,
      take,
      select: {
        id: true,
        type: true,
        documentNumber: true,
        documentUrl: true,
        status: true,
        createdAt: true,
        associate: { select: { id: true, userId: true, name: true, profilePhoto: true, phone: true } },
      },
    }),
    prisma.kYCDocument.count({ where }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    type: r.type,
    documentNumber: r.documentNumber,
    documentUrl: r.documentUrl,
    status: r.status,
    createdAt: r.createdAt,
    associateId: r.associate.id,
    userId: r.associate.userId,
    associateName: r.associate.name,
    name: r.associate.name,
    profilePhoto: r.associate.profilePhoto,
    phone: r.associate.phone,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── getKYCByStatus ───────────────────────────────────────────────────────────

export async function getKYCByStatus(status, pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = { status: status || 'APPROVED' };

  const [records, totalItems] = await Promise.all([
    prisma.kYCDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        type: true,
        documentNumber: true,
        documentUrl: true,
        status: true,
        rejectionReason: true,
        verifiedAt: true,
        createdAt: true,
        associate: { select: { id: true, userId: true, name: true, profilePhoto: true, phone: true } },
      },
    }),
    prisma.kYCDocument.count({ where }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    type: r.type,
    documentNumber: r.documentNumber,
    documentUrl: r.documentUrl,
    status: r.status,
    rejectionReason: r.rejectionReason,
    verifiedAt: r.verifiedAt,
    createdAt: r.createdAt,
    associateId: r.associate.id,
    userId: r.associate.userId,
    associateName: r.associate.name,
    name: r.associate.name,
    profilePhoto: r.associate.profilePhoto,
    phone: r.associate.phone,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── approveKYC ───────────────────────────────────────────────────────────────

/**
 * Approve a KYC document.
 * @param {string} kycId
 * @param {string} adminId
 * @returns {Promise<object>} Updated KYCDocument record
 */
export async function approveKYC(kycId, adminId) {
  const kyc = await prisma.kYCDocument.findUnique({
    where: { id: kycId },
    select: { id: true, status: true, associateId: true, type: true },
  });

  if (!kyc) {
    throw Object.assign(new Error('KYC document not found'), { statusCode: 404 });
  }

  if (kyc.status !== 'PENDING') {
    throw Object.assign(new Error(`KYC document is already ${kyc.status.toLowerCase()}`), { statusCode: 400 });
  }

  const updated = await prisma.kYCDocument.update({
    where: { id: kycId },
    data: {
      status: 'APPROVED',
      verifiedBy: adminId,
      verifiedAt: new Date(),
    },
  });

  // Send push notification to associate
  sendNotificationToAssociate(
    kyc.associateId,
    'KYC Approved',
    `Your ${kyc.type} document has been approved.`,
    'KYC',
    { kycId, type: kyc.type, status: 'APPROVED' },
  ).catch((err) => {
    console.error('[KYC] Notification failed:', err.message);
  });

  await logAdminAction(adminId, 'APPROVE_KYC', 'KYCDocument', kycId, { type: kyc.type });

  return updated;
}

// ─── rejectKYC ────────────────────────────────────────────────────────────────

/**
 * Reject a KYC document with a reason.
 * @param {string} kycId
 * @param {string} reason
 * @param {string} adminId
 * @returns {Promise<object>} Updated KYCDocument record
 */
export async function rejectKYC(kycId, reason, adminId) {
  if (!reason || !reason.trim()) {
    throw Object.assign(new Error('Rejection reason is required'), { statusCode: 400 });
  }

  const kyc = await prisma.kYCDocument.findUnique({
    where: { id: kycId },
    select: { id: true, status: true, associateId: true, type: true },
  });

  if (!kyc) {
    throw Object.assign(new Error('KYC document not found'), { statusCode: 404 });
  }

  if (kyc.status !== 'PENDING') {
    throw Object.assign(new Error(`KYC document is already ${kyc.status.toLowerCase()}`), { statusCode: 400 });
  }

  const updated = await prisma.kYCDocument.update({
    where: { id: kycId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason,
    },
  });

  // Send push notification to associate
  sendNotificationToAssociate(
    kyc.associateId,
    'KYC Rejected',
    `Your ${kyc.type} document was rejected. Reason: ${reason}`,
    'KYC',
    { kycId, type: kyc.type, status: 'REJECTED', reason },
  ).catch((err) => {
    console.error('[KYC] Notification failed:', err.message);
  });

  await logAdminAction(adminId, 'REJECT_KYC', 'KYCDocument', kycId, { type: kyc.type, reason });

  return updated;
}

// ─── getAssociateKYC ──────────────────────────────────────────────────────────

/**
 * Return all KYCDocuments for an associate.
 * @param {string} associateId
 * @returns {Promise<Array>} KYCDocument records
 */
export async function getAssociateKYC(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { id: true },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const documents = await prisma.kYCDocument.findMany({
    where: { associateId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      documentNumber: true,
      documentUrl: true,
      status: true,
      rejectionReason: true,
      verifiedBy: true,
      verifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return documents;
}
