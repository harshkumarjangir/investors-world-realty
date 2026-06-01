import { useState, useEffect } from 'react';
import { Award, Search, ChevronUp } from 'lucide-react';
import api from '../common/api.js';

const RANK_NAMES = [
  '',
  'Business Associate',
  'Business Adviser',
  'Business Head',
  'Dist. Business Head',
  'State Business Head',
  'Regional Business Head',
  'National Business Head',
  'Vice President Sales',
  'President Sales',
  'President Club',
];

const RANK_COLORS = [
  '',
  'bg-gray-100 text-gray-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-gold-100 text-gold-600',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-pink-100 text-pink-700',
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-yellow-100 text-yellow-800',
];

export default function Promotions() {
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAssociates();
  }, [page, search]);

  const fetchAssociates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/associates', {
        params: { search, page, pageSize: 20, status: 'ACTIVE' },
      });
      setAssociates(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load associates', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (id, currentRank) => {
    if (currentRank >= 10) {
      alert('Already at highest rank (President Club)');
      return;
    }
    if (!confirm(`Promote to ${RANK_NAMES[currentRank + 1]}?`)) return;
    try {
      await api.patch(`/admin/associates/${id}`, { rank: currentRank + 1 });
      fetchAssociates();
    } catch (err) {
      alert(err.response?.data?.message || 'Promotion failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Award size={24} className="text-gold-500" />
        <h1 className="text-2xl font-bold text-gray-800">Promotions & Ranks</h1>
      </div>

      {/* Rank Legend */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Rank Hierarchy</h3>
        <div className="flex flex-wrap gap-2">
          {RANK_NAMES.slice(1).map((name, idx) => (
            <span key={name} className={`rounded-full px-3 py-1 text-xs font-medium ${RANK_COLORS[idx + 1]}`}>
              L{idx + 1}: {name}
            </span>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <strong>Promotion criteria:</strong> L1→L2: Sell 500 gaj personally | L2+: 3 direct downlines each sell 500 gaj
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or user ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">User ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Current Rank</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Area Sold (gaj)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Direct Downlines</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : associates.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No associates found</td></tr>
              ) : (
                associates.map((a) => {
                  const rank = a.rank || 1;
                  return (
                    <tr key={a.id} className="border-b border-gray-50 even:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-700">{a.userId}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RANK_COLORS[rank]}`}>
                          L{rank}: {RANK_NAMES[rank]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{(a.totalAreaSold || 0).toLocaleString()} gaj</td>
                      <td className="px-4 py-3 text-gray-700">{a.directDownlines || '-'}</td>
                      <td className="px-4 py-3">
                        {rank < 10 && (
                          <button
                            onClick={() => handlePromote(a.id, rank)}
                            className="inline-flex items-center gap-1 rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gold-600"
                          >
                            <ChevronUp size={12} />
                            Promote
                          </button>
                        )}
                        {rank >= 10 && (
                          <span className="text-xs text-gray-400">Max rank</span>
                        )}
                      </td>
                    </tr>
                  );
                })
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
  );
}
