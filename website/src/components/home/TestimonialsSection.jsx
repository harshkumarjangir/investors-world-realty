'use client';
import { useContactModal } from '@/context/ContactModalContext';

const StarIcon = () => (
  <svg className="w-4 h-4 fill-gold-400 text-gold-400" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const AVATAR_COLORS = ['bg-teal-500', 'bg-violet-500', 'bg-rose-500'];

export default function TestimonialsSection({ data }) {
  const { openModal } = useContactModal();
  if (!data?.items) return null;

  return (
    <section className="section-padding bg-dark-bg relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-10 bg-gold-500" />
            <span className="text-gold-400 text-xs font-bold tracking-[0.25em] uppercase">Testimonials</span>
            <div className="h-px w-10 bg-gold-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {data.title || 'What Our Customers Say'}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{data.subtitle}</p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.items.map((t, i) => (
            <div
              key={i}
              className="group glass rounded-3xl p-8 flex flex-col justify-between hover:border-gold-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-500/5"
            >
              {/* Quote mark */}
              <div className="text-gold-500/20 text-8xl font-serif leading-none mb-2 select-none" style={{ fontFamily: 'var(--font-playfair)' }}>"</div>

              <div className="flex-1">
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, si) => <StarIcon key={si} />)}
                </div>

                {/* Review */}
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5">
                <div className={`w-12 h-12 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {t.initial}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{t.name}</h4>
                  <p className="text-gold-500 text-xs mt-0.5">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA bar */}
        <div className="mt-16 glass rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Ready to Begin Your Investment Journey?
            </h3>
            <p className="text-gray-400">Join 1100+ satisfied investors who trust us with their real estate goals.</p>
          </div>
          <button
            onClick={openModal}
            className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-[#0a0e1a] font-bold px-8 py-4 rounded-2xl transition-all duration-300 glow-gold hover:glow-gold transform hover:-translate-y-0.5"
          >
            Talk to an Expert
          </button>
        </div>
      </div>
    </section>
  );
}
