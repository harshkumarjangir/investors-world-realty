import { useState, useEffect } from 'react';
import { Filter, Download, BookOpen } from 'lucide-react';
import api from '../common/api.js';

export default function Bookings() {
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

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await api.patch(`/admin/properties/${propertyId}/status`, { status: newStatus });
      // Refresh list to show updated status
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update property status');
    }
  };

  const exportToExcel = () => {
    const headers = ['S.No', 'Associate Code', 'Customer Code', 'Name', 'Project Name', 'Approval Date', 'Mobile', 'Customer Name', 'Customer Mobile', 'Plot No', 'Total Size', 'Property Name', 'Total Cost', 'Deposit Amount', 'Property Status'];
    const rows = bookings.map((b, i) => [
      i + 1, b.associateCode, b.customerCode, b.name, b.projectName,
      b.approvalDate ? new Date(b.approvalDate).toLocaleDateString() : '-',
      b.mobile, b.customerName || '-', b.customerMobile || '-',
      b.plotNo || '-', b.totalSize || '-', b.propertyName,
      b.totalCost || 0, b.amount || 0, b.propertyStatus || '-',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'plot_bookings.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all property bookings and update property statuses.</p>
        </div>
      </div>

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
              <label className="block text-xs text-gray-500 mb-1">Customer Name</label>
              <input type="text" value={filters.customerCode} onChange={(e) => setFilters({ ...filters, customerCode: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200" placeholder="Search..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Associate Code</label>
              <input type="text" value={filters.associateCode} onChange={(e) => setFilters({ ...filters, associateCode: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200" placeholder="IW100001" />
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
                  <th className="px-3 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">Associate</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">Customer</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">Property Name</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">Amount Paid</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">Booking Status</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">Property Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">Loading...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">No bookings found</td></tr>
                ) : (
                  bookings.map((b, idx) => (
                    <tr key={b.id} className="border-b border-gray-50 even:bg-gray-50">
                      <td className="px-3 py-2.5">{(page - 1) * 20 + idx + 1}</td>
                      <td className="px-3 py-2.5">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-gray-800">{b.name}</div>
                        <div className="text-xs text-gray-500">{b.associateCode}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-gray-800">{b.customerName || '-'}</div>
                        <div className="text-xs text-gray-500">{b.customerMobile || '-'}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-gray-800">{b.propertyName}</div>
                        <div className="text-xs text-gray-500">₹{(b.totalCost || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-green-600">₹{(b.amount || 0).toLocaleString()}</td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{b.status}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={b.propertyStatus || ''}
                          onChange={(e) => handleStatusChange(b.propertyId, e.target.value)}
                          className={`rounded border-gray-300 px-2 py-1 text-xs font-medium focus:ring-gold-500 focus:border-gold-500 ${
                            b.propertyStatus === 'AVAILABLE' ? 'bg-green-50 text-green-700' :
                            b.propertyStatus === 'HOLD' ? 'bg-yellow-50 text-yellow-700' :
                            b.propertyStatus === 'BOOKED' ? 'bg-orange-50 text-orange-700' :
                            b.propertyStatus === 'SOLD' ? 'bg-red-50 text-red-700' :
                            'bg-gray-50 text-gray-700'
                          }`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="HOLD">HOLD</option>
                          <option value="BOOKED">BOOKED</option>
                          <option value="SOLD">SOLD</option>
                        </select>
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
    </div>
  );
}
