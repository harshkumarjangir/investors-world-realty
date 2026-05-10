import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, UserPlus, TrendingUp, Clock, DollarSign } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Dashboard() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, txRes] = await Promise.all([
        api.get('/admin/dashboard/'),
        api.get('/admin/dashboard/recent-transactions'),
      ]);
      setMetrics(dashRes.data?.data || dashRes.data);
      setTransactions(txRes.data?.data || txRes.data?.transactions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const metricCards = metrics
    ? [
        { label: t('dashboard.totalAssociates'), value: metrics.totalAssociates, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: t('dashboard.activeAssociates'), value: metrics.activeAssociates, icon: UserCheck, bg: 'bg-green-50', color: 'text-green-600' },
        { label: t('dashboard.inactiveAssociates'), value: metrics.inactiveAssociates, icon: UserX, bg: 'bg-orange-50', color: 'text-orange-600' },
        { label: t('dashboard.todayRegistrations'), value: metrics.todayRegistrations, icon: UserPlus, bg: 'bg-purple-50', color: 'text-purple-600' },
        { label: t('dashboard.businessVolume'), value: `₹${Number(metrics.businessVolume || 0).toLocaleString()}`, icon: TrendingUp, bg: 'bg-indigo-50', color: 'text-indigo-600' },
        { label: t('dashboard.pendingWithdrawals'), value: metrics.pendingWithdrawals, icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600' },
        { label: t('dashboard.totalPayouts'), value: `₹${Number(metrics.totalPayouts || 0).toLocaleString()}`, icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-xl p-6 shadow-sm border border-gray-100 ${card.bg}`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${card.color} bg-white/60`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('dashboard.recentTransactions')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-medium text-gray-600">Date</th>
                <th className="pb-3 font-medium text-gray-600">Type</th>
                <th className="pb-3 font-medium text-gray-600">Amount</th>
                <th className="pb-3 font-medium text-gray-600">Associate</th>
                <th className="pb-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 20).map((tx, idx) => (
                  <tr key={tx.id || idx} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="py-3 text-gray-700">
                      {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-700">{tx.type}</td>
                    <td className="py-3 font-medium text-gray-800">
                      ₹{Number(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-gray-700">{tx.associateName || tx.userId || '-'}</td>
                    <td className="py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
  };
  const cls = colors[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status || 'N/A'}
    </span>
  );
}
