import { MapPin, Compass, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ProjectSimilar({ data }) {
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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.items.map((project, index) => (
            <div key={index} className="border border-gray-200 group bg-white">
              
              {/* Image & Badge */}
              <div className="relative h-[300px] w-full overflow-hidden">
                <div className={`absolute top-4 left-4 z-10 text-white text-xs px-3 py-1 font-medium ${project.badgeColor}`}>
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
                  <button className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center">
                    <Compass size={16} className="mr-2" />
                    Explore More
                  </button>
                  <button className="flex-1 bg-white border border-gold-600 text-gold-600 hover:bg-gold-50 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center">
                    <MessageSquare size={16} className="mr-2" />
                    Enquire Now
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
