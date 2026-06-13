"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function PropertyFilters({ currentParams }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    location: currentParams.location || '',
    type: currentParams.type || '',
    minPrice: currentParams.minPrice || '',
    maxPrice: currentParams.maxPrice || '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (filters.location) query.append('location', filters.location);
    if (filters.type) query.append('type', filters.type);
    if (filters.minPrice) query.append('minPrice', filters.minPrice);
    if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);
    
    router.push(`/properties?${query.toString()}`);
  };

  const handleClear = () => {
    setFilters({ location: '', type: '', minPrice: '', maxPrice: '' });
    router.push('/properties');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
      <h3 className="text-xl font-serif text-[#0a0f1a] mb-6">Filter Search</h3>
      
      <form onSubmit={handleApply} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
          <select 
            name="type" 
            value={filters.type} 
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-gold-500 focus:ring-gold-500 p-2.5 bg-gray-50 text-gray-900"
          >
            <option value="">All Types</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="FARMHOUSE">Farmhouse</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input 
            type="text" 
            name="location"
            placeholder="e.g. Vaishali Nagar"
            value={filters.location} 
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-gold-500 focus:ring-gold-500 p-2.5 bg-gray-50 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
          <input 
            type="number" 
            name="minPrice"
            placeholder="0"
            value={filters.minPrice} 
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-gold-500 focus:ring-gold-500 p-2.5 bg-gray-50 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
          <input 
            type="number" 
            name="maxPrice"
            placeholder="Any"
            value={filters.maxPrice} 
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-gold-500 focus:ring-gold-500 p-2.5 bg-gray-50 text-gray-900"
          />
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button 
            type="submit" 
            className="w-full bg-[#0a0f1a] text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors"
          >
            Apply Filters
          </button>
          <button 
            type="button" 
            onClick={handleClear}
            className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </form>
    </div>
  );
}
