import { BookOpen, ShieldCheck, TrendingUp } from 'lucide-react';

export default function FeaturesSection({ data }) {
  // Map icons to features based on index
  const icons = [BookOpen, ShieldCheck, TrendingUp];

  return (
    <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="md:w-2/3">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight tracking-tight">
              {data.title}
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-xl">
              {data.subtitle}
            </p>
          </div>
          <div>
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center bg-gold-600 hover:bg-gold-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] tracking-wide uppercase text-sm"
            >
              Apply Now
            </a>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.items.map((feature, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div 
                key={index} 
                className="group relative bg-[#111827] border border-white/5 rounded-3xl p-10 hover:bg-[#1f2937] transition-all duration-500 overflow-hidden"
              >
                {/* Decorative hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 to-gold-500/0 group-hover:from-gold-500/5 group-hover:to-transparent transition-colors duration-500 z-0"></div>
                
                {/* Icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#1f2937] border border-white/10 flex items-center justify-center mb-8 group-hover:bg-gold-500/20 group-hover:border-gold-500/50 transition-all duration-500 group-hover:-translate-y-1">
                  <Icon size={28} className="text-gold-400" strokeWidth={1.5} />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-gold-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-light text-base group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
