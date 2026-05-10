import { useState, useEffect } from 'react';
import { Search, Users, TrendingUp } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Genealogy() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [treeData, setTreeData] = useState(null);
  const [levelData, setLevelData] = useState([]);
  const [businessData, setBusinessData] = useState(null);
  const [selectedAssociate, setSelectedAssociate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchTree(searchQuery.trim());
  };

  const fetchTree = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/genealogy/tree/${userId}`, { params: { depth: 3 } });
      setTreeData(res.data?.tree || res.data);
      setLevelData(res.data?.levels || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load genealogy');
      setTreeData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusiness = async () => {
    if (!selectedAssociate.trim()) return;
    try {
      const res = await api.get(`/admin/genealogy/business/${selectedAssociate.trim()}`);
      setBusinessData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load business data');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('genealogy.title')}</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('genealogy.search') + ' (User ID or Name)'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading && <p className="text-gray-500">{t('common.loading')}</p>}

      {/* Binary Tree Visualization */}
      {treeData && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Binary Tree</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[600px] flex flex-col items-center">
              <TreeNode node={treeData} />
            </div>
          </div>
        </div>
      )}

      {/* Level Analysis */}
      {levelData.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('genealogy.levelAnalysis')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left font-medium text-gray-600">Level</th>
                  <th className="pb-3 text-left font-medium text-gray-600">Count</th>
                  <th className="pb-3 text-left font-medium text-gray-600">Active</th>
                  <th className="pb-3 text-left font-medium text-gray-600">Volume</th>
                </tr>
              </thead>
              <tbody>
                {levelData.map((level, idx) => (
                  <tr key={idx} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="py-3 text-gray-700">{level.level}</td>
                    <td className="py-3 text-gray-700">{level.count}</td>
                    <td className="py-3 text-gray-700">{level.active}</td>
                    <td className="py-3 text-gray-700">₹{Number(level.volume || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Business Tracking */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('genealogy.businessTracking')}</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter Associate ID"
            value={selectedAssociate}
            onChange={(e) => setSelectedAssociate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            onClick={fetchBusiness}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Track
          </button>
        </div>
        {businessData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-gray-600">Left Volume</p>
              <p className="text-lg font-bold text-blue-700">₹{Number(businessData.leftVolume || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-600">Right Volume</p>
              <p className="text-lg font-bold text-green-700">₹{Number(businessData.rightVolume || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm text-gray-600">Carry Forward</p>
              <p className="text-lg font-bold text-purple-700">₹{Number(businessData.carryForward || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-4">
              <p className="text-sm text-gray-600">Paired Volume</p>
              <p className="text-lg font-bold text-indigo-700">₹{Number(businessData.pairedVolume || 0).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeNode({ node }) {
  if (!node) return null;

  const statusColor = node.status === 'ACTIVE' ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50';

  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-lg border-2 ${statusColor} px-4 py-3 text-center min-w-[140px]`}>
        <p className="text-sm font-semibold text-gray-800">{node.name || 'Empty'}</p>
        <p className="text-xs text-gray-500">{node.userId || '-'}</p>
        {node.status && (
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            node.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {node.status}
          </span>
        )}
      </div>
      {(node.left || node.right) && (
        <>
          <div className="w-px h-6 bg-gray-300" />
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-gray-300" />
              <p className="text-xs text-gray-400 mb-1">L</p>
              {node.left ? <TreeNode node={node.left} /> : <EmptySlot />}
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-gray-300" />
              <p className="text-xs text-gray-400 mb-1">R</p>
              {node.right ? <TreeNode node={node.right} /> : <EmptySlot />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-center min-w-[140px]">
      <p className="text-sm text-gray-400">Empty</p>
    </div>
  );
}
