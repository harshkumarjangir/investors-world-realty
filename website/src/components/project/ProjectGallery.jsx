'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectGallery({ data }) {
  const [activeTab, setActiveTab] = useState(data.tabs?.[0] || 'Exterior');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  const filteredImages = (data.images || []).filter(img => img.category === activeTab);
  const itemsPerPage = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, filteredImages.length - itemsPerPage);

  const nextSlide = () => setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  const prevSlide = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

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

        {/* Gallery Carousel */}
        <div className="relative group px-4 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredImages.slice(currentIndex, currentIndex + itemsPerPage).map((img, index) => (
              <div key={index} className="aspect-[4/3] overflow-hidden">
                <img 
                  src={img.url || img} 
                  alt={`Gallery ${activeTab} ${index + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 bg-dark-bg/80 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 hover:bg-gold-600 shadow-md">
              <ChevronLeft size={24} />
            </button>
          )}
          {currentIndex < maxIndex && (
            <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 bg-dark-bg/80 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 hover:bg-gold-600 shadow-md">
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
