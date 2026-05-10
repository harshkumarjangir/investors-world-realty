import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, UserCheck, UserX, X } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Associates() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAssociates();
  }, [search, statusFilter, page]);

  const fetchAssociates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/associates', {
        params: { search, status: statusFilter, page, pageSize: 15 },
      });
      setAssociates(res.data?.associates || res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load associates');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (id, action) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.patch(`/admin/associates/${id}/${action}`);
      fetchAssociates();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('associates.title')}</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          {t('associates.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('associates.search')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

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
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Joining Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Package</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">{t('common.loading')}</td>
                </tr>
              ) : associates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">{t('common.noData')}</td>
                </tr>
              ) : (
                associates.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 even:bg-gray-50 hover:bg-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-700">{a.userId}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-gray-600">{a.email}</td>
                    <td className="px-4 py-3 text-gray-600">{a.phone}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.joiningDate ? new Date(a.joiningDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.packageName || a.package || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/associates/${a.id}`)}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/associates/${a.id}`)}
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        {a.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusAction(a.id, 'activate')}
                            className="rounded p-1.5 text-green-600 hover:bg-green-50"
                            title="Activate"
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                        {a.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusAction(a.id, 'suspend')}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50"
                            title="Suspend"
                          >
                            <UserX size={15} />
                          </button>
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
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Associate Modal */}
      {showAddModal && (
        <AddAssociateModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchAssociates(); }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  };
  const cls = colors[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status || 'N/A'}
    </span>
  );
}

function AddAssociateModal({ onClose, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '',
    pincode: '', panNumber: '', sponsorId: '', placement: 'LEFT',
    packageId: '', password: '',
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
      await api.post('/admin/associates', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add associate');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('associates.add')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} required className={inputCls} />
            <input name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} required className={inputCls} />
            <input name="email" placeholder="Email *" type="email" value={form.email} onChange={handleChange} required className={inputCls} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className={inputCls} />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} className={inputCls} />
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} className={inputCls} />
            <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className={inputCls} />
            <input name="panNumber" placeholder="PAN Number" value={form.panNumber} onChange={handleChange} className={inputCls} />
            <input name="sponsorId" placeholder="Sponsor ID *" value={form.sponsorId} onChange={handleChange} required className={inputCls} />
            <select name="placement" value={form.placement} onChange={handleChange} className={inputCls}>
              <option value="LEFT">LEFT</option>
              <option value="RIGHT">RIGHT</option>
            </select>
            <input name="packageId" placeholder="Package ID *" value={form.packageId} onChange={handleChange} required className={inputCls} />
            <input name="password" placeholder="Password *" type="password" value={form.password} onChange={handleChange} required className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
