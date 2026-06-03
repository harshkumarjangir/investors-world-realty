import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, UserCheck, UserX, X } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const RANK_OPTIONS = [
  { value: '', label: 'All Ranks' },
  { value: '1',  label: 'R1 — Business Associate' },
  { value: '2',  label: 'R2 — Business Adviser' },
  { value: '3',  label: 'R3 — Business Head' },
  { value: '4',  label: 'R4 — Dist. Business Head' },
  { value: '5',  label: 'R5 — State Business Head' },
  { value: '6',  label: 'R6 — Regional Business Head' },
  { value: '7',  label: 'R7 — National Business Head' },
  { value: '8',  label: 'R8 — Vice President Sales' },
  { value: '9',  label: 'R9 — President Sales' },
  { value: '10', label: 'R10 — President Club' },
];

export default function Associates() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssociate, setEditingAssociate] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [associateId, setAssociateId] = useState('');
  const [associateName, setAssociateName] = useState('');
  const [approveFrom, setApproveFrom] = useState('');
  const [approveTo, setApproveTo] = useState('');

  // Re-fetch whenever any filter or page changes
  useEffect(() => {
    fetchAssociates();
  }, [statusFilter, rankFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAssociates = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/associates', {
        params: {
          search:       search || associateName || associateId || undefined,
          status:       statusFilter || undefined,
          rank:         rankFilter || undefined,
          page,
          pageSize:     15,
          fromDate:     fromDate || undefined,
          toDate:       toDate || undefined,
          approveFrom:  approveFrom || undefined,
          approveTo:    approveTo || undefined,
        },
      });
      setAssociates(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalItems(res.data?.totalItems || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load associates');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); fetchAssociates(); };

  const handleClear = () => {
    setStatusFilter('');
    setRankFilter('');
    setSearch('');
    setFromDate('');
    setToDate('');
    setAssociateId('');
    setAssociateName('');
    setApproveFrom('');
    setApproveTo('');
    setPage(1);
  };

  const handleStatusAction = async (id, action) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.post(`/admin/associates/${id}/${action}`);
      fetchAssociates();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const inputCls = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('associates.title')}</h1>
        <button
          onClick={() => { setEditingAssociate(null); setShowAddModal(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-600 transition-colors"
        >
          <Plus size={16} />
          {t('associates.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
        {/* Primary filters row */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls}>
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Rank</label>
            <select
              value={rankFilter}
              onChange={(e) => { setRankFilter(e.target.value); setPage(1); }}
              className={inputCls}
            >
              {RANK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSearch} className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-medium text-white hover:bg-gold-600">
            Search
          </button>
          <button onClick={handleClear} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Clear
          </button>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-gold-500 hover:text-gold-600 whitespace-nowrap">
            {showAdvanced ? 'Hide Advanced' : 'Advanced Search'}
          </button>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="flex flex-wrap gap-3 items-end pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Associate ID</label>
              <input type="text" placeholder="IW100001" value={associateId} onChange={(e) => setAssociateId(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name / Email / Phone</label>
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Activation From</label>
              <input type="date" value={approveFrom} onChange={(e) => setApproveFrom(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Activation To</label>
              <input type="date" value={approveTo} onChange={(e) => setApproveTo(e.target.value)} className={inputCls} />
            </div>
            <button onClick={handleSearch} className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-medium text-white hover:bg-gold-600">
              Search
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Record count */}
      {totalItems > 0 && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{associates.length}</span> of <span className="font-medium text-gray-700">{totalItems}</span> associates
          {rankFilter && <span className="ml-2 text-gold-600 font-medium">— {RANK_OPTIONS.find(o => o.value === rankFilter)?.label}</span>}
        </p>
      )}

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">User ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Rank</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Sponsor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Joining Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : associates.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                associates.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 even:bg-gray-50 hover:bg-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-700">{a.userId}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{a.email}</td>
                    <td className="px-4 py-3 text-gray-600">{a.phone}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <span className="rounded-full bg-gold-100 text-gold-700 px-2 py-0.5 text-xs font-semibold">R{a.rank}</span>
                        <span className="text-xs text-gray-500 hidden xl:inline">{a.rankName}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.sponsorUserId || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {a.joiningDate ? new Date(a.joiningDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/associates/${a.id}`)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50" title="View"><Eye size={15} /></button>
                        <button onClick={() => { setEditingAssociate(a); setShowAddModal(true); }} className="rounded p-1.5 text-gray-600 hover:bg-gray-100" title="Edit"><Edit size={15} /></button>
                        {a.status !== 'ACTIVE' && (
                          <button onClick={() => handleStatusAction(a.id, 'activate')} className="rounded p-1.5 text-green-600 hover:bg-green-50" title="Activate"><UserCheck size={15} /></button>
                        )}
                        {a.status === 'ACTIVE' && (
                          <button onClick={() => handleStatusAction(a.id, 'suspend')} className="rounded p-1.5 text-red-600 hover:bg-red-50" title="Suspend"><UserX size={15} /></button>
                        )}
                      </div>
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
        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      </div>

      {showAddModal && (
        <AddAssociateModal
          associate={editingAssociate}
          onClose={() => { setShowAddModal(false); setEditingAssociate(null); }}
          onSuccess={() => { setShowAddModal(false); setEditingAssociate(null); fetchAssociates(); }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { ACTIVE: 'bg-green-100 text-green-700', INACTIVE: 'bg-gray-100 text-gray-700', SUSPENDED: 'bg-red-100 text-red-700' };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status || 'N/A'}</span>;
}

function AddAssociateModal({ associate, onClose, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: associate?.name || '', phone: associate?.phone || '', email: associate?.email || '',
    address: associate?.address || '', city: associate?.city || '', state: associate?.state || '',
    pincode: associate?.pincode || '', panNumber: associate?.panNumber || '',
    sponsorId: associate?.sponsorUserId || '', password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (associate?.id) {
        await api.patch(`/admin/associates/${associate.id}`, form);
      } else {
        await api.post('/admin/associates', form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save associate');
    } finally {
      setSubmitting(false);
    }
  };

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{associate ? t('associates.edit') : t('associates.add')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required className={inp} />
            <input name="phone" placeholder="Phone *" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required className={inp} />
            <input name="email" placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required className={inp} />
            <input name="address" placeholder="Address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className={inp} />
            <input name="city" placeholder="City" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className={inp} />
            <input name="state" placeholder="State" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className={inp} />
            <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})} className={inp} />
            <input name="panNumber" placeholder="PAN Number" value={form.panNumber} onChange={(e) => setForm({...form, panNumber: e.target.value})} className={inp} />
            {!associate && (
              <>
                <input name="sponsorId" placeholder="Sponsor ID (e.g. IW100002) *" value={form.sponsorId} onChange={(e) => setForm({...form, sponsorId: e.target.value})} required className={inp} />
                <input name="password" placeholder="Password *" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required className={inp} />
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50">
              {submitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
