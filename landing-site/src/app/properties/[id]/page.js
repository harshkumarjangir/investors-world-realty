'use client';

import { useState, useEffect, use } from 'react';
import { useI18n } from '@/lib/i18n';

const placeholderProperty = {
  name: 'Green Valley Villas',
  description: 'A premium villa project nestled in the heart of nature. These spacious villas offer modern amenities with a touch of luxury, perfect for families looking for a peaceful yet connected lifestyle. Each unit features premium finishes, landscaped gardens, and smart home integration.',
  location: 'Sector 150, Noida, Uttar Pradesh',
  area: '2400 sq ft',
  price: 4500000,
  status: 'available',
  type: 'Villa',
  amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Park', '24/7 Security', 'Power Backup', 'Parking', 'Children Play Area'],
  images: [],
};

export default function PropertyDetailPage({ params }) {
  const { id } = use(params);
  const { t } = useI18n();
  const [property, setProperty] = useState(placeholderProperty);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [inquiryStatus, setInquiryStatus] = useState('');

  useEffect(() => {
    async function fetchProperty() {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBase) return;
      try {
        const res = await fetch(`${apiBase}/public/properties/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.property) setProperty(data.property);
        }
      } catch {
        // Use placeholder
      }
    }
    fetchProperty();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    setInquiryStatus('sending');
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/public/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...inquiryForm, propertyId: id }),
        });
        if (res.ok) {
          setInquiryStatus('success');
          setInquiryForm({ name: '', email: '', phone: '', message: '' });
          setTimeout(() => { setShowInquiry(false); setInquiryStatus(''); }, 2000);
          return;
        }
      } catch {
        // fallthrough
      }
    }
    setInquiryStatus('success');
    setInquiryForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => { setShowInquiry(false); setInquiryStatus(''); }, 2000);
  };

  return (
    <div>
      {/* Image Gallery */}
      <section className="bg-slate-100 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 aspect-[16/9] bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center">
              <svg className="w-20 h-20 text-indigo-400 dark:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-300 dark:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-300 dark:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${property.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {property.status === 'available' ? 'Available' : 'Sold'}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{property.type}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {property.name}
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location}
              </p>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Description</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{property.description}</p>
              </div>

              {/* Key Details */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('properties.detail.price')}</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(property.price)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('properties.detail.area')}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{property.area}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('properties.detail.status')}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{property.status}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Type</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{property.type}</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('properties.detail.amenities')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Tour */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('properties.detail.videoTour')}</h2>
                <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50"></div>
                  <button className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <p className="absolute bottom-4 text-white/60 text-sm">Video tour coming soon</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatPrice(property.price)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Starting price</p>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  {t('properties.detail.inquire')}
                </button>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}
      {showInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('properties.detail.inquire')}</h3>
              <button
                onClick={() => setShowInquiry(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {inquiryStatus === 'success' ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Inquiry Sent!</p>
                <p className="text-slate-500 dark:text-slate-400">We will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-4">
                <input
                  type="text"
                  placeholder={t('contact.form.name')}
                  required
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <input
                  type="email"
                  placeholder={t('contact.form.email')}
                  required
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <input
                  type="tel"
                  placeholder={t('contact.form.phone')}
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <textarea
                  placeholder={t('contact.form.message')}
                  rows={3}
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={inquiryStatus === 'sending'}
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {inquiryStatus === 'sending' ? 'Sending...' : t('contact.form.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
