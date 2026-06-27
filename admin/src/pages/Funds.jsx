import { useState, useEffect } from 'react';
import { CreditCard, MinusCircle, ArrowLeftRight, BarChart2, PlusCircle, Download, Filter } from 'lucide-react';
import api from '../common/api.js';

const ic = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200 outline-none';
const lc = 'block text-xs font-medium text-gray-600 mb-1';
const btn = 'rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 transition-colors disabled:opacity-50';
const btnGray = 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors';

const TABS = [
  { key: 'credit',   label: 'Credit Fund',         icon: CreditCard },
  { key: 'debit',    label: 'Debit Fund',           icon: MinusCircle },
  { key: 'transfer', label: 'Fund Transfer',        icon: ArrowLeftRight },
  { key: 'report',   label: 'Credit/Debit Report',  icon: BarChart2 },
  { key: 'advance',  label: 'Add Amount to Advance',icon: PlusCircle },
];

export default function Funds() {
  const [activeTab, setActiveTab] = useState('credit');
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 lg:hidden">Fund Management</h1>
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
      {activeTab === 'credit'   && <FundActionForm type="credit" />}
      {activeTab === 'debit'    && <FundActionForm type="debit" />}
      {activeTab === 'transfer' && <FundActionForm type="transfer" />}
      {activeTab === 'report'   && <CreditDebitReport />}
      {activeTab === 'advance'  && <AddAmountToAdvance />}
    </div>
  );
}

// ─── Credit / Debit / Transfer Form ─────────────────────────────────────────
function FundActionForm({ type }) {
  const [form, setForm] = useState({ associateId:'', fromAssociateId:'', toAssociateId:'', amount:'', reason:'' });
  const [assocInfo, setAssocInfo] = useState(null);
  const [fromInfo, setFromInfo] = useState(null);
  const [toInfo, setToInfo]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type:'', text:'' });

  const lookup = async (userId, setter) => {
    if (!userId.trim()) { setter(null); return; }
    try {
      const res = await api.get('/admin/associates', { params:{ search: userId.trim(), pageSize:10 } });
      const list = (res.data?.data||[]).filter(a => a.userId === userId.trim().toUpperCase());
      setter(list[0] || null);
    } catch { setter(null); }
  };

  const reset = () => {
    setForm({ associateId:'', fromAssociateId:'', toAssociateId:'', amount:'', reason:'' });
    setAssocInfo(null); setFromInfo(null); setToInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setMsg({ type:'', text:'' });
    try {
      if (type === 'credit') {
        await api.post('/admin/funds/credit', { associateId: assocInfo?.id || form.associateId, amount: Number(form.amount), reason: form.reason });
        setMsg({ type:'success', text:`✓ ₹${Number(form.amount).toLocaleString()} credited to ${assocInfo?.name || form.associateId}` });
      } else if (type === 'debit') {
        await api.post('/admin/funds/debit', { associateId: assocInfo?.id || form.associateId, amount: Number(form.amount), reason: form.reason });
        setMsg({ type:'success', text:`✓ ₹${Number(form.amount).toLocaleString()} debited from ${assocInfo?.name || form.associateId}` });
      } else {
        await api.post('/admin/funds/transfer', { fromAssociateId: fromInfo?.id || form.fromAssociateId, toAssociateId: toInfo?.id || form.toAssociateId, amount: Number(form.amount), reason: form.reason });
        setMsg({ type:'success', text:`✓ ₹${Number(form.amount).toLocaleString()} transferred successfully` });
      }
      reset();
    } catch (err) { setMsg({ type:'error', text: err.response?.data?.message || 'Operation failed' }); }
    setSubmitting(false);
  };

  const titles = { credit:'Credit Fund to Associate', debit:'Debit Fund from Associate', transfer:'Fund Transfer Between Associates' };
  const desc   = { credit:'Add funds to an associate wallet (Admin Credit)', debit:'Deduct funds from an associate wallet (Admin Debit)', transfer:'Transfer funds from one associate wallet to another' };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 max-w-2xl">
      <h2 className="text-lg font-bold text-gray-800 mb-1">{titles[type]}</h2>
      <p className="text-sm text-gray-500 mb-5">{desc[type]}</p>
      {msg.text && <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${msg.type==='success'?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'transfer' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lc}>From Associate ID *</label>
                <input className={ic} value={form.fromAssociateId} onChange={e=>setForm({...form,fromAssociateId:e.target.value})} onBlur={()=>lookup(form.fromAssociateId,setFromInfo)} placeholder="IWR100001" required />
                {fromInfo && <p className="text-xs text-green-600 mt-1">✓ {fromInfo.name} — Balance: ₹{(fromInfo.walletBalance||0).toLocaleString()}</p>}
              </div>
              <div>
                <label className={lc}>To Associate ID *</label>
                <input className={ic} value={form.toAssociateId} onChange={e=>setForm({...form,toAssociateId:e.target.value})} onBlur={()=>lookup(form.toAssociateId,setToInfo)} placeholder="IWR100002" required />
                {toInfo && <p className="text-xs text-green-600 mt-1">✓ {toInfo.name}</p>}
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className={lc}>Associate ID *</label>
            <input className={ic} value={form.associateId} onChange={e=>setForm({...form,associateId:e.target.value})} onBlur={()=>lookup(form.associateId,setAssocInfo)} placeholder="IWR100001" required />
            {assocInfo && <p className="text-xs text-green-600 mt-1">✓ {assocInfo.name} ({assocInfo.status})</p>}
          </div>
        )}
        <div>
          <label className={lc}>Amount (₹) *</label>
          <input className={ic} type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Enter amount" required />
        </div>
        <div>
          <label className={lc}>Reason *</label>
          <input className={ic} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="e.g. Bonus credit, Penalty deduction" required />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={submitting} className={btn}>{submitting ? 'Processing...' : 'Submit'}</button>
          <button type="button" className={btnGray} onClick={reset}>Reset</button>
        </div>
      </form>
    </div>
  );
}

