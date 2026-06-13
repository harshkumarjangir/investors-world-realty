import { Target, Eye } from 'lucide-react';

export default function MissionVision({ data }) {
  return (
    <section className="py-20 lg:py-32 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-serif text-[#0a0f1a] leading-[1.15] mb-4">
            Rooted in Trust, <br className="hidden md:block" />
            <span className="text-gold-600 italic">Growing with Vision</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
          
          {/* Mission Card */}
          <div className="flex-1 bg-white p-10 lg:p-14 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-300 to-gold-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 bg-gold-50 rounded-full flex items-center justify-center text-gold-600 group-hover:bg-gold-500 group-hover:text-white transition-colors duration-500">
                <Target size={26} strokeWidth={2} />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-[#0a0f1a] tracking-wide">{data.mission.title}</h3>
            </div>
            
            <ul className="space-y-5">
              {data.mission.items.map((item, index) => (
                <li key={index} className="flex items-start text-gray-600 leading-[1.8]">
                  <span className="text-gold-500 mr-4 text-xl leading-none mt-0.5">•</span>
                  <span className="text-[15px] lg:text-base font-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vision Card */}
          <div className="flex-1 bg-white p-10 lg:p-14 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                <Eye size={26} strokeWidth={2} />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-[#0a0f1a] tracking-wide">{data.vision.title}</h3>
            </div>
            
            <ul className="space-y-5">
              {data.vision.items.map((item, index) => (
                <li key={index} className="flex items-start text-gray-600 leading-[1.8]">
                  <span className="text-blue-500 mr-4 text-xl leading-none mt-0.5">•</span>
                  <span className="text-[15px] lg:text-base font-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
