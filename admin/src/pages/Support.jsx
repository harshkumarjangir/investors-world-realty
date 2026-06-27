import { useState, useEffect } from 'react';
import { Headphones, X, Send, Search } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const STATUS_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

const STATUS_STYLES = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-700',
};

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString();
}

export default function Support() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [statusValue, setStatusValue] = useState('OPEN');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [page, activeTab, search]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/support', {
        params: {
          page,
          pageSize: 20,
          status: activeTab,
          ...(search ? { search } : {}),
        },
      });
      setTickets(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (id) => {
    setSelectedId(id);
    setReplyText('');
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/support/${id}`);
      const ticket = res.data?.data;
      setTicketDetail(ticket);
      setStatusValue(ticket?.status || 'OPEN');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load ticket');
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setTicketDetail(null);
    setReplyText('');
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId) return;
    try {
      setSubmitting(true);
      const res = await api.post(`/admin/support/${selectedId}/reply`, { message: replyText.trim() });
      setTicketDetail(res.data?.data);
      setStatusValue(res.data?.data?.status || statusValue);
      setReplyText('');
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedId) return;
    setStatusValue(newStatus);
    try {
      const res = await api.patch(`/admin/support/${selectedId}/status`, { status: newStatus });
      setTicketDetail(res.data?.data);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
      setStatusValue(ticketDetail?.status || 'OPEN');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 lg:hidden">
        <Headphones size={24} className="text-gold-500" />
        <h1 className="text-2xl font-bold text-gray-800">{t('support.title')}</h1>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('support.searchPlaceholder')}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600"
        >
          {t('support.search')}
        </button>
      </form>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-gold-500 text-gold-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('support.ticketNo')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('support.subject')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('support.associate')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('support.status')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('support.updated')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">{t('common.view')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">{t('common.loading')}</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">{t('common.noData')}</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{ticket.ticketNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{ticket.subject}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{ticket.associate?.name || '-'}</div>
                      <div className="text-xs text-gray-400">{ticket.associate?.userId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN}`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(ticket.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openTicket(ticket.id)}
                        className="text-gold-600 hover:text-gold-700 text-sm font-medium"
                      >
                        {t('common.view')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {ticketDetail?.ticketNumber || t('support.ticket')}
                </h2>
                <p className="text-sm text-gray-500">{ticketDetail?.subject}</p>
              </div>
              <button type="button" onClick={closeDetail} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            {detailLoading ? (
              <p className="py-12 text-center text-gray-400">{t('common.loading')}</p>
            ) : ticketDetail ? (
              <>
                <div className="px-5 py-3 border-b border-gray-50 bg-gray-50 text-sm shrink-0">
                  <p>
                    <span className="font-medium text-gray-700">{t('support.associate')}:</span>{' '}
                    {ticketDetail.associate?.name} ({ticketDetail.associate?.userId})
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {ticketDetail.associate?.email} · {ticketDetail.associate?.phone}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-600">{t('support.status')}:</label>
                    <select
                      value={statusValue}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      {STATUS_TABS.filter((s) => s.key !== 'ALL').map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
                  {(ticketDetail.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        msg.senderType === 'admin'
                          ? 'bg-gold-50 border border-gold-100 ml-4'
                          : 'bg-gray-50 border border-gray-100 mr-4'
                      }`}
                    >
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-medium capitalize">
                          {msg.senderType === 'admin' ? t('support.admin') : t('support.associate')}
                        </span>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {statusValue !== 'CLOSED' && (
                  <form onSubmit={handleReply} className="border-t border-gray-100 px-5 py-4 shrink-0 space-y-2">
                    <label className="block text-xs font-medium text-gray-600">{t('support.reply')}</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      required
                      placeholder={t('support.replyPlaceholder')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !replyText.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50"
                      >
                        <Send size={16} />
                        {submitting ? t('common.loading') : t('support.sendReply')}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
