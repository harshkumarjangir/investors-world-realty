import { useState, useEffect } from 'react';
import { DollarSign, Check, X, AlertCircle } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Payouts() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [reportFilters, setReportFilters] = useState({
    startDate: '', endDate: '', incomeType: '', page: 1,
  });
  const [reportTotalPages, setReportTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'pending') fetchPending();
    else fetchReports();
  }, [activeTab, reportFilters.page]);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payouts/pending');
      setPendingPayouts(res.data?.data || res.data?.payouts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payouts/reports', { params: reportFilters });
      const body = res.data?.data || res.data;
      setReports(Array.isArray(body) ? body : body?.items || []);
      setReportTotalPages(res.data?.totalPages || body?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm('Generate payouts for all eligible associates?')) return;
    try {
      setGenerating(true);
      await api.post('/admin/payouts/generate');
      alert('Payouts generated successfully');
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate payouts');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this payout?')) return;
    try {
      await api.post(`/admin/payouts/${id}/approve`);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/admin/payouts/${id}/reject`, { reason });
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const tabs = [
    { key: 'pending', label: t('payouts.pending') },
    { key: 'reports', label: 'Reports' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('payouts.title')}</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <DollarSign size={16} />
          {generating ? t('common.loading') : t('payouts.generate')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Associate</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Income Breakdown</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
                ) : pendingPayouts.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
                ) : (
                  pendingPayouts.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 even:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{p.associateName || p.userId}</p>
                        <p className="text-xs text-gray-500">{p.userId}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        ₹{Number(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {p.breakdown || p.incomeType || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                          >
                            <Check size={14} />
                            {t('payouts.approve')}
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          >
                            <X size={14} />
                            {t('payouts.reject')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              value={reportFilters.startDate}
              onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value, page: 1 })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="date"
              value={reportFilters.endDate}
              onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value, page: 1 })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <select
              value={reportFilters.incomeType}
              onChange={(e) => setReportFilters({ ...reportFilters, incomeType: e.target.value, page: 1 })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All Income Types</option>
              <option value="DIRECT">Direct</option>
              <option value="LEVEL">Level</option>
              <option value="BINARY">Binary</option>
              <option value="REWARD">Reward</option>
            </select>
            <button
              onClick={fetchReports}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Filter
            </button>
          </div>

          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Associate</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
                  ) : reports.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
                  ) : (
                    reports.map((r, idx) => (
                      <tr key={r.id || idx} className="border-b border-gray-50 even:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{new Date(r.date || r.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-700">{r.associateName || r.userId}</td>
                        <td className="px-4 py-3 text-gray-700">{r.incomeType || r.type}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">₹{Number(r.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            r.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{r.status}</span>
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
            <p className="text-sm text-gray-500">Page {reportFilters.page} of {reportTotalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setReportFilters({ ...reportFilters, page: Math.max(1, reportFilters.page - 1) })}
                disabled={reportFilters.page === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setReportFilters({ ...reportFilters, page: Math.min(reportTotalPages, reportFilters.page + 1) })}
                disabled={reportFilters.page === reportTotalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
