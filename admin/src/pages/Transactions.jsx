import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Transactions() {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '', endDate: '', type: '', associateId: '', status: '', page: 1,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [filters.page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/transactions', { params: filters });
      setTransactions(res.data?.transactions || res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setFilters({ ...filters, page: 1 });
    fetchTransactions();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('nav.transactions')}</h1>

      {/* Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
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
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            >
              <option value="">All Types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
              <option value="TRANSFER">Transfer</option>
              <option value="PAYOUT">Payout</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Associate ID</label>
            <input
              type="text"
              placeholder="Associate ID"
              value={filters.associateId}
              onChange={(e) => setFilters({ ...filters, associateId: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <button
            onClick={handleFilter}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Associate</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={tx.id || idx} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' :
                        tx.type === 'DEBIT' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{tx.type}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      ₹{Number(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{tx.associateName || tx.userId || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        tx.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{tx.status || 'N/A'}</span>
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
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
            disabled={filters.page === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
