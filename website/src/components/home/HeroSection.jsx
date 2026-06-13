import React from 'react';
import { Star } from 'lucide-react';

export default function HeroSection({ data }) {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-start overflow-hidden pt-10">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#111827]/95 via-[#111827]/70 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" 
          alt="Luxury Real Estate Complex" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col w-full">
        <div className="md:w-[65%] lg:w-[55%]">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 mb-6 shadow-sm">
            <Star size={12} className="text-gold-400 fill-gold-400" />
            <span className="text-white text-[11px] font-semibold tracking-wider uppercase">
              {data.subtitle}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-[64px] font-extrabold text-white leading-[1.1] tracking-tight mb-3">
            Investor's World <br/>
            <span className="text-gold-400 italic font-serif font-medium tracking-normal text-[56px] md:text-[72px] inline-block mt-1">Realty</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed font-light pr-10">
            {data.description}
          </p>
          
          <div className="flex flex-row gap-4 items-center">
            <a 
              href="#contact" 
              className="bg-gradient-to-r from-gold-500 to-yellow-600 hover:from-gold-600 hover:to-yellow-700 text-white text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transform hover:-translate-y-0.5"
            >
              Talk to an Expert
            </a>
            <a 
              href="#projects" 
              className="bg-transparent hover:bg-white/10 text-white border border-white/60 hover:border-white text-sm font-medium px-6 py-3 rounded-full transition-colors"
            >
              Explore Projects
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
