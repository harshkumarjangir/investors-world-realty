import { useState, useEffect } from 'react';
import { Building2, Save } from 'lucide-react';
import api from '../common/api.js';
import { useAuth } from '../common/AuthContext.jsx';

export default function CompanyDetails() {
  const { admin } = useAuth();
  const [details, setDetails] = useState({
    companyName: 'INVESTORS WORLD REALTY PVT. LTD.',
    address1: '',
    address2: '',
    phoneNo: '',
    email: '',
    companyUrl: '',
    userName: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/app-version/branding');
      const assets = res.data?.data || res.data || [];
      const map = {};
      if (Array.isArray(assets)) {
        assets.forEach((a) => { map[a.key] = a.url; });
      }
      setDetails((prev) => ({
        ...prev,
        companyName: map.companyName || prev.companyName,
        address1: map.address1 || prev.address1,
        address2: map.address2 || prev.address2,
        phoneNo: map.phoneNo || admin?.phone || prev.phoneNo,
        email: map.email || admin?.email || prev.email,
        companyUrl: map.companyUrl || prev.companyUrl,
        userName: admin?.username || admin?.name || 'Admin',
        password: map.password || '',
      }));
    } catch {
      setDetails((prev) => ({
        ...prev,
        email: admin?.email || prev.email,
        phoneNo: admin?.phone || prev.phoneNo,
        userName: admin?.username || admin?.name || 'Admin',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess('');
      const fields = Object.entries(details);
      for (const [key, url] of fields) {
        if (url) await api.post('/admin/app-version/branding', { key, url });
      }
      setSuccess('Company details saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-200';

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <Building2 size={24} className="text-gold-500" />
          <h1 className="text-2xl font-bold text-gray-800">Company Details</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Details'}
        </button>
      </div>

      {success && <p className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">{success}</p>}

      {/* Table View */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">S.No</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Company Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Address1</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Address2</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Phone No.</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Company URL</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">UserName</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Password</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-4 py-4 text-gray-600">1</td>
                <td className="px-4 py-4 text-gold-600 font-medium">{details.companyName}</td>
                <td className="px-4 py-4 text-gray-700">{details.address1 || '-'}</td>
                <td className="px-4 py-4 text-gray-700">{details.address2 || '-'}</td>
                <td className="px-4 py-4 text-gray-700">{details.phoneNo || '-'}</td>
                <td className="px-4 py-4 text-gray-700">{details.email || '-'}</td>
                <td className="px-4 py-4 text-gray-700">{details.companyUrl || '-'}</td>
                <td className="px-4 py-4 text-gray-700">{details.userName}</td>
                <td className="px-4 py-4 text-gray-700">{details.password || '••••••'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Company Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
            <input name="companyName" value={details.companyName} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1</label>
            <input name="address1" value={details.address1} onChange={handleChange} placeholder="P.No.157, Mahaveer Nagar-b, Patrkar Colony Road, Mansarovar" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
            <input name="address2" value={details.address2} onChange={handleChange} placeholder=", Jaipur, Rajasthan- 302020" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone No.</label>
            <input name="phoneNo" value={details.phoneNo} onChange={handleChange} placeholder="1234567890" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input name="email" type="email" value={details.email} onChange={handleChange} placeholder="info@investorworld.co.in" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Company URL</label>
            <input name="companyUrl" value={details.companyUrl} onChange={handleChange} placeholder="www.investorsworld.co.in" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">UserName</label>
            <input name="userName" value={details.userName} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input name="password" value={details.password} onChange={handleChange} placeholder="Admin" className={inputCls} />
          </div>
        </div>
      </div>
    </div>
  );
}
