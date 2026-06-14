import { useState, useEffect, Fragment } from 'react';
import { Plus, Edit, Image, Video, Trash2, X, ChevronDown, ChevronUp, Building2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const ic = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200 outline-none';
const lc = 'block text-xs font-medium text-gray-600 mb-1';

const statusColors = {
  AVAILABLE: 'bg-green-100 text-green-700',
  BOOKED: 'bg-yellow-100 text-yellow-700',
  SOLD: 'bg-red-100 text-red-700',
  HOLD: 'bg-orange-100 text-orange-700',
};

export default function Properties() {
  const { t } = useI18n();
  const [schemes, setSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    if (selectedScheme) {
      fetchProperties();
    } else {
      setProperties([]);
    }
  }, [selectedScheme, page]);

  const fetchSchemes = async () => {
    try {
      setSchemesLoading(true);
      const res = await api.get('/admin/masters/schemes', { params: { pageSize: 200 } });
      const list = res.data?.data || [];
      setSchemes(list);
      if (list.length === 1 && !selectedScheme) {
        setSelectedScheme(list[0]);
      }
    } catch (err) {
      console.error('Failed to load schemes', err);
    } finally {
      setSchemesLoading(false);
    }
  };

  const fetchProperties = async () => {
    if (!selectedScheme?.id) return;
    try {
      setLoading(true);
      const res = await api.get('/admin/properties', {
        params: { page, pageSize: 15, schemeId: selectedScheme.id },
      });
      setProperties(res.data?.data || res.data?.properties || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load properties', err);
      setProperties([]);
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/properties/${id}/status`, { status: newStatus });
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const selectScheme = (scheme) => {
    setSelectedScheme(scheme);
    setPage(1);
    setExpandedInquiry(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 size={24} className="text-gold-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('properties.title')}</h1>
            <p className="text-sm text-gray-500">{t('properties.schemeHint')}</p>
          </div>
        </div>
        {selectedScheme && (
          <button
            type="button"
            onClick={() => { setEditingProperty(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-gold-600"
          >
            <Plus size={16} />
            {t('properties.add')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schemes list */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">{t('properties.schemes')}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {t('properties.selectScheme')}{' '}
              <Link to="/masters" className="text-gold-600 hover:underline">{t('properties.mastersLink')}</Link>
            </p>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {schemesLoading ? (
              <p className="py-8 text-center text-sm text-gray-400">{t('common.loading')}</p>
            ) : schemes.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                <p>{t('properties.noSchemes')}</p>
                <Link to="/masters" className="mt-2 inline-block text-gold-600 hover:underline text-sm font-medium">
                  {t('properties.addScheme')}
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {schemes.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => selectScheme(s)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
                        selectedScheme?.id === s.id ? 'bg-gold-50 border-l-4 border-gold-500' : ''
                      }`}
                    >
                      <p className="font-medium text-gray-800 text-sm">{s.schemeName}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {[s.city, s.state].filter(Boolean).join(', ') || s.address || '—'}
                      </p>
                      {s.schemeType && (
                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                          {s.schemeType}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Properties under selected scheme */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedScheme ? (
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-12 text-center text-gray-500">
              <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
              <p>{t('properties.pickScheme')}</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-gold-50 border border-gold-100 px-4 py-3 text-sm">
                <span className="text-gray-600">{t('properties.underScheme')}:</span>{' '}
                <span className="font-semibold text-gray-800">{selectedScheme.schemeName}</span>
                {selectedScheme.city && (
                  <span className="text-gray-500 ml-2">
                    — {selectedScheme.city}{selectedScheme.state ? `, ${selectedScheme.state}` : ''}
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
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
                        <tr><td colSpan={7} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
                      ) : properties.length === 0 ? (
                        <tr><td colSpan={7} className="py-8 text-center text-gray-400">{t('properties.noneInScheme')}</td></tr>
                      ) : (
                        properties.map((p, idx) => (
                          <Fragment key={p.id}>
                            <tr className="border-b border-gray-50 even:bg-gray-50 hover:bg-gray-100">
                              <td className="px-4 py-3 text-gray-500">{(page - 1) * 15 + idx + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                              <td className="px-4 py-3 text-gray-600">{p.location || `${p.city || ''}, ${p.state || ''}`}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">₹{Number(p.price || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-gray-600">{p.type || '-'}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={p.status}
                                  onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium border border-gray-200 outline-none cursor-pointer ${
                                    statusColors[p.status] || 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <option value="AVAILABLE">AVAILABLE</option>
                                  <option value="HOLD">HOLD</option>
                                  <option value="BOOKED">BOOKED</option>
                                  <option value="SOLD">SOLD</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Link to={`/properties/${p.id}`} className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50" title="View Details">
                                    <Eye size={15} />
                                  </Link>
                                  <button type="button" onClick={() => handleEdit(p)} className="rounded p-1.5 text-gray-600 hover:bg-gray-200" title="Edit">
                                    <Edit size={15} />
                                  </button>
                                  <button type="button" onClick={() => setImageModal(p.id)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50" title="Images">
                                    <Image size={15} />
                                  </button>
                                  <button type="button" onClick={() => setVideoModal(p.id)} className="rounded p-1.5 text-purple-600 hover:bg-purple-50" title="Video">
                                    <Video size={15} />
                                  </button>
                                  <button type="button" onClick={() => handleDelete(p.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50" title="Delete">
                                    <Trash2 size={15} />
                                  </button>
                                  <button
                                    type="button"
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
                                <td colSpan={7} className="px-4 py-3 bg-gray-50">
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showForm && selectedScheme && (
        <PropertyForm
          property={editingProperty}
          schemes={schemes}
          defaultScheme={selectedScheme}
          onClose={() => { setShowForm(false); setEditingProperty(null); }}
          onSuccess={() => { setShowForm(false); setEditingProperty(null); fetchProperties(); }}
        />
      )}

      {imageModal && <ImageUploadModal propertyId={imageModal} onClose={() => setImageModal(null)} />}
      {videoModal && <VideoUploadModal propertyId={videoModal} onClose={() => setVideoModal(null)} />}
    </div>
  );
}

function PropertyForm({ property, schemes, defaultScheme, onClose, onSuccess }) {
  const { t } = useI18n();
  const amenitiesStr = Array.isArray(property?.amenities)
    ? property.amenities.join(', ')
    : (property?.amenities || '');

  const [form, setForm] = useState({
    schemeId: property?.schemeId || defaultScheme?.id || '',
    name: property?.name || '',
    description: property?.description || '',
    location: property?.location || defaultScheme?.address || '',
    city: property?.city || defaultScheme?.city || '',
    state: property?.state || defaultScheme?.state || '',
    area: property?.area ?? '',
    price: property?.price ?? '',
    type: property?.type || '',
    amenities: amenitiesStr,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [publicStates, setPublicStates] = useState([]);
  const [publicCities, setPublicCities] = useState([]);

  useEffect(() => {
    fetchPublicStates();
  }, []);

  useEffect(() => {
    if (form.state) {
      fetchPublicCities(form.state);
    } else {
      setPublicCities([]);
    }
  }, [form.state]);

  const fetchPublicStates = async () => {
    try {
      const res = await api.get('/public/states');
      setPublicStates(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load public states', err);
    }
  };

  const fetchPublicCities = async (stateName) => {
    try {
      const res = await api.get('/public/cities', { params: { state: stateName } });
      setPublicCities(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load public cities', err);
    }
  };

  const handleSchemeChange = (schemeId) => {
    const scheme = schemes.find((s) => s.id === schemeId);
    setForm((prev) => ({
      ...prev,
      schemeId,
      ...(scheme && !property?.id
        ? {
            location: scheme.address || prev.location,
            city: scheme.city || prev.city,
            state: scheme.state || prev.state,
          }
        : {}),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'schemeId') {
      handleSchemeChange(value);
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.schemeId) {
      setError('Please select a scheme');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...form,
        amenities: form.amenities,
      };
      if (property?.id) {
        await api.patch(`/admin/properties/${property.id}`, payload);
      } else {
        await api.post('/admin/properties', payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {property ? t('properties.edit') : t('properties.add')}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={lc}>{t('properties.scheme')} *</label>
            <select name="schemeId" value={form.schemeId} onChange={handleChange} required className={ic}>
              <option value="">{t('properties.selectSchemeOption')}</option>
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>{s.schemeName}</option>
              ))}
            </select>
          </div>
          <input name="name" placeholder="Property Name *" value={form.name} onChange={handleChange} required className={ic} />
          <textarea name="description" placeholder="Description *" value={form.description} onChange={handleChange} rows={3} required className={ic} />
          <div className="grid grid-cols-2 gap-3">
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className={ic} />
            <select name="state" value={form.state} onChange={handleChange} className={ic}>
              <option value="">Select State</option>
              {publicStates.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <select name="city" value={form.city} onChange={handleChange} className={ic}>
              <option value="">Select City</option>
              {publicCities.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <input name="area" placeholder="Area (sq ft) *" value={form.area} onChange={handleChange} required className={ic} />
            <input name="price" placeholder="Price *" type="number" value={form.price} onChange={handleChange} required className={ic} />
            <select name="type" value={form.type} onChange={handleChange} required className={ic}>
              <option value="">{t('properties.selectType')}</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="PLOT">Plot</option>
              <option value="FARMHOUSE">Farmhouse</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
            </select>
          </div>
          <input name="amenities" placeholder="Amenities (comma separated)" value={form.amenities} onChange={handleChange} className={ic} />
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50">
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
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gold-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gold-600 hover:file:bg-gold-100"
          />
          <p className="text-xs text-gray-500">Max 10 images. Supported: JPG, PNG, WebP</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="button" onClick={handleUpload} disabled={uploading || !files} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50">
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
      setUploadting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('properties.video')}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gold-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gold-600 hover:file:bg-gold-100"
          />
          <p className="text-xs text-gray-500">Single video file. Supported: MP4, WebM</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="button" onClick={handleUpload} disabled={uploading || !file} className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-white hover:bg-gold-600 disabled:opacity-50">
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
