export default function StatsSection({ data }) {
  if (!data) return null;

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Full-bleed image background */}
      <div className="absolute inset-0">
        <img
          src={data.image || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80'}
          alt="City skyline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/98 via-[#0a0e1a]/80 to-[#0a0e1a]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/50 via-transparent to-[#0a0e1a]/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Title column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold-500" />
              <span className="text-gold-400 text-xs font-bold tracking-[0.25em] uppercase">Our Numbers</span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: 'var(--font-playfair)' }}
              dangerouslySetInnerHTML={{ __html: data.title || 'Our Journey<br/>In Numbers' }}
            />
            <p className="text-gray-400 text-lg">{data.subtitle}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-px bg-white/10 rounded-3xl overflow-hidden">
            {(data.items || []).map((stat, i) => (
              <div key={i} className="bg-[#0a0e1a]/70 backdrop-blur-md p-8 hover:bg-[#0a0e1a]/50 transition-colors duration-300">
                <div
                  className="text-4xl md:text-5xl font-bold text-gradient-gold mb-2"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm leading-snug uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
