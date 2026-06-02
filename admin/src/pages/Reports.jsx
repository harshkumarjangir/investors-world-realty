import { useState, useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, FileText, Trophy } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const RANK_NAMES = [
  { value: 1, label: 'Business Associate' },
  { value: 2, label: 'Business Adviser' },
  { value: 3, label: 'Business Head' },
  { value: 4, label: 'Dist. Business Head' },
  { value: 5, label: 'State Business Head' },
  { value: 6, label: 'Regional Business Head' },
  { value: 7, label: 'National Business Head' },
  { value: 8, label: 'Vice President Sales' },
  { value: 9, label: 'President Sales' },
  { value: 10, label: 'President Club' },
];

// ─── Column definitions per tab ──────────────────────────────────────────────
const TAB_COLUMNS = {
  joining: [
    { key: 'userId',        label: 'User ID' },
    { key: 'name',          label: 'Name' },
    { key: 'phone',         label: 'Phone' },
    { key: 'email',         label: 'Email' },
    { key: 'sponsorUserId', label: 'Sponsor ID' },
    { key: 'joiningDate',   label: 'Joining Date', isDate: true },
  ],
  activation: [
    { key: 'userId',         label: 'User ID' },
    { key: 'name',           label: 'Name' },
    { key: 'activationDate', label: 'Activation Date', isDate: true },
  ],
  income: [
    { key: 'userId',    label: 'User ID' },
    { key: 'name',      label: 'Name' },
    { key: 'type',      label: 'Type' },
    { key: 'amount',    label: 'Amount', isAmount: true },
    { key: 'status',    label: 'Status', isStatus: true },
    { key: 'createdAt', label: 'Date', isDate: true },
  ],
  withdrawal: [
    { key: 'userId',         label: 'User ID' },
    { key: 'name',           label: 'Name' },
    { key: 'amount',         label: 'Amount', isAmount: true },
    { key: 'status',         label: 'Status', isStatus: true },
    { key: 'transactionRef', label: 'Ref No.' },
    { key: 'createdAt',      label: 'Requested', isDate: true },
    { key: 'processedAt',    label: 'Processed', isDate: true },
  ],
  fundTransfer: [
    { key: 'type',            label: 'Type' },
    { key: 'senderUserId',    label: 'Sender' },
    { key: 'recipientUserId', label: 'Recipient' },
    { key: 'amount',          label: 'Amount', isAmount: true },
    { key: 'description',     label: 'Description' },
    { key: 'createdAt',       label: 'Date', isDate: true },
  ],
  rankAchievers: [
    { key: 'userId',        label: 'User ID' },
    { key: 'name',          label: 'Name' },
    { key: 'rankName',      label: 'Designation' },
    { key: 'phone',         label: 'Phone' },
    { key: 'totalAreaSold', label: 'Area Sold (gaj)' },
    { key: 'status',        label: 'Status', isStatus: true },
    { key: 'sponsorUserId', label: 'Sponsor ID' },
    { key: 'joiningDate',   label: 'Joining Date', isDate: true },
    { key: 'activationDate',label: 'Activation Date', isDate: true },
  ],
};

const TABS = [
  { key: 'joining',       label: 'Joining Report',       endpoint: '/admin/reports/joining',       exportKey: 'joining' },
  { key: 'activation',    label: 'Activation Report',    endpoint: '/admin/reports/activation',    exportKey: 'activation' },
  { key: 'income',        label: 'Income Report',        endpoint: '/admin/reports/income',        exportKey: 'income' },
  { key: 'withdrawal',    label: 'Withdrawal Report',    endpoint: '/admin/reports/withdrawal',    exportKey: 'withdrawal' },
  { key: 'fundTransfer',  label: 'Fund Transfer Report', endpoint: '/admin/reports/fund-transfer', exportKey: 'fund-transfer' },
  { key: 'rankAchievers', label: 'Rank Achiever List',   endpoint: '/admin/reports/rank-achievers', exportKey: 'rank-achievers' },
];

function StatusBadge({ value }) {
  if (!value) return <span className="text-gray-400">-</span>;
  const color =
    ['COMPLETED', 'ACTIVE', 'APPROVED', 'PAID'].includes(value) ? 'bg-green-100 text-green-700' :
    value === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
    ['REJECTED', 'FAILED', 'SUSPENDED'].includes(value) ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-600';
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{value}</span>;
}

