import { Droplets, Activity, ChevronLeft, ChevronRight, Trees, Dumbbell, GlassWater, Sun, Home, User, Tent } from 'lucide-react';

// Mapping string names from JSON to lucide icons
const iconMap = {
  'yoga': User,
  'water': Droplets,
  'cricket': Activity,
  'temple': Home,
  'gym': Dumbbell,
  'party': GlassWater,
  'pool': Sun,
  'chess': Tent,
  'spa': User,
};

export default function ProjectAmenities({ data }) {
  return (
    <section id="amenities" className="py-24 bg-gray-50 border-y border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-dark-bg mb-16">{data.title}</h2>
        
        <div className="relative group px-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12">
            {data.items.map((item, index) => {
              const IconComponent = iconMap[item.icon] || Trees; // fallback icon
              // Add a right border to all but the last item in a row (for md screens)
              const borderClass = (index + 1) % 5 !== 0 ? 'md:border-r border-gray-200' : '';
              
              return (
                <div key={index} className={`flex flex-col items-center justify-center py-4 ${borderClass}`}>
                  <div className="text-gold-600 mb-4 h-12 w-12 flex items-center justify-center">
                    <IconComponent size={36} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-serif text-gray-700">{item.title}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows for Amenities carousel (visual only for now) */}
          <button className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-bg transition-colors bg-white rounded-full p-1 shadow-sm border border-gray-100">
            <ChevronLeft size={24} />
          </button>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-bg transition-colors bg-white rounded-full p-1 shadow-sm border border-gray-100">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
