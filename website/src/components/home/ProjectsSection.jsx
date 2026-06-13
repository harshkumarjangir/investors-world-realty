import { MapPin, Building2 } from 'lucide-react';

export default function ProjectsSection({ data }) {
  if (!data) return null;

  return (
    <section id="projects" className="py-24 bg-gradient-to-b from-[#fffaf0] to-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16">
          {data.pillText && (
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-gold-50/80 border border-gold-200 mb-6 shadow-sm">
              <Building2 size={14} className="text-gold-600" />
              <span className="text-gold-700 text-xs font-bold tracking-widest uppercase">
                {data.pillText}
              </span>
            </div>
          )}
          
          {data.mainHeading && (
            <h2 
              className="text-4xl md:text-5xl font-bold text-dark-bg mb-4 font-serif tracking-tight"
              dangerouslySetInnerHTML={{ __html: data.mainHeading.replace('Premium Living', '<span class="text-gold-600">Premium Living</span>') }}
            />
          )}
          
          {data.subtitle && (
            <p className="text-gray-500 text-base max-w-2xl mt-2 font-medium">
              {data.subtitle}
            </p>
          )}
          
          {data.title && (
            <h3 className="text-2xl font-semibold text-dark-bg mt-8">
              {data.title}
            </h3>
          )}
        </div>
        
        {/* Horizontal Slider Section */}
        <div className="flex overflow-x-auto gap-6 pb-12 pt-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {(data.items || []).map((project, index) => {
            const isSoldOut = project.status === "Sold Out";
            
            return (
              <div 
                key={index} 
                className="relative min-w-[85vw] sm:min-w-[340px] md:min-w-[400px] lg:min-w-[450px] h-[500px] rounded-[2rem] overflow-hidden group snap-center shadow-md hover:shadow-2xl transition-all duration-500 flex-shrink-0 cursor-pointer"
              >
                {/* Image */}
                <img 
                  src={project.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"} 
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay for Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-[#111827]/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Top Badge */}
                <div className="absolute top-6 left-6 z-20">
                  <span className={`px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 ${
                    isSoldOut 
                      ? 'bg-black/70 backdrop-blur-md text-white' 
                      : 'bg-gradient-to-r from-gold-500 to-yellow-600 text-white'
                  }`}>
                    {!isSoldOut && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                    {project.status}
                  </span>
                </div>
                
                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl md:text-3xl font-serif text-white mb-2 font-bold drop-shadow-md">
                    {project.name}
                  </h3>
                  {project.location && (
                    <div className="flex items-center text-gray-300 group-hover:text-gold-400 transition-colors">
                      <MapPin size={16} className="mr-2 shrink-0" />
                      <span className="text-sm font-medium tracking-wide">{project.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
