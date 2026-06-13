export default function AboutHero({ data }) {
  // Extract "About" and the rest of the title
  const titleParts = data.title.split(' ');
  const firstWord = titleParts[0]; // "About"
  const restOfTitle = titleParts.slice(1).join(' '); // "Investor's World Realty Pvt. Ltd."

  return (
    <section className="py-20 lg:py-28 bg-[#fdfdfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bordered Container matching reference */}
        <div className="relative border border-gold-200/60 bg-white p-8 md:p-12 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {/* <div className="relative border border-gold-200/60 bg-white p-8 md:p-12 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"> */}

          {/* Subtle background decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Left Content */}
            <div className="lg:w-[55%]">
              <div className="mb-8">
                <span className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase block mb-2">
                  {firstWord}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-[52px] font-serif text-[#0a0f1a] leading-[1.15]">
                  <span className="text-gold-600 block mb-1">Investor's World</span>
                  Realty Pvt. Ltd.
                </h1>
              </div>

              <div className="space-y-6 text-[15px] lg:text-base text-gray-600 leading-relaxed font-light">
                {data.content.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "text-lg text-gray-800 font-medium mb-8" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Right Content: Floating Logo instead of Person */}
            <div className="lg:w-[45%] w-full flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center p-8">
                {/* Decorative circle behind logo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#f8f9fa] to-white rounded-full shadow-[inset_0_0_50px_rgba(0,0,0,0.02)] border border-gray-100"></div>

                <img
                  src="/logo.png"
                  alt="Investor's World Realty"
                  className="relative z-10 w-full max-w-[320px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
