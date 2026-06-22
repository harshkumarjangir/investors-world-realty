import { useState, useEffect } from 'react';
import { FileText, CheckCircle, List, Receipt, Download, Filter } from 'lucide-react';
import api from '../common/api.js';

const TABS = [
  { key: 'booking', label: 'Plot Booking', icon: FileText },
  { key: 'approve', label: 'Approve Plot', icon: CheckCircle },
  { key: 'list', label: 'Plot Booking List', icon: List },
  { key: 'receipts', label: 'Receipt List', icon: Receipt },
];

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('booking');

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'booking' && <PlotBookingForm />}
      {activeTab === 'approve' && <ApprovePlot />}
      {activeTab === 'list' && <PlotBookingList />}
      {activeTab === 'receipts' && <ReceiptList />}
    </div>
  );
}

// ─── Plot Booking Form ────────────────────────────────────────────────────────
function PlotBookingForm() {
  const [form, setForm] = useState({
    associateId: '', customerName: '', customerMobile: '', customerAddress: '',
    propertyId: '', plotType: '', plotNo: '', siteNo: '', plotArea: '', costPerUnit: '',
    chargeOfPlot: '', discount: '0', totalBCV: '', totalCost: '', amount: '',
    modeOfPayment: '', chequeNo: '', paymentDate: new Date().toISOString().split('T')[0],
    bankName: '', drawnOn: new Date().toISOString().split('T')[0], emiMode: 'Monthly',
    amountPaid: '',
  });
  const [properties, setProperties] = useState([]);
  const [associateInfo, setAssociateInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/admin/properties', { params: { pageSize: 100 } });
      setProperties(res.data?.data || res.data?.properties || []);
    } catch { /* ignore */ }
  };

  const lookupAssociate = async () => {
    if (!form.associateId) return;
    try {
      const res = await api.get('/admin/associates', { params: { search: form.associateId, pageSize: 1 } });
      const list = res.data?.data || res.data?.associates || [];
      if (list.length > 0) {
        setAssociateInfo(list[0]);
        setForm((f) => ({ ...f, customerName: f.customerName || list[0].name }));
      } else {
        setAssociateInfo(null);
      }
    } catch { setAssociateInfo(null); }
  };

  // Auto-calculate totals
  useEffect(() => {
    const area = parseFloat(form.plotArea) || 0;
    const cost = parseFloat(form.costPerUnit) || 0;
    const charge = parseFloat(form.chargeOfPlot) || 0;
    const disc = parseFloat(form.discount) || 0;
    const bcv = area * cost;
    const total = bcv + charge - disc;
    setForm((f) => ({ ...f, totalBCV: bcv.toString(), totalCost: total.toString() }));
  }, [form.plotArea, form.costPerUnit, form.chargeOfPlot, form.discount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/admin/bookings', { ...form, amount: form.amount || form.amountPaid });
      setMsg({ type: 'success', text: 'Plot booking created successfully!' });
      setForm({
        associateId: '', customerName: '', customerMobile: '', customerAddress: '',
        propertyId: '', plotType: '', plotNo: '', siteNo: '', plotArea: '', costPerUnit: '',
        chargeOfPlot: '', discount: '0', totalBCV: '', totalCost: '', amount: '',
        modeOfPayment: '', chequeNo: '', paymentDate: new Date().toISOString().split('T')[0],
        bankName: '', drawnOn: new Date().toISOString().split('T')[0], emiMode: 'Monthly',
        amountPaid: '',
      });
      setAssociateInfo(null);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create booking' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200 outline-none';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Plot Booking</h2>
      <p className="text-sm text-gray-500 mb-6">Create a new plot booking for an associate</p>

      {msg.text && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Associate Code, Name, Registration Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Associate ID</label>
            <input className={inputClass} value={form.associateId} onChange={(e) => setForm({ ...form, associateId: e.target.value })} onBlur={lookupAssociate} placeholder="IWR100001" required />
          </div>
          <div>
            <label className={labelClass}>Associate Name</label>
            <input className={inputClass + ' bg-gray-50'} value={associateInfo?.name || ''} readOnly placeholder="Auto-filled on Associate Code lookup" />
          </div>
          <div>
            <label className={labelClass}>Registration Date</label>
            <input className={inputClass + ' bg-gray-50'} type="date" value={new Date().toISOString().split('T')[0]} readOnly />
          </div>
        </div>

        {/* Row 2: Customer Name, Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Customer Name</label>
            <input className={inputClass} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Mobile</label>
            <input className={inputClass} value={form.customerMobile} onChange={(e) => setForm({ ...form, customerMobile: e.target.value })} />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>Address</label>
          <textarea className={inputClass + ' resize-none'} rows={2} value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} />
        </div>

        {/* Row 3: Select Scheme, Select Plot Type, Plot No, Site No */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Select Scheme (Property) *</label>
            <select className={inputClass} value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required>
              <option value="">Select Scheme...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - {p.location}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Select Plot Type</label>
            <select className={inputClass} value={form.plotType} onChange={(e) => setForm({ ...form, plotType: e.target.value })}>
              <option value="">Select Type...</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Villa">Villa</option>
              <option value="Farmhouse">Farmhouse</option>
              <option value="Industrial">Industrial</option>
              <option value="Agricultural">Agricultural</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Plot No</label>
            <input className={inputClass} value={form.plotNo} onChange={(e) => setForm({ ...form, plotNo: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Site No</label>
            <input className={inputClass} value={form.siteNo} onChange={(e) => setForm({ ...form, siteNo: e.target.value })} />
          </div>
        </div>

        {/* Row 4: Plot (area), Cost of Plot, Charge of Plot, Discount */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Plot (Area in Gaj)</label>
            <input className={inputClass} type="number" value={form.plotArea} onChange={(e) => setForm({ ...form, plotArea: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Cost of Plot (₹ per Gaj)</label>
            <input className={inputClass} type="number" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Charge of Plot (₹)</label>
            <input className={inputClass} type="number" value={form.chargeOfPlot} onChange={(e) => setForm({ ...form, chargeOfPlot: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Discount (₹)</label>
            <input className={inputClass} type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          </div>
        </div>

        {/* Row 5: Total BCV, Total Cost, Booking Amount, EMI Mode */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Total BCV of Plot (₹)</label>
            <input className={inputClass} value={form.totalBCV} readOnly disabled />
          </div>
          <div>
            <label className={labelClass}>Total Cost of Plot (₹)</label>
            <input className={inputClass} value={form.totalCost} readOnly disabled />
          </div>
          <div>
            <label className={labelClass}>Booking Amount (₹) *</label>
            <input className={inputClass} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>EMI Mode</label>
            <select className={inputClass} value={form.emiMode} onChange={(e) => setForm({ ...form, emiMode: e.target.value })}>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half Yearly">Half Yearly</option>
              <option value="Yearly">Yearly</option>
              <option value="One Time">One Time</option>
            </select>
          </div>
        </div>

        {/* Row 6: Mode of Payment, Cheque/Ref No, Payment Date, Drawn On */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Mode of Payment *</label>
            <select className={inputClass} value={form.modeOfPayment} onChange={(e) => setForm({ ...form, modeOfPayment: e.target.value })} required>
              <option value="">Select...</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Online">Online</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="DD">Demand Draft</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Cheque/Ref No</label>
            <input className={inputClass} value={form.chequeNo} onChange={(e) => setForm({ ...form, chequeNo: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className={labelClass}>Payment Date</label>
            <input className={inputClass} type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Drawn On</label>
            <input className={inputClass} type="date" value={form.drawnOn} onChange={(e) => setForm({ ...form, drawnOn: e.target.value })} />
          </div>
        </div>

        {/* Row 7: Amount Rs, Bank Name */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Amount Rs. (Paid)</label>
            <input className={inputClass} type="number" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} placeholder="Actual amount paid" />
          </div>
          <div>
            <label className={labelClass}>Bank Name</label>
            <select className={inputClass} value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })}>
              <option value="">Select Bank...</option>
              <option value="State Bank of India">State Bank of India</option>
              <option value="Punjab National Bank">Punjab National Bank</option>
              <option value="Bank of Baroda">Bank of Baroda</option>
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="Axis Bank">Axis Bank</option>
              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              <option value="Yes Bank">Yes Bank</option>
              <option value="IndusInd Bank">IndusInd Bank</option>
              <option value="Union Bank of India">Union Bank of India</option>
              <option value="Canara Bank">Canara Bank</option>
              <option value="Indian Bank">Indian Bank</option>
              <option value="Bank of India">Bank of India</option>
              <option value="Central Bank of India">Central Bank of India</option>
              <option value="UCO Bank">UCO Bank</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50 transition-colors">
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              setForm({
                associateId: '', customerName: '', customerMobile: '', customerAddress: '',
                propertyId: '', plotType: '', plotNo: '', siteNo: '', plotArea: '', costPerUnit: '',
                chargeOfPlot: '', discount: '0', totalBCV: '', totalCost: '', amount: '',
                modeOfPayment: '', chequeNo: '', paymentDate: new Date().toISOString().split('T')[0],
                bankName: '', drawnOn: new Date().toISOString().split('T')[0], emiMode: 'Monthly',
                amountPaid: '',
              });
              setAssociateInfo(null);
            }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Approve Plot ─────────────────────────────────────────────────────────────
function ApprovePlot() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchUnapproved(); }, [page]);

  const fetchUnapproved = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bookings/unapproved', { params: { page, pageSize: 20 } });
      setBookings(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/bookings/${id}/approve`);
      fetchUnapproved();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/bookings/${id}/unapprove`);
      fetchUnapproved();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">List of UnApproved Plot Bookings</h2>
        <p className="text-sm text-gray-500">Approve or reject pending plot bookings</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">S.No</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Associate Code</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Customer Name</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Customer Mobile</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Mode of Payment</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Entry Date</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Plot No</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Property Name</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Total Cost</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Booking Amt</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} className="py-8 text-center text-gray-400">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={12} className="py-8 text-center text-gray-400">No pending bookings</td></tr>
            ) : (
              bookings.map((b, idx) => (
                <tr key={b.id} className="border-b border-gray-50 even:bg-gray-50">
                  <td className="px-3 py-2.5">{(page - 1) * 20 + idx + 1}</td>
                  <td className="px-3 py-2.5 font-medium">{b.associateCode}</td>
                  <td className="px-3 py-2.5">{b.associateName}</td>
                  <td className="px-3 py-2.5">{b.customerName || '-'}</td>
                  <td className="px-3 py-2.5">{b.customerMobile || '-'}</td>
                  <td className="px-3 py-2.5">{b.modeOfPayment || '-'}</td>
                  <td className="px-3 py-2.5">{new Date(b.entryDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2.5">{b.plotNo || '-'}</td>
                  <td className="px-3 py-2.5">{b.propertyName}</td>
                  <td className="px-3 py-2.5">₹{(b.totalCost || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5">₹{(b.amount || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => handleApprove(b.id)} className="rounded bg-green-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-600">Approve</button>
                      <button onClick={() => handleReject(b.id)} className="rounded bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600">Reject</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}

// ─── Plot Booking List ────────────────────────────────────────────────────────
function PlotBookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '', endDate: '', customerCode: '', associateCode: '',
  });

  useEffect(() => { fetchBookings(); }, [page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bookings', { params: { ...filters, page, pageSize: 20 } });
      setBookings(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleFilter = () => { setPage(1); fetchBookings(); };

  const exportToExcel = () => {
    // Simple CSV export
    const headers = ['S.No', 'Associate Code', 'Customer Code', 'Name', 'Project Name', 'Approval Date', 'Mobile', 'Customer Name', 'Customer Mobile', 'Plot No', 'Total Size', 'Property Name', 'Total Cost', 'Deposit Amount', 'Remaining Amount'];
    const rows = bookings.map((b, i) => [
      i + 1, b.associateCode, b.customerCode, b.name, b.projectName,
      b.approvalDate ? new Date(b.approvalDate).toLocaleDateString() : '-',
      b.mobile, b.customerName || '-', b.customerMobile || '-',
      b.plotNo || '-', b.totalSize || '-', b.propertyName,
      b.totalCost || 0, b.amount || 0, b.remainingAmount || 0,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'plot_bookings.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Customer Code</label>
            <input type="text" value={filters.customerCode} onChange={(e) => setFilters({ ...filters, customerCode: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200" placeholder="Search..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Associate ID</label>
            <input type="text" value={filters.associateCode} onChange={(e) => setFilters({ ...filters, associateCode: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200" placeholder="IWR100001" />
          </div>
          <button onClick={handleFilter} className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600">
            <Filter size={14} /> Show
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-600">S.No</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Associate Code</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Project Name</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Approval Date</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Customer Name</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Customer Mobile</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Plot No</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Total Size</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Total Cost</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Deposit Amt</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Remaining</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={13} className="py-8 text-center text-gray-400">No bookings found</td></tr>
              ) : (
                bookings.map((b, idx) => (
                  <tr key={b.id} className="border-b border-gray-50 even:bg-gray-50">
                    <td className="px-3 py-2.5">{(page - 1) * 20 + idx + 1}</td>
                    <td className="px-3 py-2.5 font-medium">{b.associateCode}</td>
                    <td className="px-3 py-2.5">{b.name}</td>
                    <td className="px-3 py-2.5">{b.projectName}</td>
                    <td className="px-3 py-2.5">{b.approvalDate ? new Date(b.approvalDate).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2.5">{b.customerName || '-'}</td>
                    <td className="px-3 py-2.5">{b.customerMobile || '-'}</td>
                    <td className="px-3 py-2.5">{b.plotNo || '-'}</td>
                    <td className="px-3 py-2.5">{b.totalSize || '-'}</td>
                    <td className="px-3 py-2.5">₹{(b.totalCost || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5">₹{(b.amount || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5">₹{(b.remainingAmount || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{b.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
          </div>
          <button onClick={exportToExcel} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            <Download size={14} /> Export To Excel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Receipt List ─────────────────────────────────────────────────────────────
function ReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchReceipts(); }, [page]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bookings/receipts', { params: { page, pageSize: 20 } });
      setReceipts(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const downloadReceipt = async (id, receiptNo) => {
    try {
      const res = await api.get(`/admin/bookings/receipts/${id}`);
      const data = res.data?.data || res.data;

      // Generate a simple printable receipt
      const receiptHtml = `
        <html><head><title>Receipt ${receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { text-align: center; color: #D49428; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td, th { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
          th { background: #f5f5f5; }
          .header { text-align: center; margin-bottom: 30px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style></head><body>
        <div class="header">
          <h1>Investors World Realty</h1>
          <h2>Payment Receipt</h2>
          <p>Receipt No: <strong>${data.receiptNo}</strong> | Date: ${new Date(data.date).toLocaleDateString()}</p>
        </div>
        <table>
          <tr><th>Associate ID</th><td>${data.associate?.userId || '-'}</td><th>Name</th><td>${data.associate?.name || '-'}</td></tr>
          <tr><th>Phone</th><td>${data.associate?.phone || '-'}</td><th>Email</th><td>${data.associate?.email || '-'}</td></tr>
          <tr><th>Customer</th><td>${data.customer?.name || '-'}</td><th>Mobile</th><td>${data.customer?.mobile || '-'}</td></tr>
          <tr><th>Property</th><td>${data.property?.name || '-'}</td><th>Location</th><td>${data.property?.location || '-'}</td></tr>
          <tr><th>Plot No</th><td>${data.plotNo || '-'}</td><th>Site No</th><td>${data.siteNo || '-'}</td></tr>
          <tr><th>Plot Area</th><td>${data.plotArea || '-'} Gaj</td><th>Total Cost</th><td>₹${(data.totalCost || 0).toLocaleString()}</td></tr>
          <tr><th>Booking Amount</th><td>₹${(data.bookingAmount || 0).toLocaleString()}</td><th>Mode</th><td>${data.modeOfPayment || '-'}</td></tr>
          ${data.chequeNo ? `<tr><th>Cheque No</th><td>${data.chequeNo}</td><th>Bank</th><td>${data.bankName || '-'}</td></tr>` : ''}
        </table>
        <div class="footer">
          <p>This is a computer-generated receipt. No signature required.</p>
          <p>© ${new Date().getFullYear()} Investors World Realty Pvt. Ltd. All Rights Reserved.</p>
        </div>
        </body></html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.print();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download receipt');
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Total Deposited Installments</h2>
        <p className="text-sm text-gray-500">All confirmed bookings with receipts</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">S.No</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Receipt No</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Associate Code</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Property</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Plot No</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Deposit Date</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Deposit Amount</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Fine Amount</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Booking Amount</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Net Amount</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="py-8 text-center text-gray-400">Loading...</td></tr>
            ) : receipts.length === 0 ? (
              <tr><td colSpan={11} className="py-8 text-center text-gray-400">No receipts found</td></tr>
            ) : (
              receipts.map((r, idx) => (
                <tr key={r.id} className="border-b border-gray-50 even:bg-gray-50">
                  <td className="px-3 py-2.5">{(page - 1) * 20 + idx + 1}</td>
                  <td className="px-3 py-2.5 font-medium">{r.receiptNo}</td>
                  <td className="px-3 py-2.5">{r.associateCode}</td>
                  <td className="px-3 py-2.5">{r.propertyCode}</td>
                  <td className="px-3 py-2.5">{r.plotNo || '-'}</td>
                  <td className="px-3 py-2.5">{new Date(r.depositDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2.5">₹{(r.depositAmount || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5">₹{(r.fineAmount || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5">₹{(r.bookingAmount || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5">₹{(r.netAmount || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => downloadReceipt(r.id, r.receiptNo)} className="inline-flex items-center gap-1 rounded bg-gold-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-gold-600">
                      <Download size={12} /> Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
