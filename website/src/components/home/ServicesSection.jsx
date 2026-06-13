import { MapPin, Home, Building, TrendingUp, BookOpen, Key } from 'lucide-react';

const iconMap = [MapPin, Home, Key, TrendingUp, BookOpen, Building];

export default function ServicesSection({ data }) {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row gap-16 items-center">
        
        {/* Left Side: Expanding Image Accordion */}
        <div className="w-full lg:w-[65%] flex h-[500px] gap-2 overflow-hidden">
          {data.items.map((service, index) => {
            const Icon = iconMap[index % iconMap.length];
            return (
              <div 
                key={index} 
                className="relative flex-1 hover:flex-[4] transition-all duration-700 ease-in-out overflow-hidden group cursor-pointer rounded-xl shadow-md"
              >
                {/* Background Image */}
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 z-0" 
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/95 via-[#111827]/50 to-transparent transition-opacity duration-500 z-10 group-hover:from-[#111827]/90"></div>
                
                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 md:p-6 pb-8 text-center items-center">
                  <div className="w-12 h-12 rounded-full border border-gold-500/50 bg-black/30 backdrop-blur-sm text-gold-400 mb-4 flex items-center justify-center transition-all duration-500 group-hover:bg-gold-500 group-hover:text-dark-bg group-hover:scale-110 shrink-0">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-white text-sm md:text-base font-bold font-serif text-center transition-all duration-500 group-hover:text-2xl group-hover:mb-2 leading-tight">
                    {service.title}
                  </h3>
                  
                  {/* Hidden Description */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-[80px] overflow-hidden flex items-center justify-center mt-3 max-w-[90%]">
                    <p className="text-gray-300 text-sm leading-relaxed hidden md:block">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Text Description */}
        <div className="w-full lg:w-[35%] flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark-bg mb-6 font-serif tracking-tight leading-tight">
            {data.title}
          </h2>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 font-light border-l-2 border-gold-500 pl-6">
            Crafting quality spaces with innovation and expertise. Your trusted partner in real estate investments since 13+ Years.
          </p>
          <div>
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center bg-gold-600 hover:bg-gold-500 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg shadow-gold-600/20"
            >
              Get Started
            </a>
          </div>
        </div>
        
      </div>
    </section>
  );
}