// ─── Credit/Debit Report ─────────────────────────────────────────────────────
const WALLET_TYPES = [
  { value: '', label: 'All Wallets' },
  { value: 'ADMIN_CREDIT', label: 'Admin Credit' },
  { value: 'ADMIN_DEBIT',  label: 'Admin Debit' },
  { value: 'FUND_TRANSFER_IN',  label: 'Fund Transfer In' },
  { value: 'FUND_TRANSFER_OUT', label: 'Fund Transfer Out' },
  { value: 'DIRECT_INCOME',     label: 'Direct Income' },
  { value: 'LEVEL_INCOME',      label: 'Level Income' },
  { value: 'WITHDRAWAL',        label: 'Withdrawal' },
  { value: 'ADVANCE_CREDIT',    label: 'Advance Payment' },
];

function CreditDebitReport() {
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ startDate: today, endDate: today, associateId: '', walletType: '' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReport = async () => {
    setLoading(true); setSearched(true);
    try {
      const params = { page, pageSize: 50, startDate: filters.startDate, endDate: filters.endDate };
      if (filters.associateId) params.associateId = filters.associateId;
      if (filters.walletType) params.type = filters.walletType;
      const res = await api.get('/admin/funds/logs', { params });
      setLogs(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch { setLogs([]); }
    setLoading(false);
  };

  const exportCsv = () => {
    const headers = ['S.No','Date','Associate ID','Name','Type','Amount','Balance After','Reason'];
    const rows = logs.map((l,i) => [i+1, new Date(l.createdAt).toLocaleDateString(), l.associateUserId||'-', l.associateName||'-', l.type, l.amount, l.balanceAfter, l.description||'-']);
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='credit_debit_report.csv'; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Credit/Debit Report</h2>
        <nav className="text-xs text-gray-500 mb-4">Fund Transfer &rsaquo; Credit/Debit Report</nav>
        <div className="flex flex-wrap gap-3 items-end">
          <div><label className={lc}>Date From</label><input className={ic} type="date" value={filters.startDate} onChange={e=>setFilters({...filters,startDate:e.target.value})} /></div>
          <div><label className={lc}>Date To</label><input className={ic} type="date" value={filters.endDate} onChange={e=>setFilters({...filters,endDate:e.target.value})} /></div>
          <div><label className={lc}>Associate ID</label><input className={ic} value={filters.associateId} onChange={e=>setFilters({...filters,associateId:e.target.value})} placeholder="IWR100001 or leave blank" /></div>
          <div>
            <label className={lc}>Select Wallet</label>
            <select className={ic} value={filters.walletType} onChange={e=>setFilters({...filters,walletType:e.target.value})}>
              {WALLET_TYPES.map(w=><option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
          <button onClick={fetchReport} disabled={loading} className={btn}><Filter size={14} className="inline mr-1"/>{loading?'Loading...':'Show'}</button>
        </div>
      </div>

      {searched && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">S.No</th>
                  <th className="px-4 py-3 text-left text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-gray-600">Associate ID</th>
                  <th className="px-4 py-3 text-left text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-gray-600">Balance After</th>
                  <th className="px-4 py-3 text-left text-gray-600">Reason</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={8} className="py-8 text-center text-gray-400">Loading...</td></tr>
                 : logs.length===0 ? <tr><td colSpan={8} className="py-8 text-center text-gray-400">No records found for the selected filters.</td></tr>
                 : logs.map((l,i) => (
                  <tr key={l.id} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="px-4 py-2.5">{(page-1)*50+i+1}</td>
                    <td className="px-4 py-2.5">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 font-medium">{l.associateUserId||'-'}</td>
                    <td className="px-4 py-2.5">{l.associateName||'-'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${['ADMIN_CREDIT','DIRECT_INCOME','LEVEL_INCOME','FUND_TRANSFER_IN','ADVANCE_CREDIT'].includes(l.type)?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{l.type}</span>
                    </td>
                    <td className="px-4 py-2.5 font-medium">₹{Number(l.amount).toLocaleString()}</td>
                    <td className="px-4 py-2.5">₹{Number(l.balanceAfter).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-gray-600">{l.description||'-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className={btnGray+' disabled:opacity-50'}>Previous</button>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className={btnGray+' disabled:opacity-50'}>Next</button>
            </div>
            {logs.length > 0 && (
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                <Download size={14}/>Export to Excel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Amount to Advance ───────────────────────────────────────────────────
function AddAmountToAdvance() {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ distributorId:'', transaction:'Advance Amount', amount:'', account:'BANK/NET', date:today, remark:'' });
  const [distInfo, setDistInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type:'', text:'' });

  useEffect(() => {
    api.get('/admin/masters/accounts', { params:{ pageSize:100 } })
      .then(r => setAccounts(r.data?.data||[]))
      .catch(()=>{});
  }, []);

  const lookupDist = async () => {
    if (!form.distributorId.trim()) { setDistInfo(null); setBalance(null); setLedger([]); return; }
    try {
      const uid = form.distributorId.trim().toUpperCase();
      const [assocRes, balRes, ledgerRes] = await Promise.allSettled([
        api.get('/admin/associates', { params:{ search: uid, pageSize:10 } }),
        api.get(`/admin/funds/advance/balance/${uid}`),
        api.get('/admin/funds/advance/ledger', { params:{ associateId: uid, pageSize: 5 } }),
      ]);
      const list = assocRes.status === 'fulfilled'
        ? (assocRes.value.data?.data||[]).filter(a => a.userId === uid)
        : [];
      if (list.length === 0) { setMsg({ type:'error', text:`Associate "${uid}" not found` }); setDistInfo(null); setBalance(null); return; }
      setDistInfo(list[0]);
      setBalance(balRes.status === 'fulfilled' ? balRes.value.data?.data : null);
      setLedger(ledgerRes.status === 'fulfilled' ? ledgerRes.value.data?.data || [] : []);
      setMsg({ type:'', text:'' });
    } catch { setDistInfo(null); setBalance(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distInfo) { setMsg({ type:'error', text:'Please enter a valid Distributor ID and press Tab/Enter to verify' }); return; }
    setSubmitting(true); setMsg({ type:'', text:'' });
    try {
      const txType = form.transaction === 'Advance Amount' ? 'CREDIT' : 'DEBIT';
      await api.post('/admin/funds/advance', {
        associateId: distInfo.id,
        type: txType,
        amount: Number(form.amount),
        account: form.account,
        remark: form.remark,
        date: form.date,
      });
      setMsg({ type:'success', text:`✓ ${form.transaction} of ₹${Number(form.amount).toLocaleString()} recorded for ${distInfo.name} (${distInfo.userId})` });
      // Refresh balance
      const balRes = await api.get(`/admin/funds/advance/balance/${distInfo.userId}`);
      setBalance(balRes.data?.data);
      const ledgerRes = await api.get('/admin/funds/advance/ledger', { params:{ associateId: distInfo.userId, pageSize:5 } });
      setLedger(ledgerRes.data?.data || []);
      setForm(f => ({ ...f, amount:'', remark:'' }));
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed to process' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Advance Amount</h2>
        <nav className="text-xs text-gray-500 mb-5">Fund Transfer &rsaquo; Add Amount to Advance</nav>
        {msg.text && <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${msg.type==='success'?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>{msg.text}</div>}

        {/* Balance card */}
        {balance && (
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-xs text-gray-500">Total Credit</p><p className="text-lg font-bold text-green-700">₹{balance.totalCredit.toLocaleString()}</p></div>
            <div className="rounded-lg bg-red-50 p-3 text-center"><p className="text-xs text-gray-500">Total Debit</p><p className="text-lg font-bold text-red-700">₹{balance.totalDebit.toLocaleString()}</p></div>
            <div className="rounded-lg bg-gold-50 p-3 text-center"><p className="text-xs text-gray-500">Balance</p><p className="text-lg font-bold text-gold-700">₹{balance.balance.toLocaleString()}</p></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Distributor ID *</label>
              <input className={ic} value={form.distributorId} onChange={e=>setForm({...form,distributorId:e.target.value})} onBlur={lookupDist} placeholder="IWR100001" required />
            </div>
            <div>
              <label className={lc}>Distributor Name</label>
              <input className={ic+' bg-gray-50'} value={distInfo?.name||''} readOnly placeholder="Auto-filled on lookup" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Select Transaction *</label>
              <select className={ic} value={form.transaction} onChange={e=>setForm({...form,transaction:e.target.value})} required>
                <option value="Advance Amount">Advance Amount (Credit)</option>
                <option value="Reduction Amount">Reduction Amount (Debit)</option>
              </select>
            </div>
            <div>
              <label className={lc}>Amount (₹) *</label>
              <input className={ic} type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Enter amount" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Select Account</label>
              <select className={ic} value={form.account} onChange={e=>setForm({...form,account:e.target.value})}>
                <option value="BANK/NET">BANK/NET</option>
                <option value="CASH">CASH</option>
                {accounts.map(a=><option key={a.id} value={a.accountName}>{a.accountName}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Date</label>
              <input className={ic} type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
            </div>
          </div>
          <div>
            <label className={lc}>Remark</label>
            <input className={ic} value={form.remark} onChange={e=>setForm({...form,remark:e.target.value})} placeholder="Optional remark" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={submitting} className={btn}>{submitting?'Submitting...':'Submit'}</button>
            <button type="button" className={btnGray} onClick={()=>{setForm({distributorId:'',transaction:'Advance Amount',amount:'',account:'BANK/NET',date:today,remark:''});setDistInfo(null);setBalance(null);setLedger([]);setMsg({type:'',text:''});}}>Cancel</button>
          </div>
        </form>
      </div>

      {/* Recent advance ledger for this associate */}
      {ledger.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100"><p className="text-sm font-semibold text-gray-700">Recent Advance Transactions — {distInfo?.name}</p></div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-gray-600">Date</th>
                <th className="px-4 py-2.5 text-left text-gray-600">Type</th>
                <th className="px-4 py-2.5 text-left text-gray-600">Amount</th>
                <th className="px-4 py-2.5 text-left text-gray-600">Balance After</th>
                <th className="px-4 py-2.5 text-left text-gray-600">Account</th>
                <th className="px-4 py-2.5 text-left text-gray-600">Remark</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map(r => (
                <tr key={r.id} className="border-b border-gray-50 even:bg-gray-50">
                  <td className="px-4 py-2.5">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.type==='CREDIT'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{r.type}</span></td>
                  <td className="px-4 py-2.5 font-medium">₹{r.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5">₹{r.balanceAfter.toLocaleString()}</td>
                  <td className="px-4 py-2.5">{r.account||'-'}</td>
                  <td className="px-4 py-2.5 text-gray-500">{r.remark||'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
