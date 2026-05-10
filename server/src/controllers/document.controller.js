import {
  generateWelcomeLetter,
  generatePaymentReceipt,
  generateAgreement,
  getKYCDocumentURLs,
} from '../services/document.service.js';
import { successResponse } from '../utils/response.js';

// ─── downloadWelcomeLetterHandler ─────────────────────────────────────────────

export async function downloadWelcomeLetterHandler(req, res, next) {
  try {
    const buffer = await generateWelcomeLetter(req.associate.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="welcome-letter.pdf"');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
}

// ─── downloadReceiptHandler ───────────────────────────────────────────────────

export async function downloadReceiptHandler(req, res, next) {
  try {
    const { transactionId } = req.params;
    const buffer = await generatePaymentReceipt(req.associate.id, transactionId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="payment-receipt.pdf"');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
}

// ─── downloadAgreementHandler ─────────────────────────────────────────────────

export async function downloadAgreementHandler(req, res, next) {
  try {
    const buffer = await generateAgreement(req.associate.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="membership-agreement.pdf"');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
}

// ─── getKYCDocumentsHandler ───────────────────────────────────────────────────

export async function getKYCDocumentsHandler(req, res, next) {
  try {
    const data = await getKYCDocumentURLs(req.associate.id);
    return successResponse(res, data, 'KYC documents retrieved');
  } catch (err) {
    return next(err);
  }
}
