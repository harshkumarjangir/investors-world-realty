import prisma from '../utils/prisma.js';

// ─── Get Profile ──────────────────────────────────────────────────────────────
export async function getProfile(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
    include: {
      sponsor: {
        select: { name: true, userId: true, phone: true, email: true },
      },
      treeNode: {
        select: { position: true, level: true },
      },
      package: {
        select: { id: true, name: true, price: true },
      },
      kycDocuments: {
        select: { type: true, status: true, documentNumber: true, createdAt: true, updatedAt: true },
      },
    },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  // Exclude sensitive fields
  const { password, failedAttempts, lockedUntil, deletedAt, ...safeAssociate } = associate;

  return safeAssociate;
}

// ─── Update Profile ───────────────────────────────────────────────────────────
const ALLOWED_UPDATE_FIELDS = ['phone', 'email', 'address', 'city', 'state', 'pincode'];

export async function updateProfile(associateId, data) {
  // Silently strip disallowed fields
  const updateData = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw Object.assign(new Error('No valid fields to update'), { statusCode: 400 });
  }

  // Validate uniqueness for phone/email if changed
  const current = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { phone: true, email: true },
  });

  if (!current) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  if (updateData.phone && updateData.phone !== current.phone) {
    const existing = await prisma.associate.findFirst({
      where: { phone: updateData.phone, deletedAt: null, id: { not: associateId } },
    });
    if (existing) {
      throw Object.assign(new Error('Phone number already in use'), { statusCode: 409 });
    }
  }

  if (updateData.email && updateData.email !== current.email) {
    const existing = await prisma.associate.findFirst({
      where: { email: updateData.email, deletedAt: null, id: { not: associateId } },
    });
    if (existing) {
      throw Object.assign(new Error('Email address already in use'), { statusCode: 409 });
    }
  }

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: updateData,
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      updatedAt: true,
    },
  });

  return updated;
}

// ─── Update Profile Photo ─────────────────────────────────────────────────────
export async function updateProfilePhoto(associateId, filePath) {
  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: { profilePhoto: filePath },
    select: { id: true, profilePhoto: true },
  });

  return { profilePhotoUrl: updated.profilePhoto };
}

// ─── Submit KYC ───────────────────────────────────────────────────────────────
export async function submitKYC(associateId, type, documentNumber, documentUrl) {
  const validTypes = ['PAN', 'AADHAAR', 'BANK'];
  if (!validTypes.includes(type)) {
    throw Object.assign(new Error(`Invalid KYC type. Must be one of: ${validTypes.join(', ')}`), { statusCode: 400 });
  }

  const doc = await prisma.kYCDocument.upsert({
    where: {
      associateId_type: { associateId, type },
    },
    update: {
      documentNumber,
      documentUrl,
      status: 'PENDING',
      rejectionReason: null,
      verifiedBy: null,
      verifiedAt: null,
    },
    create: {
      associateId,
      type,
      documentNumber,
      documentUrl,
      status: 'PENDING',
    },
  });

  return doc;
}
