import React, { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Phone, User, Trash2, Eye, X, Loader2, MessageSquare } from 'lucide-react';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inquiries');
      setInquiries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch contact inquiries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleOpenInquiry = (inq) => {
    setSelectedInquiry(inq);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await api.delete(`/inquiries/${id}`);
        setInquiries(prev => prev.filter(inq => inq._id !== id));
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry(null);
        }
      } catch (error) {
        alert('Failed to delete inquiry');
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0a0f1a]">Contact Inquiries</h1>
        <p className="text-gray-500 mt-2">View and manage contact requests submitted from the main website.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gold-500" size={48} />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Inquiries Found</h3>
          <p className="text-gray-500 max-w-md">You haven't received any contact inquiries yet. Once users submit the contact form, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-sm text-gray-700 uppercase tracking-wider">User details</th>
                  <th className="px-6 py-4 font-bold text-sm text-gray-700 uppercase tracking-wider">Message snippet</th>
                  <th className="px-6 py-4 font-bold text-sm text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold text-sm text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr 
                    key={inq._id} 
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* User Details */}
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-bold">{inq.name}</div>
                      <div className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                        <Mail size={12} /> {inq.email}
                      </div>
                      {inq.phone && (
                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {inq.phone}
                        </div>
                      )}
                    </td>

                    {/* Message Snippet */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-gray-600 text-sm truncate">{inq.message}</div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(inq.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenInquiry(inq)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Message"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(inq._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Inquiry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-serif">Inquiry Details</h3>
                <span className="text-xs text-gray-400">Received on {formatDate(selectedInquiry.createdAt)}</span>
              </div>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User details section */}
              <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5 text-gray-800">
                  <User size={16} className="text-gold-500 shrink-0" />
                  <span className="font-bold">{selectedInquiry.name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <a href={`mailto:${selectedInquiry.email}`} className="hover:underline">{selectedInquiry.email}</a>
                </div>
                {selectedInquiry.phone && (
                  <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                    <Phone size={16} className="text-gray-400 shrink-0" />
                    <a href={`tel:${selectedInquiry.phone}`} className="hover:underline">{selectedInquiry.phone}</a>
                  </div>
                )}
              </div>

              {/* Message section */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Inquiry Message</h4>
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl text-gray-700 text-sm leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleDelete(selectedInquiry._id)}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
