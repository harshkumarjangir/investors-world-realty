import { useState, useEffect, Fragment } from 'react';
import { Plus, Edit, Image, Video, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

export default function Properties() {
  const { t } = useI18n();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, [page]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/properties', { params: { page, pageSize: 15 } });
      setProperties(res.data?.data || res.data?.properties || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.delete(`/admin/properties/${id}`);
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-700',
    BOOKED: 'bg-yellow-100 text-yellow-700',
    SOLD: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('properties.title')}</h1>
        <button
          onClick={() => { setEditingProperty(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} />
          {t('properties.add')}
        </button>
      </div>

      {/* Property Form Modal */}
      {showForm && (
        <PropertyForm
          property={editingProperty}
          onClose={() => { setShowForm(false); setEditingProperty(null); }}
          onSuccess={() => { setShowForm(false); setEditingProperty(null); fetchProperties(); }}
        />
      )}

      {/* Image Upload Modal */}
      {imageModal && (
        <ImageUploadModal
          propertyId={imageModal}
          onClose={() => setImageModal(null)}
        />
      )}

      {/* Video Upload Modal */}
      {videoModal && (
        <VideoUploadModal
          propertyId={videoModal}
          onClose={() => setVideoModal(null)}
        />
      )}

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : properties.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                properties.map((p) => (
                  <Fragment key={p.id}>
                    <tr className="border-b border-gray-50 even:bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.location || `${p.city || ''}, ${p.state || ''}`}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">₹{Number(p.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{p.type || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-700'}`}>
                          {p.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(p)} className="rounded p-1.5 text-gray-600 hover:bg-gray-200" title="Edit">
                            <Edit size={15} />
                          </button>
                          <button onClick={() => setImageModal(p.id)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50" title="Images">
                            <Image size={15} />
                          </button>
                          <button onClick={() => setVideoModal(p.id)} className="rounded p-1.5 text-purple-600 hover:bg-purple-50" title="Video">
                            <Video size={15} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50" title="Delete">
                            <Trash2 size={15} />
                          </button>
                          <button
                            onClick={() => setExpandedInquiry(expandedInquiry === p.id ? null : p.id)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                            title="Inquiries"
                          >
                            {expandedInquiry === p.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedInquiry === p.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 bg-gray-50">
                          <InquiriesSection propertyId={p.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
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

function PropertyForm({ property, onClose, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: property?.name || '',
    description: property?.description || '',
    location: property?.location || '',
    city: property?.city || '',
    state: property?.state || '',
    area: property?.area || '',
    price: property?.price || '',
    type: property?.type || '',
    amenities: property?.amenities || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (property?.id) {
        await api.patch(`/admin/properties/${property.id}`, form);
      } else {
        await api.post('/admin/properties', form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {property ? t('properties.edit') : t('properties.add')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" placeholder="Property Name *" value={form.name} onChange={handleChange} required className={inputCls} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className={inputCls} />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} className={inputCls} />
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} className={inputCls} />
            <input name="area" placeholder="Area (sq ft)" value={form.area} onChange={handleChange} className={inputCls} />
            <input name="price" placeholder="Price *" type="number" value={form.price} onChange={handleChange} required className={inputCls} />
            <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
              <option value="">Select Type</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="PLOT">Plot</option>
              <option value="FARMHOUSE">Farmhouse</option>
            </select>
          </div>
          <input name="amenities" placeholder="Amenities (comma separated)" value={form.amenities} onChange={handleChange} className={inputCls} />
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageUploadModal({ propertyId, onClose }) {
  const { t } = useI18n();
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!files || files.length === 0) return;
    if (files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      await api.post(`/admin/properties/${propertyId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Images uploaded successfully');
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('properties.images')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="text-xs text-gray-500">Max 10 images. Supported: JPG, PNG, WebP</p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button onClick={handleUpload} disabled={uploading || !files} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {uploading ? t('common.loading') : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoUploadModal({ propertyId, onClose }) {
  const { t } = useI18n();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('video', file);
      await api.post(`/admin/properties/${propertyId}/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Video uploaded successfully');
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('properties.video')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="text-xs text-gray-500">Single video file. Supported: MP4, WebM</p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button onClick={handleUpload} disabled={uploading || !file} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {uploading ? t('common.loading') : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InquiriesSection({ propertyId }) {
  const { t } = useI18n();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, [propertyId]);

  const fetchInquiries = async () => {
    try {
      const res = await api.get(`/admin/properties/${propertyId}/inquiries`);
      const data = res.data?.data || res.data?.inquiries || res.data;
      setInquiries(Array.isArray(data) ? data : []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">{t('common.loading')}</p>;
  if (inquiries.length === 0) return <p className="text-sm text-gray-400">No inquiries</p>;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{t('properties.inquiries')}</p>
      {inquiries.map((inq, idx) => (
        <div key={inq.id || idx} className="rounded-lg bg-white p-3 border border-gray-200 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-800">{inq.name || inq.associateName}</span>
            <span className="text-xs text-gray-500">{new Date(inq.date || inq.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-600 mt-1">{inq.message || inq.phone || '-'}</p>
        </div>
      ))}
    </div>
  );
}
