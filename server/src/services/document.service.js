import PDFDocument from 'pdfkit';
import prisma from '../utils/prisma.js';

// ─── generateWelcomeLetter ────────────────────────────────────────────────────

/**
 * Get Welcome Letter Data for an associate.
 * @param {string} associateId
 * @returns {Promise<Object>}
 */
export async function getWelcomeLetterData(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    include: {
      sponsor: { select: { name: true, userId: true } },
    },
  });

  if (!associate) {
    const err = new Error('Associate not found');
    err.statusCode = 404;
    throw err;
  }

  const joiningDate = associate.joiningDate
    ? new Date(associate.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '-';
  const activationDate = associate.activationDate
    ? new Date(associate.activationDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '-';

  // Fetch company logo from branding assets if available
  const logoAsset = await prisma.brandingAsset.findUnique({ where: { key: 'logo' } });
  const companyLogoUrl = logoAsset?.url || 'https://investorsworldrealty.in/assets/logo.png';

  return {
    name: associate.name.toUpperCase(),
    userId: associate.userId,
    joiningDate,
    activationDate,
    panNumber: associate.panNumber || '-',
    companyLogoUrl,
    subject: 'A HEARTLY WELCOME TO INVESTORS WORLD REALTY PVT. LTD. ...',
    paragraphs: [
      'It is great pleasure welcome you to INVESTORS WORLD REALTY PVT. LTD...',
      "We sincerely believe that you're joining to this company as an \"INDIVIDUAL Associate\" helps and supports the company to reach the sky high goals in no time. We also appreciate your decision and spontaneous action implementing attitude which has always been found to the great people of the world.",
      "You have wisely and rightly chosen this company which speaks itself about wittiness and understanding and your trust and confidence in companies policies plans & products, management capability and off course company's prospective growth.",
      "\"If you grow definitely the company will and that's the motto of the company. And the more completely give of yourself, the more completely the company will give back to you\".",
      "We as company promise you that your Best services will surely be looked forward to a step ahead. We are determine that your life package in terms of mental, physical, social and financial must be preserved as a priceless diamond and that will be our good will for you...",
      "Last but not least, we once again welcome you and take you as our one of the best prospective \"Associate\" with wide open sky opportunities.",
      "\"With Best Wishes fly high with us as a family member\""
    ],
    signatory: {
      title: '(Managing Director)',
      company: 'INVESTORS WORLD REALTY PVT. LTD.'
    }
  };
}

export function generatePaymentReceipt(associateId, transactionId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch associate and their wallet
      const associate = await prisma.associate.findUnique({
        where: { id: associateId },
        include: { wallet: { select: { id: true } } },
      });

      if (!associate) {
        const err = new Error('Associate not found');
        err.statusCode = 404;
        return reject(err);
      }

      if (!associate.wallet) {
        const err = new Error('Wallet not found');
        err.statusCode = 404;
        return reject(err);
      }

      // Fetch transaction and verify it belongs to this associate's wallet
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction || transaction.walletId !== associate.wallet.id) {
        const err = new Error('Transaction not found');
        err.statusCode = 404;
        return reject(err);
      }

      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── Header ──
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('Investors World Realty', { align: 'center' })
        .fontSize(16)
        .font('Helvetica')
        .text('Payment Receipt', { align: 'center' })
        .moveDown(1.5);

      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(1);

      // ── Transaction Details ──
      doc.fontSize(13).font('Helvetica-Bold').text('Transaction Details').moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Transaction ID : ${transaction.id}`);
      doc.text(`Date           : ${new Date(transaction.createdAt).toLocaleString('en-IN')}`);
      doc.text(`Type           : ${transaction.type.replace(/_/g, ' ')}`);
      doc.text(`Amount         : ₹${Number(transaction.amount).toLocaleString('en-IN')}`);
      doc.text(`Status         : ${transaction.status}`);
      doc.text(`Description    : ${transaction.description}`);
      doc.moveDown(1);

      // ── Associate Details ──
      doc.fontSize(13).font('Helvetica-Bold').text('Associate Details').moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Name           : ${associate.name}`);
      doc.text(`User ID        : ${associate.userId}`);
      doc.moveDown(1.5);

      // ── Footer ──
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('grey')
        .text('This is a system-generated receipt. No signature is required.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── generateAgreement ────────────────────────────────────────────────────────

/**
 * Generate a Membership Agreement PDF for an associate.
 * @param {string} associateId
 * @returns {Promise<Buffer>}
 */
export function generateAgreement(associateId) {
  return new Promise(async (resolve, reject) => {
    try {
      const associate = await prisma.associate.findUnique({
        where: { id: associateId },
      });

      if (!associate) {
        const err = new Error('Associate not found');
        err.statusCode = 404;
        return reject(err);
      }

      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── Header ──
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Membership Agreement', { align: 'center' })
        .fontSize(14)
        .font('Helvetica')
        .text('Investors World Realty', { align: 'center' })
        .moveDown(1.5);

      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(1);

      // ── Associate Details ──
      doc.fontSize(13).font('Helvetica-Bold').text('Member Details').moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Name           : ${associate.name}`);
      doc.text(`User ID        : ${associate.userId}`);
      doc.text(`Email          : ${associate.email}`);
      doc.text(`Phone          : ${associate.phone}`);
      doc.text(`Address        : ${[associate.address, associate.city, associate.state, associate.pincode].filter(Boolean).join(', ') || 'N/A'}`);
      doc.text(`Joining Date   : ${associate.joiningDate ? new Date(associate.joiningDate).toLocaleDateString('en-IN') : 'N/A'}`);
      doc.moveDown(1);



      // ── Terms and Conditions ──
      doc.fontSize(13).font('Helvetica-Bold').text('Terms and Conditions').moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('black');

      const terms = [
        '1. The member agrees to abide by all rules and regulations of Investors World Realty.',
        '2. Membership is non-transferable and personal to the registered associate.',
        '3. The company reserves the right to modify the membership terms with prior notice.',
        '4. Income and commissions are subject to the company\'s compensation plan and applicable taxes.',
        '5. The member is responsible for maintaining the confidentiality of their account credentials.',
        '6. Any fraudulent activity will result in immediate suspension and legal action.',
        '7. Disputes shall be resolved through arbitration as per applicable laws.',
        '8. The member acknowledges receipt of the company\'s policies and agrees to comply with them.',
        '9. This agreement is governed by the laws of India.',
        '10. The company is not liable for any indirect or consequential losses arising from membership.',
      ];

      terms.forEach((term) => {
        doc.text(term, { paragraphGap: 4 });
      });

      doc.moveDown(1.5);

      // ── Footer ──
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('grey')
        .text('This is a system-generated agreement document.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── getKYCDocumentURLs ───────────────────────────────────────────────────────

/**
 * Return KYC document URLs and statuses for an associate.
 * @param {string} associateId
 * @returns {Promise<{ pan, aadhaar, bank }>}
 */
export async function getKYCDocumentURLs(associateId) {
  const docs = await prisma.kYCDocument.findMany({
    where: { associateId },
    select: {
      type: true,
      documentUrl: true,
      documentUrlBack: true,
      status: true,
    },
  });

  const result = { pan: null, aadhaar: null, bank: null };

  docs.forEach((doc) => {
    const key = doc.type.toLowerCase(); // PAN → pan, AADHAAR → aadhaar, BANK → bank
    result[key] = {
      url: doc.documentUrl,
      urlBack: doc.documentUrlBack,
      status: doc.status,
    };
  });

  return result;
}
