import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

export default function FeaturesSection({ data }) {
  if (!data) return null;

  return (
    <section className="section-padding bg-dark-surface relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-gold-500" />
              <span className="text-gold-400 text-xs font-bold tracking-[0.25em] uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              {data.title}
            </h2>
          </div>
          <div className="lg:max-w-sm">
            <p className="text-gray-400 text-lg mb-6">{data.subtitle}</p>
            <a
              href={data.cta?.link || '#contact'}
              className="inline-flex items-center gap-2 border border-gold-500/50 hover:border-gold-500 text-gold-400 hover:text-white hover:bg-gold-500 font-bold px-6 py-3 rounded-xl transition-all duration-300"
            >
              {data.cta?.text || 'Apply Now'}
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(data.items || []).map((feature, i) => {
            const Icon = LucideIcons[feature.icon] || HelpCircle;
            return (
              <div
                key={i}
                className="group relative glass rounded-3xl p-8 hover:border-gold-500/30 transition-all duration-500 overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 to-gold-500/0 group-hover:from-gold-500/5 group-hover:to-transparent transition-all duration-500 rounded-3xl" />

                {/* Number */}
                <div className="text-8xl font-black text-white/[0.03] absolute top-4 right-6 select-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 group-hover:border-gold-500/40 flex items-center justify-center mb-6 transition-all duration-500">
                    <Icon size={26} className="text-gold-400" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient-gold transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300 transition-colors">
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
