import { Download } from 'lucide-react';

export default function ProjectOverview({ data }) {
  return (
    <section id="overview" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Project Logo/Title area */}
        <div className="mb-10 flex flex-col items-center">
          <h2 className="text-4xl font-serif text-teal-600 mb-2">{data.logo}</h2>
          <p className="text-gray-400 uppercase tracking-[0.2em] text-xs font-semibold">{data.tagline}</p>
        </div>
        
        <p className="text-sm font-bold text-dark-bg mb-6">
          RERA Registration Number: {data.rera}
        </p>
        
        <p className="text-gray-500 font-serif italic mb-8">
          {data.subtitle}
        </p>
        
        <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-20 text-lg">
          {data.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          {data.stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-serif text-dark-bg mb-4 block">
                {stat.value}
              </span>
              <span className="text-gray-500 text-sm tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Download Brochure Button */}
        {(data.cta?.text || data.cta?.link) && (
          <div>
            <a href={data.cta?.link || "#"} className="inline-flex items-center justify-center border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-colors px-8 py-3 rounded text-sm font-bold shadow-sm">
              <Download size={18} className="mr-2" />
              {data.cta?.text || "Download Brochure"}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
