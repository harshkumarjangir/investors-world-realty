'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

const placeholderProperties = [
  { _id: '1', name: 'Green Valley Villas', location: 'Noida, UP', price: 4500000, type: 'Villa', status: 'available' },
  { _id: '2', name: 'Sunrise Apartments', location: 'Gurgaon, HR', price: 3200000, type: 'Apartment', status: 'available' },
  { _id: '3', name: 'Royal Heights', location: 'Lucknow, UP', price: 2800000, type: 'Apartment', status: 'sold' },
  { _id: '4', name: 'Palm Residency', location: 'Jaipur, RJ', price: 5500000, type: 'Villa', status: 'available' },
  { _id: '5', name: 'Lake View Plots', location: 'Udaipur, RJ', price: 1500000, type: 'Plot', status: 'available' },
  { _id: '6', name: 'Metro Heights', location: 'Delhi, DL', price: 7200000, type: 'Apartment', status: 'available' },
  { _id: '7', name: 'Garden City Homes', location: 'Bangalore, KA', price: 6800000, type: 'Villa', status: 'sold' },
  { _id: '8', name: 'Skyline Towers', location: 'Mumbai, MH', price: 9500000, type: 'Apartment', status: 'available' },
];

export default function PropertiesPage() {
  const { t } = useI18n();
  const [properties, setProperties] = useState(placeholderProperties);
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProperties() {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBase) return;
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/public/properties`);
        if (res.ok) {
          const data = await res.json();
          if (data.properties && data.properties.length > 0) {
            setProperties(data.properties);
          }
        }
      } catch {
        // Use placeholder data on failure
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const filtered = properties.filter((p) => {
    if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
    if (filters.type && p.type !== filters.type) return false;
    return true;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">{t('properties.title')}</h1>
          <p className="mt-4 text-lg text-indigo-100">
            Find your perfect investment property
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder={t('properties.filter.location')}
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">{t('properties.filter.type')}</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="Commercial">Commercial</option>
            </select>
            <button
              onClick={() => setFilters({ location: '', minPrice: '', maxPrice: '', type: '' })}
              className="px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Property Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 dark:text-slate-400">Loading properties...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-slate-500 dark:text-slate-400">No properties found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((property) => (
                <Link
                  key={property._id}
                  href={`/properties/${property._id}`}
                  className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <svg className="w-12 h-12 text-indigo-300 dark:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${property.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {property.status === 'available' ? 'Available' : 'Sold'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{property.type}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* EMI Calculator Link */}
          <div className="mt-12 text-center">
            <Link
              href="/properties/emi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t('properties.emi.title')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
