import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import {
  getJoiningReport,
  getActivationReport,
  getIncomeReport,
  getWithdrawalReport,
  getFundTransferReport,
  getRankAchieversReport,
} from '../../services/admin/report.service.js';

// ─── Helper: fetch ALL records (no pagination) ────────────────────────────────

async function fetchAllRecords(reportType, query) {
  const { startDate, endDate, type, status, rank } = query;
  const bigPagination = { page: 1, pageSize: 10000, skip: 0, take: 10000 };

  switch (reportType) {
    case 'joining':
      return getJoiningReport(startDate, endDate, bigPagination);
    case 'activation':
      return getActivationReport(startDate, endDate, bigPagination);
    case 'income':
      return getIncomeReport(type, startDate, endDate, bigPagination);
    case 'withdrawal':
      return getWithdrawalReport(status, startDate, endDate, bigPagination);
    case 'fund-transfer':
      return getFundTransferReport(startDate, endDate, bigPagination);
    case 'rank-achievers': {
      const rank = parseInt(query.rank || '1', 10);
      return getRankAchieversReport(rank, bigPagination);
    }
    default:
      throw Object.assign(new Error('Invalid report type'), { statusCode: 400 });
  }
}

// ─── Column definitions per report type ───────────────────────────────────────

const COLUMNS = {
  joining: [
    { header: 'User ID', key: 'userId', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Joining Date', key: 'joiningDate', width: 18 },
    { header: 'Sponsor', key: 'sponsorUserId', width: 15 },
  ],
  activation: [
    { header: 'User ID', key: 'userId', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Activation Date', key: 'activationDate', width: 18 },
  ],
  income: [
    { header: 'User ID', key: 'userId', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Amount (₹)', key: 'amount', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Date', key: 'createdAt', width: 18 },
  ],
  withdrawal: [
    { header: 'User ID', key: 'userId', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Amount (₹)', key: 'amount', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Ref', key: 'transactionRef', width: 20 },
    { header: 'Requested', key: 'createdAt', width: 18 },
    { header: 'Processed', key: 'processedAt', width: 18 },
  ],
  'fund-transfer': [
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Amount (₹)', key: 'amount', width: 15 },
    { header: 'Sender', key: 'senderUserId', width: 15 },
    { header: 'Recipient', key: 'recipientUserId', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Date', key: 'createdAt', width: 18 },
  ],
  'rank-achievers': [
    { header: 'User ID', key: 'userId', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Rank', key: 'rank', width: 8 },
    { header: 'Designation', key: 'rankName', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Area Sold (gaj)', key: 'totalAreaSold', width: 16 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Sponsor ID', key: 'sponsorUserId', width: 15 },
    { header: 'Joining Date', key: 'joiningDate', width: 18 },
    { header: 'Activation Date', key: 'activationDate', width: 18 },
  ],
};

// ─── Format date for display ──────────────────────────────────────────────────

function fmtDate(val) {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatRow(row, reportType) {
  const formatted = { ...row };
  const dateKeys = ['joiningDate', 'activationDate', 'createdAt', 'processedAt'];
  for (const key of dateKeys) {
    if (formatted[key]) formatted[key] = fmtDate(formatted[key]);
  }
  if (formatted.amount !== undefined) formatted.amount = Number(formatted.amount);
  return formatted;
}

// ─── Excel Export Handler ─────────────────────────────────────────────────────

export async function exportExcelHandler(req, res, next) {
  try {
    const { reportType } = req.params;
    const result = await fetchAllRecords(reportType, req.query);
    const columns = COLUMNS[reportType];
    if (!columns) {
      return res.status(400).json({ status: 'error', message: 'Invalid report type', data: null });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Investors World Realty';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report');
    sheet.columns = columns;

    // Style header row
    sheet.getRow(1).font = { bold: true, size: 11 };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

    // Add data rows
    for (const row of result.items) {
      sheet.addRow(formatRow(row, reportType));
    }

    // Auto-filter
    sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };

    const filename = `${reportType}-report-${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return next(err);
  }
}

// ─── PDF Export Handler ───────────────────────────────────────────────────────

export async function exportPdfHandler(req, res, next) {
  try {
    const { reportType } = req.params;
    const result = await fetchAllRecords(reportType, req.query);
    const columns = COLUMNS[reportType];
    if (!columns) {
      return res.status(400).json({ status: 'error', message: 'Invalid report type', data: null });
    }

    const filename = `${reportType}-report-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    doc.pipe(res);

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text(`Investors World Realty — ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica').text(`Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${result.items.length}`, { align: 'center' });
    doc.moveDown(1);

    // Table
    const tableTop = doc.y;
    const pageWidth = doc.page.width - 60;
    const colWidth = pageWidth / columns.length;
    const rowHeight = 20;

    // Header
    doc.font('Helvetica-Bold').fontSize(8);
    columns.forEach((col, i) => {
      doc.text(col.header, 30 + i * colWidth, tableTop, { width: colWidth, align: 'left' });
    });
    doc.moveTo(30, tableTop + 14).lineTo(30 + pageWidth, tableTop + 14).stroke();

    // Rows
    doc.font('Helvetica').fontSize(7);
    let y = tableTop + rowHeight;

    for (const row of result.items) {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 30;
        // Re-draw header on new page
        doc.font('Helvetica-Bold').fontSize(8);
        columns.forEach((col, i) => {
          doc.text(col.header, 30 + i * colWidth, y, { width: colWidth, align: 'left' });
        });
        doc.moveTo(30, y + 14).lineTo(30 + pageWidth, y + 14).stroke();
        y += rowHeight;
        doc.font('Helvetica').fontSize(7);
      }

      const formatted = formatRow(row, reportType);
      columns.forEach((col, i) => {
        const val = formatted[col.key] ?? '-';
        doc.text(String(val), 30 + i * colWidth, y, { width: colWidth, align: 'left' });
      });
      y += rowHeight;
    }

    doc.end();
  } catch (err) {
    return next(err);
  }
}
