import { useState, useEffect } from 'react';
import { Search, Newspaper, Key, Building2, LogOut, Save, Eye, EyeOff } from 'lucide-react';
import api from '../common/api.js';
import { useAuth } from '../common/AuthContext.jsx';

const ic = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200 outline-none';
const lc = 'block text-xs font-medium text-gray-600 mb-1';
const btn = 'rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 transition-colors';
const btnGray = 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors';

const TABS = [
  { key: 'search', label: 'Search', icon: Search },
  { key: 'news', label: 'Add News', icon: Newspaper },
  { key: 'password', label: 'Fetch Password', icon: Key },
  { key: 'company', label: 'Company Detail', icon: Building2 },
];

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState('search');
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 lg:hidden">My Account</h1>
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-gold-500 text-gold-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Icon size={15} />{tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === 'search' && <SearchAssociates />}
      {activeTab === 'news' && <AddNews />}
      {activeTab === 'password' && <FetchPassword />}
      {activeTab === 'company' && <CompanyDetail />}
    </div>
  );
}

// ─── Search Associates ────────────────────────────────────────────────────────
const SEARCH_TYPES = [
  { value: 'name', label: 'Associate Name', field: 'Associate Name', placeholder: 'Rajesh Kumar' },
  { value: 'associateId', label: 'Associate Id', field: 'Associate Id', placeholder: 'IWR100001' },
  { value: 'downline', label: 'Associate Downline', field: 'Associate Downline', placeholder: '' },
  { value: 'city', label: 'City', field: 'City', placeholder: '' },
  { value: 'dob', label: 'Date Of Birth', field: 'DOB Range', placeholder: '' },
  { value: 'sponsorId', label: 'Sponsor Id', field: 'Sponsor ID', placeholder: '' },
  { value: 'productAmount', label: 'Product Amount', field: 'Product Amount', placeholder: '' },
  { value: 'pan', label: 'PanNo', field: 'Pan No.', placeholder: '' },
  { value: 'state', label: 'State', field: 'State', placeholder: '' },
  { value: 'mobile', label: 'Mobile No', field: 'Mobile No.', placeholder: '' },
  { value: 'account', label: 'Account No', field: 'Account No', placeholder: '' },
];

const SEARCH_OPTIONS = [
  { value: 'starts', label: 'Starts With Search Word' },
  { value: 'ends', label: 'Ends With Search Word' },
  { value: 'anywhere', label: 'Anywhere In Records' },
  { value: 'exactly', label: 'Exactly As Search Word' },
];

const STATES = ['Rajasthan','Uttar Pradesh','Gujarat','Maharashtra','Madhya Pradesh','Delhi','Haryana','Punjab','Karnataka','Tamil Nadu','Bihar','West Bengal','Odisha','Assam','Other'];

