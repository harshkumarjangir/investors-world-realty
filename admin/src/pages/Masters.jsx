import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Plus, Download, X, Save, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../common/api.js';

const ic = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200 outline-none';
const lc = 'block text-xs font-medium text-gray-600 mb-1';
const btn = 'rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 transition-colors';
const btnGray = 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors';
const btnRed = 'rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600';
const btnEdit = 'text-gold-600 hover:text-gold-700 text-sm font-medium';
const btnDel = 'text-red-500 hover:text-red-600 text-sm font-medium';

const TABS = [
  { key: 'account', label: 'Account Master' },
  { key: 'scheme', label: 'Scheme' },
  { key: 'scheme-image', label: 'Scheme Image' },
  { key: 'plc-charge', label: 'Plc Charge' },
  { key: 'flat-plot', label: 'Flat/Plot Master' },
  { key: 'scheme-details', label: 'Scheme Details' },
  { key: 'plc-charge-list', label: 'Plc Charge List' },
  { key: 'plot-type-list', label: 'Plot Type List' },
  { key: 'plot-list', label: 'Plot List' },
];

export default function Masters() {
  const [activeTab, setActiveTab] = useState('account');
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Masters</h1>
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-gold-500 text-gold-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'account' && <AccountMaster />}
      {activeTab === 'scheme' && <SchemeForm />}
      {activeTab === 'scheme-image' && <SchemeImage />}
      {activeTab === 'plc-charge' && <PlcChargeForm />}
      {activeTab === 'flat-plot' && <FlatPlotMaster />}
      {activeTab === 'scheme-details' && <SchemeDetails />}
      {activeTab === 'plc-charge-list' && <PlcChargeList />}
      {activeTab === 'plot-type-list' && <PlotTypeList />}
      {activeTab === 'plot-list' && <PlotList />}
    </div>
  );
}

