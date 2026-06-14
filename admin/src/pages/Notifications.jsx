import { useState, useEffect } from 'react';
import { Bell, Send } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Notifications() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: '', message: '', target: 'all', targetIds: '',
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/notifications/history', { params: { page, pageSize: 20 } });
      setHistory(res.data?.data || res.data?.notifications || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load notification history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      setError('');
      setSuccess('');
      const payload = {
        title: form.title,
        message: form.message,
        target: form.target,
        targetIds: form.target === 'specific' ? form.targetIds.split(',').map((s) => s.trim()) : undefined,
      };
      await api.post('/admin/notifications', payload);
      setSuccess('Notification sent successfully');
      setForm({ title: '', message: '', target: 'all', targetIds: '' });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell size={24} className="text-gold-500" />
        <h1 className="text-2xl font-bold text-gray-800">{t('notifications.title')}</h1>
      </div>

      {/* Send Notification Form */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('notifications.send')}</h2>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-3 text-sm text-green-600">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              placeholder="Notification title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              placeholder="Notification message"
              value={form.message}
              onChange={handleChange}
              required
              rows={3}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <select name="target" value={form.target} onChange={handleChange} className={inputCls}>
                <option value="all">All Associates</option>
                <option value="specific">Specific Associates</option>
              </select>
            </div>
            {form.target === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associate IDs (comma separated)
                </label>
                <input
                  name="targetIds"
                  placeholder="ID1, ID2, ID3"
                  value={form.targetIds}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50"
            >
              <Send size={16} />
              {sending ? t('common.loading') : 'Send'}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('notifications.history')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left font-medium text-gray-600">Date</th>
                <th className="pb-3 text-left font-medium text-gray-600">Title</th>
                <th className="pb-3 text-left font-medium text-gray-600">Target</th>
                <th className="pb-3 text-left font-medium text-gray-600">Admin</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                history.map((n, idx) => (
                  <tr key={n.id || idx} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="py-3 text-gray-700">
                      {new Date(n.date || n.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-800 font-medium">{n.title}</td>
                    <td className="py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="w-fit rounded-full bg-gold-100 text-gold-600 px-2.5 py-0.5 text-xs font-medium capitalize">
                          {n.target || 'all'}
                        </span>
                        {n.targetDetails && n.targetDetails !== 'all' && (
                          <span className="text-xs text-gray-500 font-normal truncate max-w-[180px]" title={n.targetDetails}>
                            {n.targetDetails}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{n.adminName || n.admin || '-'}</td>
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
