import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Plus, Download, X, Save, ChevronDown, ChevronRight, Image } from 'lucide-react';
import api, { SERVER_URL } from '../common/api.js';

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
  { key: 'plc-charge', label: 'Plc Charge' },
  { key: 'flat-plot', label: 'Flat/Plot Master' },
  { key: 'scheme-details', label: 'Scheme Details' },
  { key: 'plc-charge-list', label: 'Plc Charge List' },
  { key: 'plot-type-list', label: 'Plot Type List' },
  { key: 'property-list', label: 'Property List' },
];

import Properties from './Properties.jsx';

export default function Masters() {
  const [activeTab, setActiveTab] = useState('account');
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 lg:hidden">Masters</h1>
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
      {activeTab === 'plc-charge' && <PlcChargeForm />}
      {activeTab === 'flat-plot' && <FlatPlotMaster />}
      {activeTab === 'scheme-details' && <SchemeDetails />}
      {activeTab === 'plc-charge-list' && <PlcChargeList />}
      {activeTab === 'plot-type-list' && <PlotTypeList />}
      {activeTab === 'property-list' && (
        <div className="mt-2">
          <Properties embedded={true} />
        </div>
      )}
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
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [schemeTypes, setSchemeTypes] = useState([]);

  useEffect(() => {
    api.get('/public/states').then(r => setStatesList(r.data?.data || [])).catch(()=>{});
    api.get('/admin/masters/plot-types', {params:{pageSize:100}}).then(r => setSchemeTypes(r.data?.data || [])).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!form.state) { setCitiesList([]); return; }
    api.get('/public/cities', { params: { state: form.state } }).then(r => setCitiesList(r.data?.data || [])).catch(()=>{});
  }, [form.state]);

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

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-1">{editId ? 'Edit Scheme' : 'Add Scheme'}</h2>
      <nav className="text-xs text-gray-500 mb-4">Masters &rsaquo; {editId ? 'Edit Scheme' : 'Add Scheme'}</nav>
      {msg && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={lc}>Enter Scheme Name *</label><input className={ic} value={form.schemeName} onChange={e=>setForm({...form,schemeName:e.target.value})} required /></div>
          <div><label className={lc}>State</label>
            <select className={ic} value={form.state} onChange={e=>setForm({...form,state:e.target.value,city:''})}>
              <option value="">Select State</option>{statesList.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div><label className={lc}>City</label>
            <select className={ic} value={form.city} onChange={e=>setForm({...form,city:e.target.value})}>
              <option value="">Select City</option>{citiesList.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div><label className={lc}>Address *</label><textarea className={ic+' resize-none'} rows={2} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={lc}>Pin Code</label><input className={ic} value={form.pinCode} onChange={e=>setForm({...form,pinCode:e.target.value})} /></div>
          <div><label className={lc}>Scheme Type</label>
            <select className={ic} value={form.schemeType} onChange={e=>setForm({...form,schemeType:e.target.value})}>
              <option value="">Select Scheme Type</option>{schemeTypes.map(s=><option key={s.id} value={s.typeName}>{s.typeName}</option>)}
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

// ─── Scheme Image Modal ───────────────────────────────────────────────────────
function SchemeImageModal({ schemeId, schemeName, onClose }) {
  const [images, setImages] = useState(Array(6).fill(null)); // URLs
  const [previews, setPreviews] = useState(Array(6).fill(null));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadImages(); }, [schemeId]);

  const loadImages = async () => {
    try {
      const r = await api.get(`/admin/masters/schemes/${schemeId}`);
      const imgs = r.data?.data?.images || [];
      const arr = Array(6).fill(null);
      imgs.forEach(img => { 
        if (img.slot >= 1 && img.slot <= 6) {
          const isLocal = img.imageUrl.includes('uploads');
          const cleanUrl = img.imageUrl.startsWith('/') ? img.imageUrl.slice(1) : img.imageUrl;
          arr[img.slot-1] = isLocal ? `${SERVER_URL}/${cleanUrl}` : img.imageUrl;
        } 
      });
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
    setLoading(true);
    try {
      const payload = images.map((url, i) => ({ slot: i+1, imageUrl: url || '' })).filter(i => i.imageUrl);
      await api.put(`/admin/masters/schemes/${schemeId}/images`, { images: payload });
      setMsg('Images saved!');
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Project Images: {schemeName}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {msg && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{msg}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_,i) => (
            <div key={i} className="flex flex-col gap-2 p-3 border border-gray-100 rounded-lg">
              <label className="block text-xs font-medium text-gray-700">Image Slot {i+1}</label>
              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" onChange={e=>handleFileChange(i, e.target.files[0])} className="text-xs w-full text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 hover:file:bg-gray-200" />
                {previews[i] ? (
                  <img src={previews[i]} alt={`slot ${i+1}`} className="w-16 h-16 object-cover rounded shadow-sm border border-gray-200 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded border-2 border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400 shrink-0 bg-gray-50">Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className={btnGray}>Close</button>
          <button onClick={handleSave} disabled={loading} className={btn}>{loading?'Saving...':'Save Images'}</button>
        </div>
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
  const [imageModal, setImageModal] = useState(null);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [schemeTypes, setSchemeTypes] = useState([]);

  useEffect(() => {
    api.get('/public/states').then(r => setStatesList(r.data?.data || [])).catch(()=>{});
    api.get('/admin/masters/plot-types', {params:{pageSize:100}}).then(r => setSchemeTypes(r.data?.data || [])).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!editData.state) { setCitiesList([]); return; }
    api.get('/public/cities', { params: { state: editData.state } }).then(r => setCitiesList(r.data?.data || [])).catch(()=>{});
  }, [editData.state]);

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
            <div><label className={lc}>State</label><select className={ic} value={editData.state||''} onChange={e=>setEditData({...editData,state:e.target.value,city:''})}><option value="">Select</option>{statesList.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
            <div><label className={lc}>City</label><select className={ic} value={editData.city||''} onChange={e=>setEditData({...editData,city:e.target.value})}><option value="">Select</option>{citiesList.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
          </div>
          <div><label className={lc}>Address</label><input className={ic} value={editData.address||''} onChange={e=>setEditData({...editData,address:e.target.value})} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lc}>Pin Code</label><input className={ic} value={editData.pinCode||''} onChange={e=>setEditData({...editData,pinCode:e.target.value})} /></div>
            <div><label className={lc}>Scheme Type</label><select className={ic} value={editData.schemeType||''} onChange={e=>setEditData({...editData,schemeType:e.target.value})}><option value="">Select</option>{schemeTypes.map(s=><option key={s.id} value={s.typeName}>{s.typeName}</option>)}</select></div>
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
            <td className="px-4 py-2.5 flex items-center gap-3">
              <button onClick={()=>handleEdit(s)} className={btnEdit} title="Edit Scheme"><Pencil size={15} /></button>
              <button onClick={()=>setImageModal(s)} className="text-purple-600 hover:text-purple-700 flex items-center gap-1" title="Images">
                <Image size={15} />
              </button>
            </td>
            <td className="px-4 py-2.5"><span className="text-blue-600 text-sm cursor-pointer hover:underline">View</span></td>
          </tr>)}
        </tbody></table>
      </div>
      {imageModal && (
        <SchemeImageModal 
          schemeId={imageModal.id} 
          schemeName={imageModal.schemeName} 
          onClose={() => setImageModal(null)} 
        />
      )}
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
