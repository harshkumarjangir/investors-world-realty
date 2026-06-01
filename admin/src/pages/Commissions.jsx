import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Commissions() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('slabs');
  const [slabs, setSlabs] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSlabForm, setShowSlabForm] = useState(false);
  const [editingSlab, setEditingSlab] = useState(null);

  useEffect(() => {
    if (activeTab === 'slabs') fetchSlabs();
    else fetchCommissions();
  }, [activeTab]);

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/commissions/slabs');
      setSlabs(res.data?.data || []);
    } catch { setSlabs([]); }
    finally { setLoading(false); }
  };

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'pending' ? 'PENDING' : undefined;
      const endpoint = activeTab === 'pending' ? '/admin/commissions/pending' : '/admin/commissions/all';
      const res = await api.get(endpoint);
      setCommissions(res.data?.data || []);
    } catch { setCommissions([]); }
    finally { setLoading(false); }
  };

  const handleDeleteSlab = async (id) => {
    if (!confirm('Delete this commission slab?')) return;
    try {
      await api.delete(`/admin/commissions/slabs/${id}`);
      fetchSlabs();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this commission? Amount will be credited to wallet.')) return;
    try {
      await api.post(`/admin/commissions/${id}/approve`);
      fetchCommissions();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this commission?')) return;
    try {
      await api.post(`/admin/commissions/${id}/reject`);
      fetchCommissions();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const tabs = [
    { key: 'slabs', label: 'Commission Slabs' },
    { key: 'pending', label: 'Pending Approvals' },
    { key: 'all', label: 'All Commissions' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign size={24} className="text-gold-500" />
          <h1 className="text-2xl font-bold text-gray-800">Property Commissions</h1>
        </div>
        {activeTab === 'slabs' && (
          <button
            onClick={() => { setEditingSlab(null); setShowSlabForm(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-600"
          >
            <Plus size={16} /> Add Slab
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-gold-500 text-gold-500' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Slabs Tab */}
      {activeTab === 'slabs' && (
        <>
          {showSlabForm && (
            <SlabForm
              slab={editingSlab}
              onClose={() => { setShowSlabForm(false); setEditingSlab(null); }}
              onSuccess={() => { setShowSlabForm(false); setEditingSlab(null); fetchSlabs(); }}
            />
          )}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Area Range (gaj)</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L1 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L2 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L3 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L4 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L5 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L6 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L7 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L8 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L9 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">L10 %</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Active</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={13} className="py-8 text-center text-gray-400">Loading...</td></tr>
                  ) : slabs.length === 0 ? (
                    <tr><td colSpan={13} className="py-8 text-center text-gray-400">No slabs configured</td></tr>
                  ) : (
                    slabs.map((slab) => (
                      <tr key={slab.id} className="border-b border-gray-50 even:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{Number(slab.minArea).toLocaleString()} - {Number(slab.maxArea).toLocaleString()}</td>
                        <td className="px-4 py-3">{Number(slab.sellerPercent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level1Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level2Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level3Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level4Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level5Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level6Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level7Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level8Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">{Number(slab.level9Percent).toFixed(1)}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${slab.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {slab.isActive ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingSlab(slab); setShowSlabForm(true); }} className="p-1.5 rounded text-gray-600 hover:bg-gray-100"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteSlab(slab.id)} className="p-1.5 rounded text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Commissions Tab (Pending / All) */}
      {(activeTab === 'pending' || activeTab === 'all') && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Associate</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Level</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Area (gaj)</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Property Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Rate</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Commission</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  {activeTab === 'pending' && <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="py-8 text-center text-gray-400">Loading...</td></tr>
                ) : commissions.length === 0 ? (
                  <tr><td colSpan={9} className="py-8 text-center text-gray-400">No commissions found</td></tr>
                ) : (
                  commissions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 even:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-800">{c.associateId?.slice(0, 8)}...</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.level === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {c.level === 0 ? 'Seller' : `Level ${c.level}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">{Number(c.propertyArea).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium">₹{Number(c.propertyPrice).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">{c.percentage}%</td>
                      <td className="px-4 py-3 font-bold text-green-700">₹{Number(c.commissionAmount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-600'
                        }`}>{c.status}</span>
                      </td>
                      {activeTab === 'pending' && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => handleApprove(c.id)} className="p-1.5 rounded bg-green-600 text-white hover:bg-green-700"><Check size={14} /></button>
                            <button onClick={() => handleReject(c.id)} className="p-1.5 rounded bg-red-600 text-white hover:bg-red-700"><X size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SlabForm({ slab, onClose, onSuccess }) {
  const [form, setForm] = useState({
    minArea: slab?.minArea || '', maxArea: slab?.maxArea || '',
    sellerPercent: slab?.sellerPercent || '',
    level1Percent: slab?.level1Percent || '', level2Percent: slab?.level2Percent || '',
    level3Percent: slab?.level3Percent || '', level4Percent: slab?.level4Percent || '',
    level5Percent: slab?.level5Percent || '', level6Percent: slab?.level6Percent || '',
    level7Percent: slab?.level7Percent || '', level8Percent: slab?.level8Percent || '',
    level9Percent: slab?.level9Percent || '', level10Percent: slab?.level10Percent || '',
    isActive: slab?.isActive ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const data = {
        ...form,
        minArea: Number(form.minArea), maxArea: Number(form.maxArea),
        sellerPercent: Number(form.sellerPercent),
        level1Percent: Number(form.level1Percent), level2Percent: Number(form.level2Percent),
        level3Percent: Number(form.level3Percent), level4Percent: Number(form.level4Percent),
        level5Percent: Number(form.level5Percent), level6Percent: Number(form.level6Percent),
        level7Percent: Number(form.level7Percent), level8Percent: Number(form.level8Percent),
        level9Percent: Number(form.level9Percent), level10Percent: Number(form.level10Percent),
      };
      if (slab?.id) {
        await api.patch(`/admin/commissions/slabs/${slab.id}`, data);
      } else {
        await api.post('/admin/commissions/slabs', data);
      }
      onSuccess();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200';

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{slab ? 'Edit' : 'Add'} Commission Slab</h3>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min Area (gaj)</label>
            <input type="number" value={form.minArea} onChange={(e) => setForm({ ...form, minArea: e.target.value })} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Area (gaj)</label>
            <input type="number" value={form.maxArea} onChange={(e) => setForm({ ...form, maxArea: e.target.value })} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Seller %</label>
            <input type="number" step="0.01" value={form.sellerPercent} onChange={(e) => setForm({ ...form, sellerPercent: e.target.value })} required className={inputCls} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              Active
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1,2,3,4,5,6,7,8,9,10].map((lvl) => (
            <div key={lvl}>
              <label className="block text-xs text-gray-500 mb-1">Level {lvl} %</label>
              <input type="number" step="0.01" value={form[`level${lvl}Percent`]} onChange={(e) => setForm({ ...form, [`level${lvl}Percent`]: e.target.value })} required className={inputCls} />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
