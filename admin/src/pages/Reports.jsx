import { useState, useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const TABS = [
  { key: 'joining', endpoint: '/admin/reports/joining' },
  { key: 'activation', endpoint: '/admin/reports/activation' },
  { key: 'income', endpoint: '/admin/reports/income' },
  { key: 'withdrawal', endpoint: '/admin/reports/withdrawal' },
  { key: 'fundTransfer', endpoint: '/admin/reports/fund-transfer', exportKey: 'fund-transfer' },
  { key: 'userWise', endpoint: '/admin/reports/user', needsId: true },
];

export default function Reports() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('joining');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    fetchReport();
  }, [activeTab, filters.page]);

  // Close export menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchReport = async () => {
    const tab = TABS.find((tb) => tb.key === activeTab);
    if (tab.needsId) {
      setLoading(false);
      setData([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(tab.endpoint, { params: filters });
      setData(res.data?.data || res.data?.reports || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load report', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setFilters({ ...filters, page: 1 });
    fetchReport();
  };

  const handleExport = async (format) => {
    const tab = TABS.find((tb) => tb.key === activeTab);
    if (tab.needsId) {
      alert('User-wise report export is not supported. Please select another report.');
      return;
    }

    const reportKey = tab.exportKey || tab.key;
    setExporting(true);
    setShowExportMenu(false);

    try {
      const params = { startDate: filters.startDate, endDate: filters.endDate };
      const res = await api.get(`/admin/reports/export/${format}/${reportKey}`, {
        params,
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      link.download = `${reportKey}-report-${new Date().toISOString().slice(0, 10)}.${ext}`;
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

  const tabLabels = {
    joining: t('reports.joining'),
    activation: t('reports.activation'),
    income: t('reports.income'),
    withdrawal: t('reports.withdrawal'),
    fundTransfer: t('reports.fundTransfer'),
    userWise: t('reports.userWise'),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('reports.title')}</h1>

        {/* Export Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting || TABS.find((tb) => tb.key === activeTab)?.needsId}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : t('reports.export')}
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                <FileSpreadsheet size={18} className="text-green-600" />
                Export as Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg border-t border-gray-100"
              >
                <FileText size={18} className="text-red-600" />
                Export as PDF
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
            onClick={() => { setActiveTab(tab.key); setFilters({ ...filters, page: 1 }); }}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabLabels[tab.key]}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <button
          onClick={handleFilter}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Associate</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Details</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.id || idx} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(row.date || row.createdAt || row.joiningDate || row.activationDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.name || row.userId || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.details || row.type || row.packageName || row.description || '-'}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.amount ? `₹${Number(row.amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {row.status && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.status === 'COMPLETED' || row.status === 'ACTIVE' || row.status === 'APPROVED' || row.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          row.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{row.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Page {filters.page} of {totalPages}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            disabled={filters.page === 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
            disabled={filters.page === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
