import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, UserPlus, TrendingUp, Clock, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const COLORS = ['#D49428', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6"><p className="text-red-600">{error}</p></div>;
  }

  const metricCards = metrics ? [
    { label: t('dashboard.totalAssociates'), value: metrics.totalAssociates || 0, icon: Users, bg: 'bg-blue-500', change: '' },
    { label: t('dashboard.activeAssociates'), value: metrics.activeAssociates || 0, icon: UserCheck, bg: 'bg-emerald-500', change: metrics.changes?.registrations || '' },
    { label: t('dashboard.inactiveAssociates'), value: metrics.inactiveAssociates || 0, icon: UserX, bg: 'bg-gold-400', change: '' },
    { label: t('dashboard.todayRegistrations'), value: metrics.todayRegistrations || 0, icon: UserPlus, bg: 'bg-purple-500', change: metrics.changes?.thisWeekRegistrations ? `+${metrics.changes.thisWeekRegistrations} this week` : '' },
    { label: t('dashboard.businessVolume'), value: `₹${Number(metrics.totalBusinessVolume || 0).toLocaleString('en-IN')}`, icon: TrendingUp, bg: 'bg-gold-400', change: '' },
    { label: t('dashboard.pendingWithdrawals'), value: `₹${Number(metrics.pendingWithdrawals || 0).toLocaleString('en-IN')}`, icon: Clock, bg: 'bg-orange-500', change: '' },
    { label: t('dashboard.totalPayouts'), value: `₹${Number(metrics.totalPayoutDisbursed || 0).toLocaleString('en-IN')}`, icon: DollarSign, bg: 'bg-teal-500', change: metrics.changes?.payouts || '' },
  ] : [];

  // Chart data
  const pieData = metrics ? [
    { name: 'Active', value: metrics.activeAssociates || 0 },
    { name: 'Inactive', value: metrics.inactiveAssociates || 0 },
    { name: 'Suspended', value: metrics.suspendedAssociates || 0 },
    { name: 'Red', value: metrics.redAssociates || 0 },
  ].filter(d => d.value > 0) : [];

  // Use real weekly data from API
  const weeklyData = metrics?.weeklyData || [];

  // Transaction type distribution for bar chart
  const txTypeCount = {};
  transactions.forEach(tx => {
    const type = (tx.type || 'OTHER').replace(/_/g, ' ');
    txTypeCount[type] = (txTypeCount[type] || 0) + 1;
  });
  const barData = Object.entries(txTypeCount).map(([name, count]) => ({ name: name.slice(0, 12), count }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity size={16} />
          <span>Live</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  {card.change && (
                    <p className={`text-xs mt-1 font-medium ${card.change.startsWith('+') ? 'text-green-600' : card.change.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                      {card.change} this week
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Weekly Registrations */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Weekly Registrations & Income</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D49428" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D49428" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Area yAxisId="left" type="monotone" dataKey="registrations" stroke="#D49428" fill="url(#colorReg)" strokeWidth={2} name="Registrations" />
              <Area yAxisId="right" type="monotone" dataKey="income" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={2} name="Income (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Associate Status */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Associate Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">No data</div>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart - Transaction Types */}
      {barData.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Transaction Type Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="count" fill="#D49428" radius={[4, 4, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          {t('dashboard.recentTransactions')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-medium text-gray-500">Date</th>
                <th className="pb-3 font-medium text-gray-500">Type</th>
                <th className="pb-3 font-medium text-gray-500">Amount</th>
                <th className="pb-3 font-medium text-gray-500">Associate</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                transactions.slice(0, 10).map((tx, idx) => (
                  <tr key={tx.id || idx} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-700">{new Date(tx.date || tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-gold-50 text-gold-600 text-xs font-medium">
                        {(tx.type || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-gray-800">₹{Number(tx.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-gray-600">{tx.associateName || tx.associateUserId || '-'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{tx.status || 'N/A'}</span>
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
