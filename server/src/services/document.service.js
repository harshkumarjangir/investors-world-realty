import PDFDocument from 'pdfkit';
import prisma from '../utils/prisma.js';

// ─── generateWelcomeLetter ────────────────────────────────────────────────────

/**
 * Generate a Welcome Letter PDF for an associate.
 * @param {string} associateId
 * @returns {Promise<Buffer>}
 */

export function generateWelcomeLetter(associateId) {
  return new Promise(async (resolve, reject) => {
    try {
      const associate = await prisma.associate.findUnique({
        where: { id: associateId },
        include: {
          sponsor: { select: { name: true, userId: true } },
          package: { select: { name: true, price: true } },
        },
      });

      if (!associate) {
        const err = new Error('Associate not found');
        err.statusCode = 404;
        return reject(err);
      }

      const doc = new PDFDocument({ margin: 60, size: 'A4' });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = doc.page.width - 120;

      // Company name top-right box
      doc.rect(doc.page.width - 130, 40, 80, 60).stroke('#D49428');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#D49428')
        .text("INVESTOR'S\nWORLD\nREALTY", doc.page.width - 128, 52, { width: 76, align: 'center' });

      // Title
      doc.fillColor('black').fontSize(18).font('Helvetica-Bold')
        .text('Welcome Letter', 60, 40, { width: W - 100 });

      doc.moveDown(1.5);

      // To / Salutation
      doc.fontSize(11).font('Helvetica').fillColor('black');
      doc.text('To,', 60);
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').text(`Ms/Mr/Mrs : ${associate.name.toUpperCase()}`);
      doc.moveDown(1.2);

      // Details
      const labelX = 60;
      const valueX = 220;
      let y = doc.y;
      const rows = [
        ['Your Id No.:', associate.userId],
        ['Joining Date:', associate.joiningDate
          ? new Date(associate.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : '-'],
        ['Activation Date:', associate.activationDate
          ? new Date(associate.activationDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : '-'],
        ['Package:', associate.package?.name?.toUpperCase() ?? 'REGISTRATION'],
        ['Pan No:', associate.panNumber ?? '-'],
      ];

      doc.font('Helvetica').fontSize(11);
      for (const [label, value] of rows) {
        doc.fillColor('#555').text(label, labelX, y);
        doc.fillColor('black').text(value || '-', valueX, y);
        y += 22;
      }

      doc.y = y + 10;
      doc.moveDown(0.5);

      // Subject
      doc.font('Helvetica-Bold').fontSize(11).fillColor('black')
        .text('Subject : A HEARTLY WELCOME TO INVESTORS WORLD REALTY PVT. LTD. ...');
      doc.moveDown(0.8);

      // Body paragraphs
      doc.font('Helvetica').fontSize(10.5).fillColor('black');
      const paragraphs = [
        'It is great pleasure welcome you to INVESTORS WORLD REALTY PVT. LTD...',
        "We sincerely believe that you're joining to this company as an \"INDIVIDUAL Associate\" helps and supports the company to reach the sky high goals in no time. We also appreciate your decision and spontaneous action implementing attitude which has always been found to the great people of the world.",
        "You have wisely and rightly chosen this company which speaks itself about wittiness and understanding and your trust and confidence in companies policies plans & products, management capability and off course company's prospective growth.",
        "\"If you grow definitely the company will and that\'s the motto of the company. And the more completely give of yourself, the more completely the company will give back to you\".",
        "We as company promise you that your Best services will surely be looked forward to a step ahead. We are determine that your life package in terms of mental, physical, social and financial must be preserved as a priceless diamond and that will be our good will for you...",
        "Last but not least, we once again welcome you and take you as our one of the best prospective \"Associate\" with wide open sky opportunities.",
        "\"With Best Wishes fly high with us as a family member\"",
      ];

      for (const para of paragraphs) {
        doc.text(para, 60, doc.y, { width: W, align: 'justify' });
        doc.moveDown(0.7);
      }

      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(11).text('Thanks and regards,');
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('(Managing Director)');
      doc.text('INVESTORS WORLD REALTY PVT. LTD.');

      doc.moveDown(1.5);
      doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y)
        .strokeColor('#D49428').lineWidth(1).stroke();
      doc.moveDown(0.4);
      doc.fontSize(8).font('Helvetica').fillColor('#888')
        .text('This is a system-generated document. No signature required.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
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
        include: {
          package: { select: { name: true, price: true, benefits: true } },
        },
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

      // ── Package Details ──
      doc.fontSize(13).font('Helvetica-Bold').text('Package Details').moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Package Name   : ${associate.package?.name ?? 'N/A'}`);
      doc.text(`Package Price  : ₹${associate.package ? Number(associate.package.price).toLocaleString('en-IN') : 'N/A'}`);
      doc.moveDown(0.5);

      if (associate.package?.benefits) {
        doc.fontSize(12).font('Helvetica-Bold').text('Package Benefits:').moveDown(0.3);
        doc.fontSize(11).font('Helvetica');
        const benefits = Array.isArray(associate.package.benefits)
          ? associate.package.benefits
          : [];
        benefits.forEach((benefit) => {
          doc.text(`  • ${benefit}`);
        });
      }
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
