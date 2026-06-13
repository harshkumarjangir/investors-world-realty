'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectGallery({ data }) {
  const [activeTab, setActiveTab] = useState(data.tabs[1] || 'Interior');

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-dark-bg mb-10">{data.title}</h2>
        
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {data.tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-gold-600 text-white' 
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Gallery Carousel placeholder */}
        <div className="relative group">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.images.map((img, index) => (
              <div key={index} className="aspect-[4/3] overflow-hidden">
                <img 
                  src={img} 
                  alt={`Gallery ${activeTab} ${index + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 bg-dark-bg/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={24} />
          </button>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 bg-dark-bg/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