// ─── Account Master ───────────────────────────────────────────────────────────
function AccountMaster() {
  const empty = { accountName:'', underGroup:'Bank', address:'', state:'', city:'', mobileNo:'', emailId:'', phoneNo:'', gstNo:'', bankAccountNo:'', branchName:'', bankIfscCode:'', type:'Dr' };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch(); }, []);
  const fetch = async () => {
    try { const r = await api.get('/admin/masters/accounts'); setList(r.data?.data || []); } catch {}
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) { await api.put(`/admin/masters/accounts/${editing}`, form); setMsg('Updated'); }
      else { await api.post('/admin/masters/accounts', form); setMsg('Created'); }
      setForm(empty); setEditing(null); fetch();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };
  const handleEdit = (a) => { setForm({...a}); setEditing(a.id); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/admin/masters/accounts/${id}`); fetch(); };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Account Master</h2>
        {msg && <div className="mb-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{msg}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>Account Name *</label><input className={ic} value={form.accountName} onChange={e=>setForm({...form,accountName:e.target.value})} required /></div>
            <div><label className={lc}>Under Group</label>
              <select className={ic} value={form.underGroup} onChange={e=>setForm({...form,underGroup:e.target.value})}>
                <option>Bank</option><option>Cash</option><option>Wallet</option><option>Cheque</option>
              </select>
            </div>
            <div><label className={lc}>Address</label><input className={ic} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>State</label><input className={ic} value={form.state} onChange={e=>setForm({...form,state:e.target.value})} /></div>
            <div><label className={lc}>City</label><input className={ic} value={form.city} onChange={e=>setForm({...form,city:e.target.value})} /></div>
            <div><label className={lc}>Mobile No</label><input className={ic} value={form.mobileNo} onChange={e=>setForm({...form,mobileNo:e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>Email Id</label><input className={ic} type="email" value={form.emailId} onChange={e=>setForm({...form,emailId:e.target.value})} /></div>
            <div><label className={lc}>Phone No</label><input className={ic} value={form.phoneNo} onChange={e=>setForm({...form,phoneNo:e.target.value})} /></div>
            <div><label className={lc}>GST No</label><input className={ic} value={form.gstNo} onChange={e=>setForm({...form,gstNo:e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>Bank Account No.</label><input className={ic} value={form.bankAccountNo} onChange={e=>setForm({...form,bankAccountNo:e.target.value})} /></div>
            <div><label className={lc}>Branch Name</label><input className={ic} value={form.branchName} onChange={e=>setForm({...form,branchName:e.target.value})} /></div>
            <div><label className={lc}>Bank IFSC Code</label><input className={ic} value={form.bankIfscCode} onChange={e=>setForm({...form,bankIfscCode:e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>Type</label>
              <select className={ic} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                <option value="Dr">Dr</option><option value="Cr">Cr</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className={btn}>{loading?'Saving...':(editing?'Update':'Submit')}</button>
            {editing && <button type="button" className={btnGray} onClick={()=>{setForm(empty);setEditing(null);}}>Cancel</button>}
          </div>
        </form>
      </div>
      {list.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-gray-50 border-b border-gray-200">
            <tr><th className="px-4 py-3 text-left text-gray-600">Account Name</th><th className="px-4 py-3 text-left text-gray-600">Group</th><th className="px-4 py-3 text-left text-gray-600">Bank A/C</th><th className="px-4 py-3 text-left text-gray-600">IFSC</th><th className="px-4 py-3 text-left text-gray-600">Type</th><th className="px-4 py-3 text-left text-gray-600">Actions</th></tr>
          </thead><tbody>
            {list.map(a => <tr key={a.id} className="border-b border-gray-50 even:bg-gray-50">
              <td className="px-4 py-2.5">{a.accountName}</td><td className="px-4 py-2.5">{a.underGroup}</td><td className="px-4 py-2.5">{a.bankAccountNo||'-'}</td><td className="px-4 py-2.5">{a.bankIfscCode||'-'}</td><td className="px-4 py-2.5">{a.type}</td>
              <td className="px-4 py-2.5 flex gap-3"><button className={btnEdit} onClick={()=>handleEdit(a)}>Edit</button><button className={btnDel} onClick={()=>handleDelete(a.id)}>Delete</button></td>
            </tr>)}
          </tbody></table>
        </div>
      )}
    </div>
  );
}

// ─── Scheme Form (Add/Edit) ───────────────────────────────────────────────────
function SchemeForm() {
  const empty = { schemeName:'', state:'', city:'', address:'', pinCode:'', schemeType:'', featuredScheme:'Yes', googleMap:'', shortDescription:'', description:'' };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, featuredScheme: form.featuredScheme === 'Yes' };
      if (editId) { await api.put(`/admin/masters/schemes/${editId}`, payload); setMsg('Scheme updated!'); }
      else { await api.post('/admin/masters/schemes', payload); setMsg('Scheme created!'); }
      setForm(empty); setEditId(null);
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  const STATES = ['Rajasthan','Uttar Pradesh','Gujarat','Maharashtra','Madhya Pradesh','Delhi','Haryana','Punjab','Karnataka','Tamil Nadu','Bihar','West Bengal','Odisha','Assam','Other'];
  const SCHEME_TYPES = ['Residential','Commercial','Industrial','Agricultural','Mixed Use','Township'];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-1">{editId ? 'Edit Scheme' : 'Add Scheme'}</h2>
      <nav className="text-xs text-gray-500 mb-4">Masters &rsaquo; {editId ? 'Edit Scheme' : 'Add Scheme'}</nav>
      {msg && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={lc}>Enter Scheme Name *</label><input className={ic} value={form.schemeName} onChange={e=>setForm({...form,schemeName:e.target.value})} required /></div>
          <div><label className={lc}>State</label>
            <select className={ic} value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>
              <option value="">Select State</option>{STATES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={lc}>City</label><input className={ic} value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="Select City" /></div>
        </div>
        <div><label className={lc}>Address *</label><textarea className={ic+' resize-none'} rows={2} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={lc}>Pin Code</label><input className={ic} value={form.pinCode} onChange={e=>setForm({...form,pinCode:e.target.value})} /></div>
          <div><label className={lc}>Scheme Type</label>
            <select className={ic} value={form.schemeType} onChange={e=>setForm({...form,schemeType:e.target.value})}>
              <option value="">Select Scheme Type</option>{SCHEME_TYPES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={lc}>Featured Scheme</label>
            <select className={ic} value={form.featuredScheme} onChange={e=>setForm({...form,featuredScheme:e.target.value})}>
              <option>Yes</option><option>No</option>
            </select>
          </div>
        </div>
        <div><label className={lc}>Google Map (embed URL)</label><input className={ic} value={form.googleMap} onChange={e=>setForm({...form,googleMap:e.target.value})} /></div>
        <div><label className={lc}>Short Description</label><textarea className={ic+' resize-none'} rows={3} value={form.shortDescription} onChange={e=>setForm({...form,shortDescription:e.target.value})} /></div>
        <div><label className={lc}>Description</label><textarea className={ic+' resize-none'} rows={5} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className={btn}>{loading?'Saving...':(editId?'Update':'Save')}</button>
          <button type="button" className={btnGray} onClick={()=>{setForm(empty);setEditId(null);}}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── Scheme Image ─────────────────────────────────────────────────────────────
function SchemeImage() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [images, setImages] = useState(Array(6).fill(null)); // URLs
  const [previews, setPreviews] = useState(Array(6).fill(null));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadSchemes(); }, []);
  useEffect(() => { if (selectedScheme) loadImages(); }, [selectedScheme]);

  const loadSchemes = async () => {
    try { const r = await api.get('/admin/masters/schemes', {params:{pageSize:100}}); setSchemes(r.data?.data||[]); } catch {}
  };
  const loadImages = async () => {
    try {
      const r = await api.get(`/admin/masters/schemes/${selectedScheme}`);
      const imgs = r.data?.data?.images || [];
      const arr = Array(6).fill(null);
      imgs.forEach(img => { if (img.slot >= 1 && img.slot <= 6) arr[img.slot-1] = img.imageUrl; });
      setImages(arr); setPreviews(arr);
    } catch {}
  };

  const handleFileChange = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPrev = [...previews]; newPrev[idx] = e.target.result; setPreviews(newPrev);
      const newImgs = [...images]; newImgs[idx] = e.target.result; setImages(newImgs);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedScheme) { setMsg('Please select a scheme'); return; }
    setLoading(true);
    try {
      const payload = images.map((url, i) => ({ slot: i+1, imageUrl: url || '' })).filter(i => i.imageUrl);
      await api.put(`/admin/masters/schemes/${selectedScheme}/images`, { images: payload });
      setMsg('Images saved!');
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Project Image</h2>
      {msg && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{msg}</div>}
      <div className="mb-6">
        <label className={lc}>Select Scheme</label>
        <select className={ic} style={{maxWidth:400}} value={selectedScheme} onChange={e=>setSelectedScheme(e.target.value)}>
          <option value="">Select Project...</option>
          {schemes.map(s=><option key={s.id} value={s.id}>{s.schemeName}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array(6).fill(0).map((_,i) => (
          <div key={i} className="flex items-center gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select UPLOAD IMAGE {i+1}</label>
              <input type="file" accept="image/*" onChange={e=>handleFileChange(i, e.target.files[0])} className="text-sm" />
            </div>
            {previews[i] && (
              <img src={previews[i]} alt={`slot ${i+1}`} className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
            )}
            {!previews[i] && <div className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">No image</div>}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button onClick={handleSave} disabled={loading} className={btn}>{loading?'Saving...':'Save'}</button>
      </div>
    </div>
  );
}

// ─── Plc Charge Form (Add) ────────────────────────────────────────────────────
function PlcChargeForm() {
  const empty = { plcName: '', chargeType: 'Percentage', plcCharge: '' };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/admin/masters/plc-charges', form);
      setMsg('Plc Charge saved!'); setForm(empty);
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Add Plc Charge Master</h2>
      <nav className="text-xs text-gray-500 mb-4">Masters &rsaquo; Add Plc Charge Master</nav>
      {msg && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={lc}>Enter Plc Name *</label><input className={ic} value={form.plcName} onChange={e=>setForm({...form,plcName:e.target.value})} required /></div>
          <div><label className={lc}>Enter Plc Charge Type *</label>
            <select className={ic} value={form.chargeType} onChange={e=>setForm({...form,chargeType:e.target.value})}>
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed</option>
            </select>
          </div>
          <div><label className={lc}>Enter Plc Charge *</label><input className={ic} type="number" step="0.01" value={form.plcCharge} onChange={e=>setForm({...form,plcCharge:e.target.value})} required /></div>
        </div>
        <button type="submit" disabled={loading} className={btn}>{loading?'Saving...':'Save'}</button>
      </form>
    </div>
  );
}

// ─── Flat/Plot Master (Plot Type Add/Edit) ────────────────────────────────────
function FlatPlotMaster() {
  const [typeName, setTypeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/admin/masters/plot-types', { typeName });
      setMsg('Plot type saved!'); setTypeName('');
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Flat/Plot/Shop</h2>
      <nav className="text-xs text-gray-500 mb-4">Masters &rsaquo; Flat/Plot/Shop</nav>
      {msg && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div style={{maxWidth:500}}>
          <label className={lc}>Enter Flat/Plot/Shop Type *</label>
          <input className={ic} value={typeName} onChange={e=>setTypeName(e.target.value)} placeholder="Flat/Store Name" required />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className={btn}>{loading?'Saving...':'Save'}</button>
          <button type="button" className={btnGray} onClick={()=>setTypeName('')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── Scheme Details List ──────────────────────────────────────────────────────
function SchemeDetails() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const STATES = ['Rajasthan','Uttar Pradesh','Gujarat','Maharashtra','Madhya Pradesh','Delhi','Haryana','Punjab','Karnataka','Tamil Nadu','Bihar','West Bengal','Odisha','Assam','Other'];

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setLoading(true); const r = await api.get('/admin/masters/schemes', {params:{pageSize:100}}); setSchemes(r.data?.data||[]); }
    catch {} finally { setLoading(false); }
  };
  const handleEdit = (s) => { setEditId(s.id); setEditData({schemeName:s.schemeName, city:s.city||'', state:s.state||'', address:s.address||'', pinCode:s.pinCode||'', schemeType:s.schemeType||'', featuredScheme:s.featuredScheme?'Yes':'No', googleMap:s.googleMap||'', shortDescription:s.shortDescription||'', description:s.description||''}); };
  const handleUpdate = async () => {
    try { await api.put(`/admin/masters/schemes/${editId}`, {...editData, featuredScheme: editData.featuredScheme==='Yes'}); setEditId(null); load(); } catch {}
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800">Scheme Details</h2></div>
      {editId && (
        <div className="p-6 border-b border-gray-200 bg-gray-50 space-y-4">
          <h3 className="font-medium text-gray-700">Edit Scheme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>Scheme Name</label><input className={ic} value={editData.schemeName||''} onChange={e=>setEditData({...editData,schemeName:e.target.value})} /></div>
            <div><label className={lc}>State</label><select className={ic} value={editData.state||''} onChange={e=>setEditData({...editData,state:e.target.value})}><option value="">Select</option>{STATES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className={lc}>City</label><input className={ic} value={editData.city||''} onChange={e=>setEditData({...editData,city:e.target.value})} /></div>
          </div>
          <div><label className={lc}>Address</label><input className={ic} value={editData.address||''} onChange={e=>setEditData({...editData,address:e.target.value})} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>Pin Code</label><input className={ic} value={editData.pinCode||''} onChange={e=>setEditData({...editData,pinCode:e.target.value})} /></div>
            <div><label className={lc}>Scheme Type</label><input className={ic} value={editData.schemeType||''} onChange={e=>setEditData({...editData,schemeType:e.target.value})} /></div>
            <div><label className={lc}>Featured</label><select className={ic} value={editData.featuredScheme} onChange={e=>setEditData({...editData,featuredScheme:e.target.value})}><option>Yes</option><option>No</option></select></div>
          </div>
          <div><label className={lc}>Short Description</label><textarea className={ic+' resize-none'} rows={2} value={editData.shortDescription||''} onChange={e=>setEditData({...editData,shortDescription:e.target.value})} /></div>
          <div className="flex gap-3">
            <button onClick={handleUpdate} className={btn}>Update</button>
            <button onClick={()=>setEditId(null)} className={btnGray}>Cancel</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-gray-50 border-b border-gray-200">
          <tr><th className="px-4 py-3 text-left text-gray-600">S.No</th><th className="px-4 py-3 text-left text-gray-600">Scheme Name</th><th className="px-4 py-3 text-left text-gray-600">City Name</th><th className="px-4 py-3 text-left text-gray-600">Address</th><th className="px-4 py-3 text-left text-gray-600">Action</th><th className="px-4 py-3 text-left text-gray-600">View</th></tr>
        </thead><tbody>
          {loading ? <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td></tr>
           : schemes.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-gray-400">No schemes found</td></tr>
           : schemes.map((s,i) => <tr key={s.id} className="border-b border-gray-50 even:bg-gray-50">
            <td className="px-4 py-2.5">{i+1}</td>
            <td className="px-4 py-2.5 font-medium">{s.schemeName}</td>
            <td className="px-4 py-2.5 uppercase">{s.city||'-'}</td>
            <td className="px-4 py-2.5 max-w-xs truncate">{s.address}</td>
            <td className="px-4 py-2.5"><button onClick={()=>handleEdit(s)} className={btnEdit}>Edit</button></td>
            <td className="px-4 py-2.5"><span className="text-blue-600 text-sm cursor-pointer hover:underline">View</span></td>
          </tr>)}
        </tbody></table>
      </div>
    </div>
  );
}

// ─── Plc Charge List ──────────────────────────────────────────────────────────
function PlcChargeList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ plcName:'', chargeType:'Percentage', plcCharge:'' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setLoading(true); const r = await api.get('/admin/masters/plc-charges', {params:{pageSize:100}}); setList(r.data?.data||[]); }
    catch {} finally { setLoading(false); }
  };
  const handleEdit = (p) => { setEditId(p.id); setEditData({plcName:p.plcName, chargeType:p.chargeType, plcCharge:p.plcCharge}); };
  const handleUpdate = async () => {
    try { await api.put(`/admin/masters/plc-charges/${editId}`, editData); setEditId(null); load(); } catch {}
  };
  const exportCsv = () => {
    const rows = [['S.No','Plc Name','Charge Type','Plc Charge'], ...list.map((p,i)=>[i+1,p.plcName,p.chargeType,p.plcCharge])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='plc_charges.csv'; a.click();
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800">Plc Charge List</h2></div>
      {editId && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>Plc Name</label><input className={ic} value={editData.plcName} onChange={e=>setEditData({...editData,plcName:e.target.value})} /></div>
            <div><label className={lc}>Charge Type</label><select className={ic} value={editData.chargeType} onChange={e=>setEditData({...editData,chargeType:e.target.value})}><option>Percentage</option><option>Fixed</option></select></div>
            <div><label className={lc}>Plc Charge</label><input className={ic} type="number" value={editData.plcCharge} onChange={e=>setEditData({...editData,plcCharge:e.target.value})} /></div>
          </div>
          <div className="flex gap-3"><button onClick={handleUpdate} className={btn}>Update</button><button onClick={()=>setEditId(null)} className={btnGray}>Cancel</button></div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-gray-50 border-b border-gray-200">
          <tr><th className="px-4 py-3 text-left text-gray-600">S.No</th><th className="px-4 py-3 text-left text-gray-600">Plc Name</th><th className="px-4 py-3 text-left text-gray-600">Charge Type</th><th className="px-4 py-3 text-left text-gray-600">Plc Charge</th><th className="px-4 py-3 text-left text-gray-600">Edit/View</th></tr>
        </thead><tbody>
          {loading ? <tr><td colSpan={5} className="py-8 text-center text-gray-400">Loading...</td></tr>
           : list.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-gray-400">No Plc charges found</td></tr>
           : list.map((p,i) => <tr key={p.id} className="border-b border-gray-50 even:bg-gray-50">
            <td className="px-4 py-2.5">{i+1}</td><td className="px-4 py-2.5">{p.plcName}</td><td className="px-4 py-2.5">{p.chargeType}</td><td className="px-4 py-2.5">{p.plcCharge}</td>
            <td className="px-4 py-2.5"><button onClick={()=>handleEdit(p)} className={btnEdit}>Edit</button></td>
          </tr>)}
        </tbody></table>
      </div>
      <div className="p-4 flex justify-center border-t border-gray-100">
        <button onClick={exportCsv} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 flex items-center gap-2"><Download size={14}/>Export To Excel</button>
      </div>
    </div>
  );
}

// ─── Plot Type List ───────────────────────────────────────────────────────────
function PlotTypeList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setLoading(true); const r = await api.get('/admin/masters/plot-types', {params:{pageSize:100}}); setList(r.data?.data||[]); }
    catch {} finally { setLoading(false); }
  };
  const handleUpdate = async () => {
    try { await api.put(`/admin/masters/plot-types/${editId}`, {typeName:editName}); setEditId(null); load(); } catch {}
  };
  const exportCsv = () => {
    const rows = [['S.No','Flat Name'], ...list.map((p,i)=>[i+1,p.typeName])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='plot_types.csv'; a.click();
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800">Flat List</h2></div>
      {editId && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-4 items-end">
          <div className="flex-1"><label className={lc}>Enter Flat/Plot/Shop Type</label><input className={ic} value={editName} onChange={e=>setEditName(e.target.value)} /></div>
          <button onClick={handleUpdate} className={btn}>Save</button>
          <button onClick={()=>setEditId(null)} className={btnGray}>Cancel</button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-gray-50 border-b border-gray-200">
          <tr><th className="px-4 py-3 text-left text-gray-600">S.No</th><th className="px-4 py-3 text-left text-gray-600">Flat Name</th><th className="px-4 py-3 text-left text-gray-600">Edit/View</th></tr>
        </thead><tbody>
          {loading ? <tr><td colSpan={3} className="py-8 text-center text-gray-400">Loading...</td></tr>
           : list.length === 0 ? <tr><td colSpan={3} className="py-8 text-center text-gray-400">No types found</td></tr>
           : list.map((p,i) => <tr key={p.id} className="border-b border-gray-50 even:bg-gray-50">
            <td className="px-4 py-2.5">{i+1}</td><td className="px-4 py-2.5">{p.typeName}</td>
            <td className="px-4 py-2.5"><button onClick={()=>{setEditId(p.id);setEditName(p.typeName);}} className={btnEdit}>Edit</button></td>
          </tr>)}
        </tbody></table>
      </div>
      <div className="p-4 flex justify-center border-t border-gray-100">
        <button onClick={exportCsv} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 flex items-center gap-2"><Download size={14}/>Export To Excel</button>
      </div>
    </div>
  );
}

// ─── Plot List ────────────────────────────────────────────────────────────────
function PlotList() {
  const [plots, setPlots] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [plotTypes, setPlotTypes] = useState([]);
  const [plcCharges, setPlcCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const empty = { schemeId:'', plotTypeId:'', plotSizeUnit:'Square Yards', plotSize:'', totalCost:'', plotNo:'', plcId:'', chargeOfPlot:'0', totalCostOfPlot:'', status:'Not Used' };
  const [form, setForm] = useState(empty);

  useEffect(() => { loadAll(); }, [page]);
  const loadAll = async () => {
    try {
      setLoading(true);
      const [pr, sr, tr, cr] = await Promise.all([
        api.get('/admin/masters/plots', {params:{page,pageSize:20}}),
        api.get('/admin/masters/schemes', {params:{pageSize:100}}),
        api.get('/admin/masters/plot-types', {params:{pageSize:100}}),
        api.get('/admin/masters/plc-charges', {params:{pageSize:100}}),
      ]);
      setPlots(pr.data?.data||[]); setTotalPages(pr.data?.totalPages||1);
      setSchemes(sr.data?.data||[]); setPlotTypes(tr.data?.data||[]); setPlcCharges(cr.data?.data||[]);
    } catch {} finally { setLoading(false); }
  };

  // Auto calc totalCostOfPlot
  const calcTotal = (f) => {
    const base = parseFloat(f.totalCost)||0;
    const plc = plcCharges.find(p=>p.id===f.plcId);
    let charge = 0;
    if (plc) charge = plc.chargeType==='Percentage' ? base * (Number(plc.plcCharge)/100) : Number(plc.plcCharge);
    return { chargeOfPlot: charge.toFixed(2), totalCostOfPlot: (base+charge).toFixed(2) };
  };
  const onFormChange = (field, val) => {
    const next = {...form, [field]: val};
    if (['totalCost','plcId'].includes(field)) {
      const calc = calcTotal(next);
      next.chargeOfPlot = calc.chargeOfPlot; next.totalCostOfPlot = calc.totalCostOfPlot;
    }
    setForm(next);
  };

  const handleSave = async () => {
    try { await api.post('/admin/masters/plots', form); setShowAdd(false); setForm(empty); loadAll(); } catch {}
  };
  const handleUpdate = async () => {
    try { await api.put(`/admin/masters/plots/${editId}`, form); setEditId(null); setForm(empty); loadAll(); } catch {}
  };
  const handleDelete = async (id) => { if (!confirm('Delete plot?')) return; await api.delete(`/admin/masters/plots/${id}`); loadAll(); };
  const handleEdit = (p) => {
    setEditId(p.id); setShowAdd(false);
    setForm({schemeId:p.schemeId, plotTypeId:p.plotTypeId||'', plotSizeUnit:p.plotSizeUnit||'Square Yards', plotSize:p.plotSize, totalCost:p.totalCost, plotNo:p.plotNo, plcId:p.plcId||'', chargeOfPlot:p.chargeOfPlot, totalCostOfPlot:p.totalCostOfPlot, status:p.status});
  };

  const SIZE_UNITS = ['Square Yards','Square Feet','Square Meters','Gaj','Acre','Bigha'];

  const PlotForm = ({onSave, onCancel, saving}) => (
    <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-4">
      <h3 className="font-medium text-gray-700">Flat/Plot/Shop</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={lc}>Select Scheme *</label>
          <select className={ic} value={form.schemeId} onChange={e=>onFormChange('schemeId',e.target.value)} required>
            <option value="">Select Scheme...</option>{schemes.map(s=><option key={s.id} value={s.id}>{s.schemeName}</option>)}
          </select>
        </div>
        <div><label className={lc}>Plot Type</label>
          <select className={ic} value={form.plotTypeId} onChange={e=>onFormChange('plotTypeId',e.target.value)}>
            <option value="">Select Type...</option>{plotTypes.map(t=><option key={t.id} value={t.id}>{t.typeName}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={lc}>Select Plot Size</label>
          <select className={ic} value={form.plotSizeUnit} onChange={e=>onFormChange('plotSizeUnit',e.target.value)}>
            {SIZE_UNITS.map(u=><option key={u}>{u}</option>)}
          </select>
        </div>
        <div><label className={lc}>Enter Size *</label><input className={ic} type="number" step="0.01" value={form.plotSize} onChange={e=>onFormChange('plotSize',e.target.value)} required /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={lc}>Total Cost *</label><input className={ic} type="number" step="0.01" value={form.totalCost} onChange={e=>onFormChange('totalCost',e.target.value)} required /></div>
        <div><label className={lc}>Plot No *</label><input className={ic} value={form.plotNo} onChange={e=>onFormChange('plotNo',e.target.value)} required /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={lc}>Plc</label>
          <select className={ic} value={form.plcId} onChange={e=>onFormChange('plcId',e.target.value)}>
            <option value="">Select Plc</option>{plcCharges.map(p=><option key={p.id} value={p.id}>{p.plcName} ({p.chargeType}: {p.plcCharge})</option>)}
          </select>
        </div>
        <div><label className={lc}>Charge of Plot</label><input className={ic+' bg-gray-50'} value={form.chargeOfPlot} readOnly /></div>
      </div>
      <div style={{maxWidth:400}}><label className={lc}>Total Cost of Plot</label><input className={ic+' bg-gray-50'} value={form.totalCostOfPlot} readOnly /></div>
      <div className="flex gap-3">
        <button onClick={onSave} className={btn}>Save</button>
        <button onClick={onCancel} className={btnGray}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Plot List</h2>
        <button onClick={()=>{setShowAdd(!showAdd);setEditId(null);setForm(empty);}} className={btn}><Plus size={14} className="inline mr-1"/>Add Plot</button>
      </div>
      {showAdd && !editId && <PlotForm onSave={handleSave} onCancel={()=>{setShowAdd(false);setForm(empty);}} />}
      {editId && <PlotForm onSave={handleUpdate} onCancel={()=>{setEditId(null);setForm(empty);}} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-3 text-left text-gray-600">S.No</th>
            <th className="px-3 py-3 text-left text-gray-600">Project Name</th>
            <th className="px-3 py-3 text-left text-gray-600">Property Type</th>
            <th className="px-3 py-3 text-left text-gray-600">Property Size</th>
            <th className="px-3 py-3 text-left text-gray-600">Property Amount</th>
            <th className="px-3 py-3 text-left text-gray-600">Plot No</th>
            <th className="px-3 py-3 text-left text-gray-600">Status</th>
            <th className="px-3 py-3 text-left text-gray-600">Plc Name</th>
            <th className="px-3 py-3 text-left text-gray-600">Charge</th>
            <th className="px-3 py-3 text-left text-gray-600">Property Total Cost</th>
            <th className="px-3 py-3 text-left text-gray-600">Edit</th>
            <th className="px-3 py-3 text-left text-gray-600">Delete</th>
          </tr>
        </thead><tbody>
          {loading ? <tr><td colSpan={12} className="py-8 text-center text-gray-400">Loading...</td></tr>
           : plots.length === 0 ? <tr><td colSpan={12} className="py-8 text-center text-gray-400">No plots found</td></tr>
           : plots.map((p,i) => {
            const plc = plcCharges.find(c=>c.id===p.plcId);
            return <tr key={p.id} className="border-b border-gray-50 even:bg-gray-50">
              <td className="px-3 py-2.5">{(page-1)*20+i+1}</td>
              <td className="px-3 py-2.5">{p.schemeName}</td>
              <td className="px-3 py-2.5">{p.plotTypeName||'PLOT'}</td>
              <td className="px-3 py-2.5">{p.plotSize}</td>
              <td className="px-3 py-2.5">{p.totalCost?.toLocaleString()}</td>
              <td className="px-3 py-2.5">{p.plotNo}</td>
              <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status==='Not Used'?'bg-gray-100 text-gray-600':p.status==='Booked'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{p.status}</span></td>
              <td className="px-3 py-2.5">{plc ? `${plc.plcName} (${plc.chargeType}: ${plc.plcCharge})` : 'Select Plc'}</td>
              <td className="px-3 py-2.5">{p.chargeOfPlot}</td>
              <td className="px-3 py-2.5">{p.totalCostOfPlot?.toLocaleString()}</td>
              <td className="px-3 py-2.5"><button onClick={()=>handleEdit(p)} className={btnEdit}>Edit</button></td>
              <td className="px-3 py-2.5"><button onClick={()=>handleDelete(p.id)} className={btnDel}>Delete</button></td>
            </tr>;
          })}
        </tbody></table>
      </div>
      <div className="flex items-center justify-between p-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className={btnGray+' disabled:opacity-50'}>Previous</button>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className={btnGray+' disabled:opacity-50'}>Next</button>
        </div>
      </div>
    </div>
  );
}
