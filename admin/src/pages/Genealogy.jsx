import { useState, useEffect, useRef } from 'react';
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
      setTreeData(res.data?.data || res.data?.tree || res.data);
      setLevelData(res.data?.data?.levels || res.data?.levels || []);
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
      const res = await api.get(`/admin/genealogy/business-tracking/${selectedAssociate.trim()}`);
      setBusinessData(res.data?.data || res.data);
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
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading && <p className="text-gray-500">{t('common.loading')}</p>}

      {/* Binary Tree Visualization */}
      {treeData && (
        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Binary Tree</h2>
          <TreeContainer>
            <TreeNode node={treeData} />
          </TreeContainer>
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
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <button
            onClick={fetchBusiness}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
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
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-gray-600">Paired Volume</p>
              <p className="text-lg font-bold text-amber-700">₹{Number(businessData.pairedVolume || 0).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeContainer({ children }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to center the tree horizontally on mount
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollLeft = scrollLeft;
    }
  }, [children]);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto overflow-y-auto max-h-[70vh] border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div className="inline-flex flex-col items-center py-8 px-16 min-w-max">
        {children}
      </div>
    </div>
  );
}

function TreeNode({ node }) {
  if (!node) return null;

  const statusColor = node.status === 'ACTIVE'
    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
    : node.status === 'INACTIVE'
    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
    : 'border-gray-300 bg-gray-50 dark:bg-gray-800';

  const hasChildren = node.left || node.right;

  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div className={`rounded-xl border-2 ${statusColor} px-5 py-3 text-center min-w-[160px] max-w-[180px] shadow-sm`}>
        <p className="text-sm font-bold text-gray-800 dark:text-white truncate" title={node.name}>{node.name || 'Empty'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{node.userId || '-'}</p>
        {node.status && (
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            node.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
            node.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-600'
          }`}>
            {node.status}
          </span>
        )}
      </div>

      {/* Connecting lines */}
      {hasChildren && (
        <>
          {/* Vertical line down from parent */}
          <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600" />

          {/* Horizontal connector bar */}
          <div className="relative flex items-start">
            {/* Horizontal line spanning both children */}
            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gray-300 dark:bg-gray-600" style={{ left: node.left && node.right ? '25%' : '50%', right: node.left && node.right ? '25%' : '50%' }} />

            {/* Left branch */}
            <div className="flex flex-col items-center mx-4">
              <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
              <span className="text-[10px] font-bold text-gray-400 mb-1">L</span>
              {node.left ? <TreeNode node={node.left} /> : <EmptySlot side="L" />}
            </div>

            {/* Right branch */}
            <div className="flex flex-col items-center mx-4">
              <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
              <span className="text-[10px] font-bold text-gray-400 mb-1">R</span>
              {node.right ? <TreeNode node={node.right} /> : <EmptySlot side="R" />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptySlot({ side }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 px-5 py-3 text-center min-w-[160px] max-w-[180px]">
      <p className="text-xs text-gray-400">Empty ({side})</p>
    </div>
  );
}
