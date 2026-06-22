import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

export default function ServicesSection({ data }) {
  return (
    <section id="services" className="section-padding bg-dark-surface relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-gold-500" />
              <span className="text-gold-400 text-xs font-bold tracking-[0.25em] uppercase">What We Do</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              {data?.title || 'Our Services'}
            </h2>
          </div>
          <div className="lg:max-w-sm">
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              {data?.description || 'Your trusted partner in real estate investments since 13+ years.'}
            </p>
            <a
              href={data?.cta?.link || '#contact'}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 text-[#0a0e1a] font-bold px-6 py-3 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all duration-300 glow-gold-sm"
            >
              {data?.cta?.text || 'Get Started'}
            </a>
          </div>
        </div>

        {/* Services accordion grid */}
        <div className="flex h-[480px] gap-3 overflow-hidden">
          {(data?.items || []).map((service, index) => {
            const Icon = LucideIcons[service.icon] || HelpCircle;
            return (
              <div
                key={index}
                className="relative flex-1 hover:flex-[4] transition-all duration-700 ease-in-out overflow-hidden group cursor-pointer rounded-2xl"
              >
                {/* BG image */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 transition-all duration-500 group-hover:from-black/90" />

                {/* Gold left border on hover */}
                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gold-500 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-center items-center">
                  <div className="w-12 h-12 rounded-xl border border-gold-500/40 bg-black/30 backdrop-blur-sm text-gold-400 mb-3 flex items-center justify-center transition-all duration-500 group-hover:bg-gold-500 group-hover:text-[#0a0e1a] group-hover:scale-110 group-hover:rounded-2xl shrink-0">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-white text-sm font-bold transition-all duration-500 group-hover:text-xl group-hover:mb-3 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {service.title}
                  </h3>
                  <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500 delay-100">
                    <p className="text-gray-300 text-sm leading-relaxed mt-1 hidden md:block">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
