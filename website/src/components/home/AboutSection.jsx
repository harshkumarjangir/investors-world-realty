import React from 'react';

export default function AboutSection({ data }) {
  // Extract first word for the golden block styling
  const titleWords = data.title.split(' ');
  const firstWord = titleWords[0];
  const restOfTitle = titleWords.slice(1).join(' ');

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#fafafa]">
      {/* Subtle Background Architectural Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Column: Text Content */}
          <div className="w-full lg:w-[55%]">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-gold-500 text-white font-bold text-2xl px-3 py-2 flex items-center justify-center shrink-0">
                {firstWord}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-dark-bg font-serif tracking-tight leading-tight mt-1">
                {restOfTitle}
              </h2>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-normal text-gold-600 italic mb-8">
              {data.subtitle}
            </h3>
            
            <div className="space-y-5 text-base md:text-lg text-gray-700 leading-relaxed font-light">
              {data.content.map((paragraph, index) => (
                <p key={index} className={index === 0 ? "text-xl font-medium text-dark-bg mb-6 border-l-4 border-gold-500 pl-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right Column: Image with Frame */}
          <div className="w-full lg:w-[45%] relative">
            {/* Decorative offset background */}
            <div className="absolute -inset-4 bg-gold-500/10 transform translate-x-4 translate-y-4 z-0"></div>
            
            <div className="relative z-10 bg-white p-2 shadow-2xl">
              <img 
                src={data.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"} 
                alt="Modern Luxury Property" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