function SearchAssociates() {
  const [searchType, setSearchType] = useState('name');
  const [searchOption, setSearchOption] = useState('starts');
  const [searchValue, setSearchValue] = useState('');
  const [dobFrom, setDobFrom] = useState('');
  const [dobTo, setDobTo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchValue && searchType !== 'dob' && searchType !== 'productAmount') {
      return;
    }
    setLoading(true); setSearched(true);
    try {
      const params = { pageSize: 100 };

      if (searchType === 'name') {
        // Apply search option modifier
        if (searchOption === 'starts') params.search = searchValue;
        else if (searchOption === 'ends') params.search = searchValue;      // backend uses CONTAINS — closest we can get
        else if (searchOption === 'anywhere') params.search = searchValue;
        else params.search = searchValue; // exactly — could filter on frontend
      } else if (searchType === 'associateId') {
        params.search = searchValue; // userId search
      } else if (searchType === 'city') {
        params.city = searchValue;
      } else if (searchType === 'state') {
        params.state = searchValue;
      } else if (searchType === 'mobile') {
        params.phone = searchValue;
      } else if (searchType === 'sponsorId') {
        params.sponsorUserId = searchValue;
      } else if (searchType === 'pan') {
        params.panNumber = searchValue;
      } else if (searchType === 'dob') {
        if (dobFrom) params.dobFrom = dobFrom;
        if (dobTo) params.dobTo = dobTo;
      } else if (searchType === 'downline') {
        params.search = searchValue;
      } else if (searchType === 'account') {
        params.search = searchValue; // no account no field on associate — best effort
      }

      const res = await api.get('/admin/associates', { params });
      let list = res.data?.data || [];

      // Client-side exact match for "exactly" mode
      if (searchType === 'name' && searchOption === 'exactly') {
        list = list.filter(a => a.name.toLowerCase() === searchValue.toLowerCase());
      }
      // Client-side ends-with
      if (searchType === 'name' && searchOption === 'ends') {
        list = list.filter(a => a.name.toLowerCase().endsWith(searchValue.toLowerCase()));
      }

      setResults(list);
    } catch { setResults([]); }
    setLoading(false);
  };

  const selectedType = SEARCH_TYPES.find(t => t.value === searchType);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Search Associates</h2>
      <nav className="text-xs text-gray-500 mb-5">My Account &rsaquo; Search Associates</nav>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-3">Select Search Option</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {SEARCH_TYPES.map(t => (
              <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="searchType" value={t.value} checked={searchType === t.value} onChange={() => { setSearchType(t.value); setSearchValue(''); }}
                  className="accent-gold-500" />
                <span className="text-sm text-gray-700">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dynamic search input based on type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            {searchType === 'dob' ? (
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lc}>DOB From</label><input className={ic} type="date" value={dobFrom} onChange={e=>setDobFrom(e.target.value)} /></div>
                <div><label className={lc}>DOB To</label><input className={ic} type="date" value={dobTo} onChange={e=>setDobTo(e.target.value)} /></div>
              </div>
            ) : searchType === 'productAmount' ? (
              <div><label className={lc}>Product Amount</label>
                <select className={ic} value={searchValue} onChange={e=>setSearchValue(e.target.value)}>
                  <option value="0">0</option><option value="5000">5000</option><option value="10000">10000</option><option value="25000">25000</option>
                </select>
              </div>
            ) : searchType === 'state' ? (
              <div><label className={lc}>State</label>
                <select className={ic} value={searchValue} onChange={e=>setSearchValue(e.target.value)}>
                  <option value="">Select State</option>{STATES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            ) : (
              <div><label className={lc}>{selectedType?.field}</label>
                <input className={ic} value={searchValue} onChange={e=>setSearchValue(e.target.value)} placeholder={selectedType?.placeholder} />
              </div>
            )}
          </div>
          {searchType === 'name' && (
            <div>
              <label className={lc}>Select Options</label>
              <select className={ic} value={searchOption} onChange={e=>setSearchOption(e.target.value)}>
                {SEARCH_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>

        <button onClick={handleSearch} disabled={loading} className={btn}>{loading ? 'Searching...' : 'Search'}</button>
      </div>

      {/* Results */}
      {searched && (
        <div className="mt-6 overflow-x-auto">
          <p className="text-xs text-gray-500 mb-2">Associates — {results.length} result(s)</p>
          {results.length === 0 ? (
            <p className="text-sm text-gray-400">No associates found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">S.No</th>
                  <th className="px-4 py-3 text-left text-gray-600">Associate ID</th>
                  <th className="px-4 py-3 text-left text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-left text-gray-600">City</th>
                  <th className="px-4 py-3 text-left text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600">Sponsor</th>
                </tr>
              </thead>
              <tbody>
                {results.map((a, i) => (
                  <tr key={a.id} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="px-4 py-2.5">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{a.userId}</td>
                    <td className="px-4 py-2.5">{a.name}</td>
                    <td className="px-4 py-2.5">{a.phone || '-'}</td>
                    <td className="px-4 py-2.5">{a.city || '-'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : a.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-2.5">{a.sponsorUserId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add News ─────────────────────────────────────────────────────────────────
function AddNews() {
  const [newsText, setNewsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Load existing news from branding
    api.get('/admin/app-version/branding').then(res => {
      const assets = res.data?.data || [];
      const newsAsset = assets.find(a => a.key === 'news');
      if (newsAsset) setNewsText(newsAsset.url);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/admin/app-version/branding', { key: 'news', url: newsText });
      setMsg('News saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save');
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Add News</h2>
      <nav className="text-xs text-gray-500 mb-5">My Account &rsaquo; Add News</nav>
      {msg && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{msg}</div>}
      <div className="space-y-4">
        <div>
          <label className={lc}>Update News</label>
          <textarea className={ic + ' resize-none'} rows={6} value={newsText} onChange={e => setNewsText(e.target.value)}
            placeholder="WELCOME TO Investor World Realty Store..." />
        </div>
        <button onClick={handleSave} disabled={loading} className={btn}>{loading ? 'Saving...' : 'Save News'}</button>
      </div>
    </div>
  );
}

// ─── Fetch Password ───────────────────────────────────────────────────────────
function FetchPassword() {
  const [associateId, setAssociateId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [associateDbId, setAssociateDbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const note = 'Note : Please Use Only A-Z,a-z,1-100(Elements) And Must Use (- @...)';

  const handleShowPassword = async () => {
    if (!associateId.trim()) { setMsg({ type: 'error', text: 'Please enter an Associate ID' }); return; }
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      // Search by userId (exact match via search param)
      const res = await api.get('/admin/associates', { params: { search: associateId.trim(), pageSize: 10 } });
      const list = (res.data?.data || []).filter(a => a.userId === associateId.trim().toUpperCase());
      if (list.length === 0) { setMsg({ type: 'error', text: `Associate "${associateId}" not found` }); setLoading(false); return; }
      const assoc = list[0];
      setAssociateDbId(assoc.id);
      // Passwords are bcrypt hashed and cannot be reversed — show info only
      setPassword('(bcrypt hashed — cannot be shown)');
      setMsg({ type: 'info', text: `✓ Found: ${assoc.name} | Status: ${assoc.status} | Phone: ${assoc.phone || 'N/A'}` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error fetching associate' });
    }
    setLoading(false);
  };

  const handleEditPassword = async () => {
    if (!associateDbId) { setMsg({ type: 'error', text: 'Click "Show Password" first to find the associate' }); return; }
    if (!newPassword.trim()) { setMsg({ type: 'error', text: 'Enter a new password' }); return; }
    if (newPassword.trim().length < 6) { setMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return; }
    setEditing(true); setMsg({ type: '', text: '' });
    try {
      await api.patch(`/admin/associates/${associateDbId}`, { password: newPassword.trim() });
      setMsg({ type: 'success', text: `✓ Password updated successfully for ${associateId}` });
      setNewPassword('');
      setPassword('');
      setAssociateDbId('');
      setAssociateId('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    }
    setEditing(false);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Fetch Password</h2>
      <nav className="text-xs text-gray-500 mb-2">My Account &rsaquo; Fetch Password</nav>
      <p className="text-xs text-gray-500 mb-5 italic">{note}</p>

      {msg.text && (
        <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : msg.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="space-y-5 max-w-xl">
        {/* Show Password */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className={lc}>Associate ID (Optional)</label>
            <input className={ic} value={associateId} onChange={e => setAssociateId(e.target.value)} placeholder="IWR100001" />
          </div>
          <button onClick={handleShowPassword} disabled={loading} className={btn}>{loading ? 'Loading...' : 'Show Password'}</button>
        </div>

        {/* Display password field */}
        {password && (
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className={lc}>Your Password Is</label>
              <div className="relative">
                <input className={ic + ' pr-10'} type={showPass ? 'text' : 'password'} value={password} readOnly />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Password */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className={lc}>New Password</label>
            <input className={ic} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
          </div>
          <button onClick={handleEditPassword} disabled={editing} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
            {editing ? 'Updating...' : 'Edit Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Company Detail ───────────────────────────────────────────────────────────
function CompanyDetail() {
  const { admin } = useAuth();
  const [details, setDetails] = useState({
    companyName: 'INVESTORS WORLD REALTY PVT. LTD.',
    address1: '',
    address2: '',
    phoneNo: '',
    mobileNo: '',
    email: '',
    companyUrl: '',
    userName: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchDetails(); }, []);

  const fetchDetails = async () => {
    try {
      const res = await api.get('/admin/app-version/branding');
      const assets = res.data?.data || [];
      const map = {};
      assets.forEach(a => { map[a.key] = a.url; });
      setDetails(prev => ({
        ...prev,
        companyName: map.companyName || prev.companyName,
        address1: map.address1 || '',
        address2: map.address2 || '',
        phoneNo: map.phoneNo || admin?.phone || '',
        mobileNo: map.mobileNo || admin?.phone || '',
        email: map.email || admin?.email || '',
        companyUrl: map.companyUrl || '',
        userName: map.userName || admin?.username || admin?.name || 'Admin',
        password: map.companyPassword || '',
      }));
    } catch {}
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields = [
        { key: 'companyName', url: details.companyName },
        { key: 'address1', url: details.address1 },
        { key: 'address2', url: details.address2 },
        { key: 'phoneNo', url: details.phoneNo },
        { key: 'mobileNo', url: details.mobileNo },
        { key: 'email', url: details.email },
        { key: 'companyUrl', url: details.companyUrl },
        { key: 'userName', url: details.userName },
        { key: 'companyPassword', url: details.password },
      ];
      for (const f of fields) {
        if (f.url) await api.post('/admin/app-version/branding', f);
      }
      setMsg('Saved!');
      setTimeout(() => setMsg(''), 2500);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Table view matching reference */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Company Details</h2>
          {msg && <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg">{msg}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">S.No</th>
                <th className="px-4 py-3 text-left text-gray-600">Company Name</th>
                <th className="px-4 py-3 text-left text-gray-600">Address1</th>
                <th className="px-4 py-3 text-left text-gray-600">Address2</th>
                <th className="px-4 py-3 text-left text-gray-600">Phone No.</th>
                <th className="px-4 py-3 text-left text-gray-600">Mobile No</th>
                <th className="px-4 py-3 text-left text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-gray-600">Company URL</th>
                <th className="px-4 py-3 text-left text-gray-600">UserName</th>
                <th className="px-4 py-3 text-left text-gray-600">Password</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-4 py-3 text-gray-500">1</td>
                <td className="px-4 py-3 font-medium text-gold-600">{details.companyName}</td>
                <td className="px-4 py-3 text-gray-700">{details.address1 || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{details.address2 || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{details.phoneNo || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{details.mobileNo || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{details.email || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{details.companyUrl || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{details.userName}</td>
                <td className="px-4 py-3 text-gray-700">{details.password || 'Admin'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Edit Company Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className={lc}>Company Name</label><input className={ic} value={details.companyName} onChange={e=>setDetails({...details,companyName:e.target.value})} /></div>
          <div><label className={lc}>Address Line 1</label><input className={ic} value={details.address1} onChange={e=>setDetails({...details,address1:e.target.value})} placeholder="P.No.157, Mahaveer Nagar..." /></div>
          <div><label className={lc}>Address Line 2</label><input className={ic} value={details.address2} onChange={e=>setDetails({...details,address2:e.target.value})} placeholder="Jaipur, Rajasthan- 302020" /></div>
          <div><label className={lc}>Phone No.</label><input className={ic} value={details.phoneNo} onChange={e=>setDetails({...details,phoneNo:e.target.value})} /></div>
          <div><label className={lc}>Mobile No</label><input className={ic} value={details.mobileNo} onChange={e=>setDetails({...details,mobileNo:e.target.value})} /></div>
          <div><label className={lc}>Email</label><input className={ic} type="email" value={details.email} onChange={e=>setDetails({...details,email:e.target.value})} /></div>
          <div><label className={lc}>Company URL</label><input className={ic} value={details.companyUrl} onChange={e=>setDetails({...details,companyUrl:e.target.value})} placeholder="www.investorsworld.co.in" /></div>
          <div><label className={lc}>UserName</label><input className={ic} value={details.userName} onChange={e=>setDetails({...details,userName:e.target.value})} /></div>
          <div><label className={lc}>Password</label><input className={ic} value={details.password} onChange={e=>setDetails({...details,password:e.target.value})} placeholder="Admin" /></div>
        </div>
        <div className="mt-4">
          <button onClick={handleSave} disabled={saving} className={btn}>
            <Save size={14} className="inline mr-1" />{saving ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
