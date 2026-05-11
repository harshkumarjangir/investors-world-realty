import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserX, Mail, Phone, MapPin, Calendar, Wallet } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function AssociateDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssociate();
  }, [id]);

  const fetchAssociate = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/associates/${id}`);
      setAssociate(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load associate details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.patch(`/admin/associates/${id}/${action}`);
      fetchAssociate();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

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

  if (!associate) return null;

  const incomeSummary = [
    { label: 'Direct Income', value: associate.incomeSummary?.DIRECT || associate.directIncome || 0 },
    { label: 'Level Income', value: associate.incomeSummary?.LEVEL || associate.levelIncome || 0 },
    { label: 'Matching Income', value: associate.incomeSummary?.MATCHING || associate.binaryIncome || 0 },
    { label: 'Total Income', value: Object.values(associate.incomeSummary || {}).reduce((s, v) => s + Number(v || 0), 0) || associate.totalIncome || 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/associates')}
          className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{associate.name}</h1>
          <p className="text-sm text-gray-500">ID: {associate.userId}</p>
        </div>
        <div className="flex gap-2">
          {associate.status !== 'ACTIVE' && (
            <button
              onClick={() => handleAction('activate')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <UserCheck size={16} />
              {t('associates.activate')}
            </button>
          )}
          {associate.status === 'ACTIVE' && (
            <button
              onClick={() => handleAction('suspend')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <UserX size={16} />
              {t('associates.suspend')}
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Mail} label="Email" value={associate.email} />
            <InfoRow icon={Phone} label="Phone" value={associate.phone} />
            <InfoRow icon={MapPin} label="Address" value={`${associate.city || ''} ${associate.state || ''}`} />
            <InfoRow icon={Calendar} label="Joining Date" value={associate.joiningDate ? new Date(associate.joiningDate).toLocaleDateString() : '-'} />
            <InfoRow icon={Wallet} label="Package" value={associate.packageName || associate.package?.name || '-'} />
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Status:</span>
              <StatusBadge status={associate.status} />
            </div>
          </div>
        </div>

        {/* KYC Status */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">KYC Status</h2>
          <div className="space-y-3">
            <KycItem label="PAN Card" status={associate.panVerified || associate.kycPan || 'PENDING'} />
            <KycItem label="Aadhaar" status={associate.aadhaarVerified || associate.kycAadhaar || 'PENDING'} />
            <KycItem label="Bank Account" status={associate.bankVerified || associate.kycBank || 'PENDING'} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Wallet Balance</p>
            <p className="text-2xl font-bold text-indigo-600">
              ₹{Number(associate.wallet?.balance || associate.walletBalance || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Income Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {incomeSummary.map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-xl font-bold text-gray-800 mt-1">
              ₹{Number(item.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Team Stats */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Left Count" value={associate.teamStats?.leftCount || associate.leftCount || 0} />
          <StatCard label="Right Count" value={associate.teamStats?.rightCount || associate.rightCount || 0} />
          <StatCard label="Left Volume" value={`₹${Number(associate.teamStats?.leftVolume || associate.leftVolume || 0).toLocaleString()}`} />
          <StatCard label="Right Volume" value={`₹${Number(associate.teamStats?.rightVolume || associate.rightVolume || 0).toLocaleString()}`} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value || '-'}</p>
      </div>
    </div>
  );
}

function KycItem({ label, status }) {
  const colors = {
    VERIFIED: 'bg-green-100 text-green-700',
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  const cls = colors[status] || 'bg-gray-100 text-gray-700';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{status}</span>
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
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{status || 'N/A'}</span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
