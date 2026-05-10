import { useState, useEffect } from 'react';
import { Shield, Check, X, ExternalLink } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function KYC() {
  const { t } = useI18n();
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/kyc/pending');
      setKycList(res.data?.kyc || res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load KYC data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this KYC document?')) return;
    try {
      await api.post(`/admin/kyc/${id}/approve`);
      fetchPendingKYC();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/admin/kyc/${id}/reject`, { reason });
      fetchPendingKYC();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">{t('kyc.title')}</h1>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Associate</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Document Number</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : kycList.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                kycList.map((kyc) => (
                  <tr key={kyc.id} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{kyc.associateName || kyc.name}</p>
                      <p className="text-xs text-gray-500">{kyc.userId || kyc.associateId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-0.5 text-xs font-medium">
                        {kyc.type || kyc.documentType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{kyc.documentNumber || kyc.number || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(kyc.date || kyc.createdAt || kyc.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {kyc.documentUrl && (
                          <a
                            href={kyc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                          >
                            <ExternalLink size={12} />
                            View
                          </a>
                        )}
                        <button
                          onClick={() => handleApprove(kyc.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                        >
                          <Check size={12} />
                          {t('kyc.approve')}
                        </button>
                        <button
                          onClick={() => handleReject(kyc.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                        >
                          <X size={12} />
                          {t('kyc.reject')}
                        </button>
                      </div>
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
