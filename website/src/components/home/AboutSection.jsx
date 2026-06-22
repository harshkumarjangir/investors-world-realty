export default function AboutSection({ data }) {
  return (
    <section id="about" className="section-padding bg-dark-bg relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Image */}
          <div className="relative order-2 lg:order-1">
            {/* Background accent */}
            <div className="absolute -top-6 -left-6 w-full h-full border border-gold-500/20 rounded-3xl" />
            <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-gold-500/5 rounded-3xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              <img
                src={data?.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'}
                alt="Investor's World Realty"
                className="w-full h-[500px] object-cover"
              />
              {/* Image overlay label */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gold-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Since 2011</div>
                    <div className="text-gold-400 text-xs">Trusted by 1100+ investors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold-500" />
              <span className="text-gold-400 text-xs font-bold tracking-[0.25em] uppercase">About Us</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              {data?.title || "We're Not Just a Real Estate Company."}
            </h2>

            <p className="text-2xl md:text-3xl text-gradient-gold font-medium italic mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              {data?.subtitle || "We're Your Investment Partner."}
            </p>

            <div className="space-y-5">
              {(data?.content || []).map((para, i) => (
                <p
                  key={i}
                  className={`leading-relaxed ${
                    i === 0
                      ? 'text-lg text-white font-medium border-l-2 border-gold-500 pl-5'
                      : 'text-gray-400 text-base font-light'
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Key points */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { n: '13+', l: 'Years in Business' },
                { n: '4', l: 'City Offices' },
                { n: '100+', l: 'Expert Team' },
                { n: '1100+', l: 'Happy Investors' },
              ].map(({ n, l }) => (
                <div key={l} className="glass rounded-2xl p-4">
                  <div className="text-2xl font-bold text-gradient-gold mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>{n}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{l}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
