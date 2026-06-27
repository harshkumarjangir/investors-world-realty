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
      <div className="flex items-center gap-3 lg:hidden">
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
              ) : (() => {
                const grouped = {};
                kycList.forEach((kyc) => {
                  const assocId = kyc.associateId;
                  if (!grouped[assocId]) {
                    grouped[assocId] = {
                      userId: kyc.userId,
                      associateId: kyc.associateId,
                      associateName: kyc.associateName || kyc.name,
                      profilePhoto: kyc.profilePhoto,
                      phone: kyc.phone,
                      documents: {},
                    };
                  }
                  grouped[assocId].documents[kyc.type] = kyc;
                });
                const groupedList = Object.values(grouped);

                return groupedList.map((group) => {
                  const bankDoc = group.documents.BANK;
                  const aadhaarDoc = group.documents.AADHAAR;
                  const panDoc = group.documents.PAN;

                  const bank = bankDoc ? parseBankDetails(bankDoc) : {};
                  const bankDocUrl = bankDoc ? getDocViewUrl(bankDoc.documentUrl || bankDoc.url) : null;
                  
                  const aadhaarDocUrl = aadhaarDoc ? getDocViewUrl(aadhaarDoc.documentUrl || aadhaarDoc.url) : null;
                  const aadhaarDocUrlBack = aadhaarDoc ? getDocViewUrl(aadhaarDoc.documentUrlBack || aadhaarDoc.urlBack) : null;

                  const panDocUrl = panDoc ? getDocViewUrl(panDoc.documentUrl || panDoc.url) : null;
                  const panDocUrlBack = panDoc ? getDocViewUrl(panDoc.documentUrlBack || panDoc.urlBack) : null;

                  return (
                    <tr key={group.associateId} className="border-b border-gray-50 even:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-gray-700">{group.userId || '-'}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{group.associateName || '-'}</td>
                      {/* Cheque */}
                      <td className="px-3 py-2">
                        {bankDocUrl ? (
                          <a href={bankDocUrl} target="_blank" rel="noopener noreferrer">
                            <img src={bankDocUrl} alt="cheque" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* Bank Name */}
                      <td className="px-3 py-2 text-gray-600">{bankDoc ? (bank.bankName || '-') : '-'}</td>
                      {/* Branch */}
                      <td className="px-3 py-2 text-gray-600">{bankDoc ? (bank.branch || '-') : '-'}</td>
                      {/* Account No */}
                      <td className="px-3 py-2 font-mono text-gray-600">{bankDoc ? (bank.accountNumber || '-') : '-'}</td>
                      {/* IFSC */}
                      <td className="px-3 py-2 font-mono text-gray-600">{bankDoc ? (bank.ifsc || '-') : '-'}</td>
                      {/* Address Proof (Aadhaar front) */}
                      <td className="px-3 py-2">
                        {aadhaarDocUrl ? (
                          <a href={aadhaarDocUrl} target="_blank" rel="noopener noreferrer">
                            <img src={aadhaarDocUrl} alt="address-proof" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* Address Proof No */}
                      <td className="px-3 py-2 font-mono text-gray-600">{aadhaarDoc ? (aadhaarDoc.documentNumber || '-') : '-'}</td>
                      {/* Address Proof Back */}
                      <td className="px-3 py-2">
                        {aadhaarDocUrlBack ? (
                          <a href={aadhaarDocUrlBack} target="_blank" rel="noopener noreferrer">
                            <img src={aadhaarDocUrlBack} alt="address-back" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* Photograph */}
                      <td className="px-3 py-2">
                        {group.profilePhoto ? (
                          <a href={getDocViewUrl(group.profilePhoto)} target="_blank" rel="noopener noreferrer">
                            <img src={getDocViewUrl(group.profilePhoto)} alt="photo" className="w-10 h-12 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* PAN image */}
                      <td className="px-3 py-2">
                        {panDocUrl ? (
                          <a href={panDocUrl} target="_blank" rel="noopener noreferrer">
                            <img src={panDocUrl} alt="pan" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* PAN Back image */}
                      <td className="px-3 py-2">
                        {panDocUrlBack ? (
                          <a href={panDocUrlBack} target="_blank" rel="noopener noreferrer">
                            <img src={panDocUrlBack} alt="pan-back" className="w-14 h-10 object-cover border border-gray-200 rounded" onError={(e) => { e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect fill="%23f3f4f6" width="56" height="40"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="8">No img</text></svg>'; }} />
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      {/* PAN No */}
                      <td className="px-3 py-2 font-mono text-gray-600">{panDoc ? (panDoc.documentNumber || '-') : '-'}</td>
                      {/* Approve */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1.5">
                          {panDoc && panDoc.status === 'PENDING' && (
                            <button onClick={() => handleApprove(panDoc.id)} className="text-blue-600 hover:text-blue-800 text-[10px] font-medium hover:underline text-left">
                              Approve PAN
                            </button>
                          )}
                          {aadhaarDoc && aadhaarDoc.status === 'PENDING' && (
                            <button onClick={() => handleApprove(aadhaarDoc.id)} className="text-blue-600 hover:text-blue-800 text-[10px] font-medium hover:underline text-left">
                              Approve Aadhaar
                            </button>
                          )}
                          {bankDoc && bankDoc.status === 'PENDING' && (
                            <button onClick={() => handleApprove(bankDoc.id)} className="text-blue-600 hover:text-blue-800 text-[10px] font-medium hover:underline text-left">
                              Approve Bank
                            </button>
                          )}
                        </div>
                      </td>
                      {/* Remark */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1.5 col-span-1">
                          {panDoc && panDoc.status === 'PENDING' && (
                            <input
                              type="text"
                              placeholder="PAN"
                              value={remarkInputs[panDoc.id] || ''}
                              onChange={(e) => setRemarkInputs({ ...remarkInputs, [panDoc.id]: e.target.value })}
                              className="w-14 rounded border border-gray-300 px-1 py-0.5 text-[9px] outline-none"
                            />
                          )}
                          {aadhaarDoc && aadhaarDoc.status === 'PENDING' && (
                            <input
                              type="text"
                              placeholder="Aadhaar"
                              value={remarkInputs[aadhaarDoc.id] || ''}
                              onChange={(e) => setRemarkInputs({ ...remarkInputs, [aadhaarDoc.id]: e.target.value })}
                              className="w-14 rounded border border-gray-300 px-1 py-0.5 text-[9px] outline-none"
                            />
                          )}
                          {bankDoc && bankDoc.status === 'PENDING' && (
                            <input
                              type="text"
                              placeholder="Bank"
                              value={remarkInputs[bankDoc.id] || ''}
                              onChange={(e) => setRemarkInputs({ ...remarkInputs, [bankDoc.id]: e.target.value })}
                              className="w-14 rounded border border-gray-300 px-1 py-0.5 text-[9px] outline-none"
                            />
                          )}
                        </div>
                      </td>
                      {/* Reject */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1.5">
                          {panDoc && panDoc.status === 'PENDING' && (
                            <button onClick={() => handleReject(panDoc.id)} className="text-red-600 hover:text-red-800 text-[10px] font-medium hover:underline text-left">
                              Reject PAN
                            </button>
                          )}
                          {aadhaarDoc && aadhaarDoc.status === 'PENDING' && (
                            <button onClick={() => handleReject(aadhaarDoc.id)} className="text-red-600 hover:text-red-800 text-[10px] font-medium hover:underline text-left">
                              Reject Aadhaar
                            </button>
                          )}
                          {bankDoc && bankDoc.status === 'PENDING' && (
                            <button onClick={() => handleReject(bankDoc.id)} className="text-red-600 hover:text-red-800 text-[10px] font-medium hover:underline text-left">
                              Reject Bank
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
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