function fmtDate(val) {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Reports() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('joining');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Rank Achiever List state
  const [selectedRank, setSelectedRank] = useState('');
  const [rankFetched, setRankFetched] = useState(false);

  const exportRef = useRef(null);

  // Re-fetch when tab changes or page changes (except rankAchievers which needs manual trigger)
  useEffect(() => {
    if (activeTab !== 'rankAchievers') {
      fetchReport();
    } else {
      setData([]);
      setRankFetched(false);
    }
  }, [activeTab, filters.page]);

  // Close export menu on outside click
  useEffect(() => {
    function handler(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchReport = async (overrideFilters) => {
    const tab = TABS.find((tb) => tb.key === activeTab);
    const params = overrideFilters || filters;
    try {
      setLoading(true);
      const res = await api.get(tab.endpoint, { params });
      setData(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalItems(res.data?.totalItems || 0);
    } catch (err) {
      console.error('Failed to load report', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    if (activeTab !== 'rankAchievers') {
      fetchReport(newFilters);
    }
  };

  const handleFetchAchievers = () => {
    if (!selectedRank) return;
    const newFilters = { ...filters, page: 1, rank: selectedRank };
    setFilters(newFilters);
    setRankFetched(true);
    fetchReport(newFilters);
  };

  const handleExport = async (format) => {
    const tab = TABS.find((tb) => tb.key === activeTab);
    if (activeTab === 'rankAchievers' && !selectedRank) {
      alert('Please select a designation first.');
      return;
    }
    setExporting(true);
    setShowExportMenu(false);
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(activeTab === 'rankAchievers' ? { rank: selectedRank } : {}),
      };
      const res = await api.get(`/admin/reports/export/${format}/${tab.exportKey}`, {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      const label = activeTab === 'rankAchievers' ? `rank-${selectedRank}` : tab.exportKey;
      link.download = `${label}-report-${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const columns = TAB_COLUMNS[activeTab] || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

        {/* Export Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                <FileSpreadsheet size={18} className="text-green-600" /> Export as Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg border-t border-gray-100"
              >
                <FileText size={18} className="text-red-600" /> Export as PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setFilters({ startDate: '', endDate: '', page: 1 }); setData([]); }}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'border-gold-500 text-gold-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.key === 'rankAchievers' && <Trophy size={14} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rank Achiever Controls */}
      {activeTab === 'rankAchievers' && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-600 mb-3">Select Promotion</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200 min-w-[220px]"
            >
              <option value="">Select Designation</option>
              {RANK_NAMES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <button
              onClick={handleFetchAchievers}
              disabled={!selectedRank || loading}
              className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-white hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Achievers
            </button>
          </div>
        </div>
      )}

      {/* Date Filters (not shown for rankAchievers) */}
      {activeTab !== 'rankAchievers' && (
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600"
          >
            Apply
          </button>
          <button
            onClick={() => {
              const reset = { startDate: '', endDate: '', page: 1 };
              setFilters(reset);
              fetchReport(reset);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      )}

      {/* Summary badge */}
      {totalItems > 0 && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{data.length}</span> of <span className="font-medium text-gray-700">{totalItems}</span> records
          {activeTab === 'rankAchievers' && selectedRank && (
            <span className="ml-2 text-gold-600 font-medium">
              — {RANK_NAMES.find((r) => r.value === parseInt(selectedRank))?.label}
            </span>
          )}
        </p>
      )}

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-10 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-10 text-center text-gray-400">
                    {activeTab === 'rankAchievers' && !rankFetched
                      ? 'Select a designation and click Achievers to view the list'
                      : 'No data found'}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {(filters.page - 1) * 20 + idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-700">
                        {col.isStatus ? (
                          <StatusBadge value={row[col.key]} />
                        ) : col.isDate ? (
                          fmtDate(row[col.key])
                        ) : col.isAmount ? (
                          row[col.key] != null ? `₹${Number(row[col.key]).toLocaleString('en-IN')}` : '-'
                        ) : (
                          row[col.key] ?? '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {filters.page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newPage = Math.max(1, filters.page - 1);
                const newFilters = { ...filters, page: newPage };
                setFilters(newFilters);
                if (activeTab === 'rankAchievers') fetchReport(newFilters);
              }}
              disabled={filters.page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const newPage = Math.min(totalPages, filters.page + 1);
                const newFilters = { ...filters, page: newPage };
                setFilters(newFilters);
                if (activeTab === 'rankAchievers') fetchReport(newFilters);
              }}
              disabled={filters.page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
