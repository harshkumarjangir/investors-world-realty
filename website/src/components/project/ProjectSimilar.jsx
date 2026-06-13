'use client';
import { useState, useEffect } from 'react';
import { MapPin, Compass, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProjectSimilar({ data }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, (data.items || []).length - itemsPerPage);

  const nextSlide = () => setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  const prevSlide = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  return (
    <section className="py-24 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-serif text-dark-bg">{data.title}</h2>
          <Link href={data.linkUrl} className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors">
            {data.linkText}
          </Link>
        </div>

        {/* Cards Carousel */}
        <div className="relative group px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(data.items || []).slice(currentIndex, currentIndex + itemsPerPage).map((project, index) => (
              <div key={index} className="border border-gray-200 group bg-white">
                
                {/* Image & Badge */}
                <div className="relative h-[300px] w-full overflow-hidden">
                  <div className={`absolute top-4 left-4 z-10 text-white text-xs px-3 py-1 font-medium ${project.badgeColor || 'bg-dark-bg'}`}>
                    {project.badge}
                  </div>
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-serif text-dark-bg">{project.title}</h3>
                    <span className="text-sm text-gray-700 font-serif">{project.type}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <MapPin size={14} className="mr-1" />
                    {project.location}
                  </div>

                  <div className="flex justify-between items-center text-sm mb-8 pb-6 border-b border-gray-100">
                    <span className="text-gray-700">Price: <span className="font-medium">{project.price}</span></span>
                    <span className="text-gray-700">Size: {project.size}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    {project.btn1Text && (
                      <a href={project.btn1Link || "#"} className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center">
                        <Compass size={16} className="mr-2" />
                        {project.btn1Text}
                      </a>
                    )}
                    {project.btn2Text && (
                      <a href={project.btn2Link || "#"} className="flex-1 bg-white border border-gold-600 text-gold-600 hover:bg-gold-50 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center">
                        <MessageSquare size={16} className="mr-2" />
                        {project.btn2Text}
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button onClick={prevSlide} className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 bg-white text-dark-bg p-3 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 hover:bg-gold-600 hover:text-white shadow-lg border border-gray-100">
              <ChevronLeft size={24} />
            </button>
          )}
          {currentIndex < maxIndex && (
            <button onClick={nextSlide} className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 bg-white text-dark-bg p-3 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 hover:bg-gold-600 hover:text-white shadow-lg border border-gray-100">
              <ChevronRight size={24} />
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
