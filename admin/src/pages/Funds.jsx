import { useState, useEffect } from 'react';
import { CreditCard, MinusCircle, ArrowLeftRight, X } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Funds() {
  const { t } = useI18n();
  const [activeForm, setActiveForm] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ associateId: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/funds/logs', { params: { ...filters, page, pageSize: 20 } });
      setLogs(res.data?.data || res.data?.logs || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load fund logs', err);
    } finally {
      setLoading(false);
    }
  };

  const actionCards = [
    { key: 'credit', label: t('funds.credit'), icon: CreditCard, color: 'bg-green-50 border-green-200 text-green-700', hoverColor: 'hover:bg-green-100' },
    { key: 'debit', label: t('funds.debit'), icon: MinusCircle, color: 'bg-red-50 border-red-200 text-red-700', hoverColor: 'hover:bg-red-100' },
    { key: 'transfer', label: t('funds.transfer'), icon: ArrowLeftRight, color: 'bg-blue-50 border-blue-200 text-blue-700', hoverColor: 'hover:bg-blue-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('funds.title')}</h1>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actionCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => setActiveForm(card.key)}
              className={`rounded-xl border-2 p-6 text-left transition-colors ${card.color} ${card.hoverColor}`}
            >
              <Icon size={28} className="mb-3" />
              <p className="text-lg font-semibold">{card.label}</p>
              <p className="text-sm opacity-75 mt-1">
                {card.key === 'credit' && 'Add funds to associate wallet'}
                {card.key === 'debit' && 'Deduct funds from associate wallet'}
                {card.key === 'transfer' && 'Transfer between associates'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Form */}
      {activeForm && (
        <FundForm
          type={activeForm}
          onClose={() => setActiveForm(null)}
          onSuccess={() => { setActiveForm(null); fetchLogs(); }}
        />
      )}

      {/* Transaction Logs */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('funds.logs')}</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Associate ID"
            value={filters.associateId}
            onChange={(e) => setFilters({ ...filters, associateId: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <button
            onClick={fetchLogs}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left font-medium text-gray-600">Date</th>
                <th className="pb-3 text-left font-medium text-gray-600">Type</th>
                <th className="pb-3 text-left font-medium text-gray-600">Associate</th>
                <th className="pb-3 text-left font-medium text-gray-600">Amount</th>
                <th className="pb-3 text-left font-medium text-gray-600">Reason</th>
                <th className="pb-3 text-left font-medium text-gray-600">Admin</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id || idx} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="py-3 text-gray-700">{new Date(log.date || log.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        log.type === 'CREDIT' ? 'bg-green-100 text-green-700' :
                        log.type === 'DEBIT' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{log.type}</span>
                    </td>
                    <td className="py-3 text-gray-700">{log.associateId || log.userId}</td>
                    <td className="py-3 font-medium text-gray-800">₹{Number(log.amount || 0).toLocaleString()}</td>
                    <td className="py-3 text-gray-600">{log.reason || '-'}</td>
                    <td className="py-3 text-gray-600">{log.adminName || log.adminId || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FundForm({ type, onClose, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    associateId: '', fromAssociateId: '', toAssociateId: '',
    amount: '', reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (type === 'credit') {
        await api.post('/admin/funds/credit', {
          associateId: form.associateId, amount: Number(form.amount), reason: form.reason,
        });
      } else if (type === 'debit') {
        await api.post('/admin/funds/debit', {
          associateId: form.associateId, amount: Number(form.amount), reason: form.reason,
        });
      } else {
        await api.post('/admin/funds/transfer', {
          fromAssociateId: form.fromAssociateId, toAssociateId: form.toAssociateId,
          amount: Number(form.amount), reason: form.reason,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200';
  const titles = { credit: t('funds.credit'), debit: t('funds.debit'), transfer: t('funds.transfer') };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{titles[type]} Funds</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        {type === 'transfer' ? (
          <>
            <input name="fromAssociateId" placeholder="From Associate ID *" value={form.fromAssociateId} onChange={handleChange} required className={inputCls} />
            <input name="toAssociateId" placeholder="To Associate ID *" value={form.toAssociateId} onChange={handleChange} required className={inputCls} />
          </>
        ) : (
          <input name="associateId" placeholder="Associate ID *" value={form.associateId} onChange={handleChange} required className={inputCls} />
        )}
        <input name="amount" placeholder="Amount *" type="number" min="1" value={form.amount} onChange={handleChange} required className={inputCls} />
        <input name="reason" placeholder="Reason *" value={form.reason} onChange={handleChange} required className={inputCls} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
            {submitting ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
