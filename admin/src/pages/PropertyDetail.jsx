import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Tag, CheckCircle2, Ruler, PlayCircle, Image as ImageIcon } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const statusColors = {
  AVAILABLE: 'bg-green-100 text-green-700',
  BOOKED: 'bg-yellow-100 text-yellow-700',
  SOLD: 'bg-red-100 text-red-700',
  HOLD: 'bg-orange-100 text-orange-700',
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/properties/${id}`);
      setProperty(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load property details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500 font-medium">{t('common.loading') || 'Loading...'}</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-gray-500 mb-4 text-lg">Property not found.</p>
        <button
          onClick={() => navigate('/properties')}
          className="rounded-lg bg-gold-500 px-4 py-2 text-white hover:bg-gold-600 font-medium"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  const { images = [], videos = [] } = property;
  const mainImage = images[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <button
          onClick={() => navigate('/properties')}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{property.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <MapPin size={14} />
            <span>{property.location || `${property.city || ''}, ${property.state || ''}`}</span>
            {property.scheme?.schemeName && (
              <>
                <span className="mx-2">•</span>
                <span className="text-gold-600 font-medium">{property.scheme.schemeName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
            <img src={mainImage} alt={property.name} className="w-full h-full object-cover" />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">About this Property</h2>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
              {property.description || 'No description provided.'}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 text-gold-700 px-3 py-1.5 text-xs font-medium">
                    <CheckCircle2 size={12} />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-gray-800 mb-4">
              ₹{Number(property.price).toLocaleString()}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Tag size={16} />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColors[property.status] || 'bg-gray-100 text-gray-700'}`}>
                  {property.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Building2 size={16} />
                  <span className="text-sm font-medium">Type</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{property.type || '-'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Ruler size={16} />
                  <span className="text-sm font-medium">Area</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{property.area} sq.ft</span>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon size={18} className="text-gold-500" />
                Image Gallery ({images.length})
              </h2>
            </div>
            <div className="p-4">
              {images.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No images uploaded.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={img.url} alt="Property" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Videos */}
          {videos.length > 0 && (
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <PlayCircle size={18} className="text-purple-500" />
                  Video
                </h2>
              </div>
              <div className="p-4">
                <video src={videos[0].url} controls className="w-full rounded-lg bg-black" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
