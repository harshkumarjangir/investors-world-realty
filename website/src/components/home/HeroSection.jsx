'use client';
import { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { useContactModal } from '@/context/ContactModalContext';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80',
];

export default function HeroSection({ data }) {
  const { openModal } = useContactModal();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BG_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-screen min-h-[650px] flex items-center overflow-hidden">
      {/* Sliding Background Images */}
      {BG_IMAGES.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1500 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={img} alt="" className="w-full h-full object-cover object-center" />
        </div>
      ))}

      {/* Multi-layer dark overlay for luxury depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/95 via-[#0a0e1a]/75 to-[#0a0e1a]/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/80 via-transparent to-[#0a0e1a]/40 z-10" />

      {/* Decorative gold line */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-gold-500/60 to-transparent z-20" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pt-20 pb-36 sm:pb-32">
        <div className="max-w-3xl">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="h-px w-8 bg-gold-500" />
            <span className="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">
              {data?.subtitle || 'Invest · Grow · Rise'}
            </span>
            <div className="h-px w-8 bg-gold-500" />
          </div>

          {/* Main heading */}
          <h1 className="font-bold text-white leading-[1.08] tracking-tight mb-2" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2.2rem, 6vw, 5rem)' }}>
            Investor's World
          </h1>
          <div className="flex items-center gap-4 mb-6">
            {/* <div className="h-1 w-12 bg-gradient-to-r from-gold-500 to-gold-300 rounded-full" /> */}
            <h2 className="text-gradient-gold font-bold italic pr-4 pb-2" style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.8rem, 4.5vw, 4rem)' }}>
              Realty
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-light">
            {data?.description || "We don't just sell properties — we build investors. Expert guidance, transparent advice, and a commitment to your financial growth."}
          </p>

          {/* CTAs */}
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-[#0a0e1a] font-bold text-sm sm:text-base px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 glow-gold hover:glow-gold transform hover:-translate-y-1 shadow-2xl shrink-0"
            >
              {data?.cta?.primary?.text || 'Talk to an Expert'}
            </button>
            <a
              href={data?.cta?.secondary?.link || '#projects'}
              className="inline-flex items-center gap-2 sm:gap-3 text-white text-sm sm:text-base font-medium group shrink-0"
            >
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 group-hover:border-gold-500 flex items-center justify-center transition-all duration-300 group-hover:bg-gold-500/10 shrink-0">
                <ArrowDown size={16} className="group-hover:text-gold-400 transition-colors sm:w-[18px] sm:h-[18px]" />
              </span>
              {data?.cta?.secondary?.text || 'Explore Projects'}
            </a>
          </div>
        </div>
      </div>

      {/* Stats ribbon at the bottom */}
      <div className="absolute bottom-6 left-0 right-0 z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="flex flex-wrap gap-x-8 gap-y-3 sm:gap-x-16">
          {[
            { val: '10L+ Sq.Ft', label: 'Area Sold' },
            { val: '1100+', label: 'Happy Clients' },
            { val: '13+', label: 'Years Experience' },
            { val: '4', label: 'Offices' },
          ].map((s) => (
            <div key={s.label} className="min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-gold" style={{ fontFamily: 'var(--font-playfair)' }}>{s.val}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 right-8 z-20 flex flex-col gap-2">
        {BG_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1 rounded-full transition-all duration-500 ${i === current ? 'h-8 bg-gold-500' : 'h-3 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}
