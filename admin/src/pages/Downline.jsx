import { useState } from 'react';
import { GitBranch, Download } from 'lucide-react';
import api from '../common/api.js';

export default function Downline() {
  const [activeTab, setActiveTab] = useState('direct');
  const [associateId, setAssociateId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleShow = async () => {
    if (!associateId.trim()) { alert('Enter Associate ID'); return; }
    try {
      setLoading(true);
      setSearched(true);
      const endpoint = activeTab === 'direct'
        ? `/admin/genealogy/tree/${associateId.trim()}?depth=1`
        : `/admin/genealogy/tree/${associateId.trim()}?depth=10`;
      const res = await api.get(endpoint);
      const tree = res.data?.data || res.data;
      // Flatten tree to list
      const list = [];
      flattenTree(tree, list, associateId.trim());
      setResults(list);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load downline');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  function flattenTree(node, list, parentId) {
    if (!node) return;
    // Skip the root node itself (only show downlines)
    const children = [];
    if (node.left) children.push(node.left);
    if (node.right) children.push(node.right);
    if (node.children) children.push(...node.children);

    for (const child of children) {
      list.push({
        userId: child.userId || '-',
        name: child.name || '-',
        sponsorId: parentId,
        phone: child.phone || '-',
        status: child.status || '-',
        joiningDate: child.joiningDate || child.createdAt || '',
        rank: child.rank || 1,
        totalAreaSold: child.totalAreaSold || 0,
      });
      if (activeTab === 'all') {
        flattenTree(child, list, child.userId);
      }
    }
  }

  const exportExcel = () => {
    alert('Export feature — use Reports > Export for full data');
  };

  const tabs = [
    { key: 'direct', label: 'Downline Direct' },
    { key: 'all', label: 'Downline Direct All' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 lg:hidden">
        <GitBranch size={24} className="text-gold-500" />
        <h1 className="text-2xl font-bold text-gray-800">
          {activeTab === 'direct' ? 'Team Direct' : 'Downline Direct All'}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setResults([]); setSearched(false); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-gold-500 text-gold-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Associate ID</label>
            <input
              type="text"
              placeholder="IWR100001"
              value={associateId}
              onChange={(e) => setAssociateId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
            />
          </div>
          <button
            onClick={handleShow}
            disabled={loading}
            className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Show'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Associate Detail of <strong>{associateId}</strong>
          </p>

          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">S.No</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Associate ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Associate Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Sponsor ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Mobile</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Paid Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Total Area Sold</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Self Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Down Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr><td colSpan={10} className="py-8 text-center text-gray-400">No downline found</td></tr>
                  ) : (
                    results.map((r, idx) => (
                      <tr key={r.userId + idx} className="border-b border-gray-50 even:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono text-gold-600 font-medium">{r.userId}</td>
                        <td className="px-4 py-3 text-gray-800">{r.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{r.sponsorId}</td>
                        <td className="px-4 py-3 text-gray-600">{r.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            r.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {r.joiningDate ? new Date(r.joiningDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{r.totalAreaSold} gaj</td>
                        <td className="px-4 py-3 text-gray-700">0.00</td>
                        <td className="px-4 py-3 text-gray-700">0.00</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gold-600 font-medium">Total Associate {results.length}</span>
            <button
              onClick={exportExcel}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <span className="flex items-center gap-1"><Download size={14} /> Export to Excel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
