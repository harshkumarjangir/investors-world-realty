import prisma from '../utils/prisma.js';
import { parseDateString } from '../utils/dateUtils.js';

const RANK_NAMES = [
  '', 'Business Associate', 'Business Adviser', 'Business Head',
  'Dist. Business Head', 'State Business Head', 'Regional Business Head',
  'National Business Head', 'Vice President Sales', 'President Sales', 'President Club',
];

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
      kycDocuments: {
        select: {
          type: true, status: true, documentNumber: true,
          documentUrl: true, documentUrlBack: true, createdAt: true, updatedAt: true,
        },
      },
    },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  // Build clean KYC status map
  const kycStatus = { pan: null, aadhaar: null, bank: null };
  for (const doc of associate.kycDocuments) {
    if (doc.type === 'PAN') {
      kycStatus.pan = { status: doc.status, number: doc.documentNumber, url: doc.documentUrl, urlBack: doc.documentUrlBack };
    } else if (doc.type === 'AADHAAR') {
      kycStatus.aadhaar = { status: doc.status, number: doc.documentNumber, url: doc.documentUrl, urlBack: doc.documentUrlBack };
    } else if (doc.type === 'BANK') {
      let bankDetails = {};
      try { bankDetails = JSON.parse(doc.documentNumber); } catch { bankDetails = {}; }
      kycStatus.bank = { status: doc.status, ...bankDetails, chequeUrl: doc.documentUrl };
    }
  }

  return {
    id: associate.id,
    userId: associate.userId,
    name: associate.name,
    email: associate.email,
    phone: associate.phone,
    dateOfBirth: associate.dateOfBirth,
    address: associate.address,
    city: associate.city,
    state: associate.state,
    pincode: associate.pincode,
    panNumber: associate.panNumber,
    profilePhoto: associate.profilePhoto || null,
    status: associate.status,
    rank: associate.rank,
    rankName: RANK_NAMES[associate.rank] || 'Unknown',
    totalAreaSold: associate.totalAreaSold,
    joiningDate: associate.joiningDate,
    activationDate: associate.activationDate,
    theme: associate.theme,
    language: associate.language,
    // Extended profile
    fatherHusbandName: associate.fatherHusbandName || null,
    gender:            associate.gender || null,
    profession:        associate.profession || null,
    maritalStatus:     associate.maritalStatus || null,
    aadhaarNo:         associate.aadhaarNo || null,
    nomineeName:       associate.nomineeName || null,
    nomineeRelation:   associate.nomineeRelation || null,
    nomineeDob:        associate.nomineeDob || null,
    joiningType:       associate.joiningType || null,
    bankName:          associate.bankName || null,
    bankBranchName:    associate.bankBranchName || null,
    bankAccountNo:     associate.bankAccountNo || null,
    bankIfscCode:      associate.bankIfscCode || null,
    sponsor: associate.sponsor || null,
    treeNode: associate.treeNode || null,
    kycStatus,
  };
}

// ─── Update Profile ───────────────────────────────────────────────────────────

const ALLOWED_UPDATE_FIELDS = [
  'phone', 'email', 'address', 'city', 'state', 'pincode',
  'profilePhoto', 'dateOfBirth',
  // Extended profile
  'fatherHusbandName', 'gender', 'profession', 'maritalStatus', 'aadhaarNo',
  'nomineeName', 'nomineeRelation', 'nomineeDob',
  'joiningType',
  'bankName', 'bankBranchName', 'bankAccountNo', 'bankIfscCode',
];

export async function updateProfile(associateId, data) {
  const updateData = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (data[field] !== undefined) {
      // nomineeDob and dateOfBirth need to be cast to Date
      if ((field === 'nomineeDob' || field === 'dateOfBirth') && data[field]) {
        updateData[field] = parseDateString(data[field]);
      } else {
        updateData[field] = data[field];
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw Object.assign(new Error('No valid fields to update'), { statusCode: 400 });
  }

  const current = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { phone: true, email: true },
  });
  if (!current) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });

  if (updateData.phone && updateData.phone !== current.phone) {
    const existing = await prisma.associate.findFirst({
      where: { phone: updateData.phone, deletedAt: null, id: { not: associateId } },
    });
    if (existing) throw Object.assign(new Error('Phone number already in use'), { statusCode: 409 });
  }

  if (updateData.email && updateData.email !== current.email) {
    const existing = await prisma.associate.findFirst({
      where: { email: updateData.email, deletedAt: null, id: { not: associateId } },
    });
    if (existing) throw Object.assign(new Error('Email address already in use'), { statusCode: 409 });
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
      profilePhoto: true,
      dateOfBirth: true,
      fatherHusbandName: true,
      gender: true,
      profession: true,
      maritalStatus: true,
      aadhaarNo: true,
      nomineeName: true,
      nomineeRelation: true,
      nomineeDob: true,
      joiningType: true,
      bankName: true,
      bankBranchName: true,
      bankAccountNo: true,
      bankIfscCode: true,
      updatedAt: true,
    },
  });

  return updated;
}

// ─── Submit KYC (Consolidated) ────────────────────────────────────────────────

