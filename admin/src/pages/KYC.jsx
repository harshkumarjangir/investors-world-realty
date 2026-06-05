import { useState, useEffect } from 'react';
import { Shield, Check, X } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const SERVER_BASE = API_BASE.replace('/api/v1', '');

function getDocViewUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function parseBankDetails(kyc) {
  const num = kyc.documentNumber || kyc.number || '';
  if (typeof num === 'string' && num.startsWith('{')) {
    try { return JSON.parse(num); } catch { return {}; }
  }
  if (typeof num === 'object' && num !== null) return num;
  return {};
}

export default function KYC() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [remarkInputs, setRemarkInputs] = useState({});

  useEffect(() => {
    fetchKYC();
  }, [page, activeTab]);

  const fetchKYC = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'PENDING' ? '/admin/kyc/pending' : `/admin/kyc/list?status=${activeTab}`;
      const res = await api.get(endpoint, { params: { page, pageSize: 20 } });
      setKycList(res.data?.data || res.data?.kyc || []);
      setTotalPages(res.data?.totalPages || 1);
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
      fetchKYC();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = remarkInputs[id] || prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/admin/kyc/${id}/reject`, { reason });
      fetchKYC();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-gold-500" />
        <h1 className="text-2xl font-bold text-gray-800">Approve KYC List</h1>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'PENDING', label: 'Pending' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-gold-500 text-gold-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Associate Id</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Associate Name</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Cheque</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Bank Name</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Branch Name</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Account No</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">IFSC</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Address Proof</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Address Proof No</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Address Proof Back</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Photograph</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Pan</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Pan Back</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Pan No.</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Approve</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Remark</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Reject</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={17} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : kycList.length === 0 ? (
                <tr><td colSpan={17} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                kycList.map((kyc) => {
                  const bank = parseBankDetails(kyc);
                  const docUrl = getDocViewUrl(kyc.documentUrl || kyc.url);
                  const docUrlBack = getDocViewUrl(kyc.documentUrlBack || kyc.urlBack);
                  const isBank = (kyc.type || kyc.documentType) === 'BANK';
                  const isPan = (kyc.type || kyc.documentType) === 'PAN';
                  const isAadhaar = (kyc.type || kyc.documentType) === 'AADHAAR';

                  return (
                    <tr key={kyc.id} className="border-b border-gray-50 even:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-gray-700">{kyc.userId || '-'}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{kyc.associateName || kyc.name || '-'}</td>
                      {/* Cheque */}
                      <td className="px-3 py-2">
                        {isBank && docUrl ? (
                          <a href={docUrl} target="_blank" rel="noopener noreferrer">
                            <img src={docUrl} alt="cheque" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* Bank Name */}
                      <td className="px-3 py-2 text-gray-600">{isBank ? (bank.bankName || '-') : '-'}</td>
                      {/* Branch */}
                      <td className="px-3 py-2 text-gray-600">{isBank ? (bank.branch || '-') : '-'}</td>
                      {/* Account No */}
                      <td className="px-3 py-2 font-mono text-gray-600">{isBank ? (bank.accountNumber || '-') : '-'}</td>
                      {/* IFSC */}
                      <td className="px-3 py-2 font-mono text-gray-600">{isBank ? (bank.ifsc || '-') : '-'}</td>
                      {/* Address Proof (Aadhaar front) */}
                      <td className="px-3 py-2">
                        {isAadhaar && docUrl ? (
                          <a href={docUrl} target="_blank" rel="noopener noreferrer">
                            <img src={docUrl} alt="address-proof" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* Address Proof No */}
                      <td className="px-3 py-2 font-mono text-gray-600">{isAadhaar ? (kyc.documentNumber || kyc.number || '-') : '-'}</td>
                      {/* Address Proof Back */}
                      <td className="px-3 py-2">
                        {isAadhaar && docUrlBack ? (
                          <a href={docUrlBack} target="_blank" rel="noopener noreferrer">
                            <img src={docUrlBack} alt="address-back" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* Photograph */}
                      <td className="px-3 py-2">
                        {kyc.profilePhoto ? (
                          <a href={getDocViewUrl(kyc.profilePhoto)} target="_blank" rel="noopener noreferrer">
                            <img src={getDocViewUrl(kyc.profilePhoto)} alt="photo" className="w-10 h-12 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* PAN image */}
                      <td className="px-3 py-2">
                        {isPan && docUrl ? (
                          <a href={docUrl} target="_blank" rel="noopener noreferrer">
                            <img src={docUrl} alt="pan" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* PAN Back image */}
                      <td className="px-3 py-2">
                        {isPan && docUrlBack ? (
                          <a href={docUrlBack} target="_blank" rel="noopener noreferrer">
                            <img src={docUrlBack} alt="pan-back" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* PAN No */}
                      <td className="px-3 py-2 font-mono text-gray-600">{isPan ? (kyc.documentNumber || kyc.number || '-') : '-'}</td>
                      {/* Approve */}
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleApprove(kyc.id)}
                          className="text-blue-600 hover:text-blue-800 text-[11px] font-medium hover:underline"
                        >
                          Approve
                        </button>
                      </td>
                      {/* Remark */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder=""
                          value={remarkInputs[kyc.id] || ''}
                          onChange={(e) => setRemarkInputs({ ...remarkInputs, [kyc.id]: e.target.value })}
                          className="w-16 rounded border border-gray-300 px-1 py-0.5 text-[10px]"
                        />
                      </td>
                      {/* Reject */}
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleReject(kyc.id)}
                          className="text-red-600 hover:text-red-800 text-[11px] font-medium hover:underline"
                        >
                          Reject
                        </button>
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