export async function submitKYCAll(associateId, {
  panNumber,
  panDocumentUrl,
  panDocumentBackUrl,
  aadhaarNumber,
  aadhaarDocumentUrl,
  aadhaarDocumentBackUrl,
  bankAccountNumber,
  bankIfsc,
  bankName,
  bankBranch,
  chequeDocumentUrl,
}) {
  const results = {};

  // 1. PAN Submission
  if (panNumber || panDocumentUrl || panDocumentBackUrl) {
    const existingPan = await prisma.kYCDocument.findUnique({
      where: { associateId_type: { associateId, type: 'PAN' } },
    });
    const finalUrl = panDocumentUrl || existingPan?.documentUrl || '';
    const finalUrlBack = panDocumentBackUrl || existingPan?.documentUrlBack || null;
    const finalNumber = panNumber || existingPan?.documentNumber || '';
    if (!finalNumber) {
      throw Object.assign(new Error('PAN number is required'), { statusCode: 400 });
    }
    results.pan = await prisma.kYCDocument.upsert({
      where: { associateId_type: { associateId, type: 'PAN' } },
      update: {
        documentNumber: finalNumber,
        documentUrl: finalUrl,
        documentUrlBack: finalUrlBack,
        status: 'PENDING',
        rejectionReason: null,
        verifiedBy: null,
        verifiedAt: null,
      },
      create: { associateId, type: 'PAN', documentNumber: finalNumber, documentUrl: finalUrl, documentUrlBack: finalUrlBack, status: 'PENDING' },
    });
  }

  // 2. Aadhaar Submission
  if (aadhaarNumber || aadhaarDocumentUrl || aadhaarDocumentBackUrl) {
    const existingAadhaar = await prisma.kYCDocument.findUnique({
      where: { associateId_type: { associateId, type: 'AADHAAR' } },
    });
    const finalUrl = aadhaarDocumentUrl || existingAadhaar?.documentUrl || '';
    const finalUrlBack = aadhaarDocumentBackUrl || existingAadhaar?.documentUrlBack || null;
    const finalNumber = aadhaarNumber || existingAadhaar?.documentNumber || '';
    if (!finalNumber) {
      throw Object.assign(new Error('Aadhaar number is required'), { statusCode: 400 });
    }
    results.aadhaar = await prisma.kYCDocument.upsert({
      where: { associateId_type: { associateId, type: 'AADHAAR' } },
      update: {
        documentNumber: finalNumber,
        documentUrl: finalUrl,
        documentUrlBack: finalUrlBack,
        status: 'PENDING',
        rejectionReason: null,
        verifiedBy: null,
        verifiedAt: null,
      },
      create: { associateId, type: 'AADHAAR', documentNumber: finalNumber, documentUrl: finalUrl, documentUrlBack: finalUrlBack, status: 'PENDING' },
    });
  }

  // 3. Bank Submission
  if (bankAccountNumber || bankIfsc || bankName || chequeDocumentUrl) {
    const existingBank = await prisma.kYCDocument.findUnique({
      where: { associateId_type: { associateId, type: 'BANK' } },
    });
    let oldDetails = {};
    if (existingBank) {
      try { oldDetails = JSON.parse(existingBank.documentNumber); } catch { oldDetails = {}; }
    }
    const finalAccountNumber = bankAccountNumber || oldDetails.accountNumber;
    const finalIfsc = bankIfsc || oldDetails.ifsc;
    const finalBankName = bankName || oldDetails.bankName;
    const finalBranch = bankBranch !== undefined ? bankBranch : oldDetails.branch || '';

    if (!finalAccountNumber || !finalIfsc || !finalBankName) {
      throw Object.assign(
        new Error('bankAccountNumber, bankIfsc, and bankName are required for bank details'),
        { statusCode: 400 },
      );
    }

    const bankDetails = JSON.stringify({
      accountNumber: finalAccountNumber,
      ifsc: finalIfsc,
      bankName: finalBankName,
      branch: finalBranch,
    });

    const finalChequeUrl = chequeDocumentUrl || existingBank?.documentUrl || '';

    results.bank = await prisma.kYCDocument.upsert({
      where: { associateId_type: { associateId, type: 'BANK' } },
      update: {
        documentNumber: bankDetails,
        documentUrl: finalChequeUrl,
        status: 'PENDING',
        rejectionReason: null,
        verifiedBy: null,
        verifiedAt: null,
      },
      create: { associateId, type: 'BANK', documentNumber: bankDetails, documentUrl: finalChequeUrl, status: 'PENDING' },
    });
  }

  return results;
}

// ─── Account Deletion Request ────────────────────────────────────────────────

export async function requestDeletion(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  if (associate.deletionRequestedAt) {
    throw Object.assign(new Error('Deletion request is already pending'), { statusCode: 400 });
  }

  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 7);

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: {
      deletionRequestedAt: new Date(),
      scheduledDeletionAt: scheduledDate,
    },
  });

  // Send email
  const { sendDeletionRequestEmail } = await import('../utils/email.js');
  await sendDeletionRequestEmail(associate.email, {
    name: associate.name,
    userId: associate.userId,
    scheduledDate,
  });

  return updated;
}
