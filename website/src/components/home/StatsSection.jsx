export default function StatsSection({ data }) {
  return (
    <section className="relative bg-[#0a0f1a] overflow-hidden py-16 lg:py-20 shadow-2xl">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a]/95 via-[#0a0f1a]/80 to-[#0a0f1a]/60 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80" 
          alt="Cityscape Dusk" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="relative z-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-8">
          
          {/* Title Area */}
          <div className="lg:w-[35%] flex flex-col items-start relative shrink-0">
            <div className="relative inline-block mt-3 ml-3 mb-2">
              {/* Yellow Box Accent */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gold-500 rounded backdrop-blur-md border border-gold-400 z-0 shadow-[0_0_15px_rgba(234,179,8,0.4)] mix-blend-screen"></div>
              
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-white leading-[1.15] relative z-10 tracking-tight">
                Our Journey <br /> In Numbers
              </h2>
            </div>
            <p className="text-gray-300 mt-4 text-sm font-medium tracking-wide">
              Trusted Real Estate Agents at Your Service!
            </p>
          </div>
          
          {/* Stats Area */}
          <div className="lg:w-[65%] w-full flex flex-wrap sm:flex-nowrap justify-between gap-y-10 gap-x-4 lg:pl-10">
            {data.items.map((stat, index) => (
              <div key={index} className="flex flex-col w-[45%] sm:w-auto text-left">
                <div className="text-4xl md:text-5xl lg:text-[56px] font-light text-white mb-2 md:mb-3 tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-medium text-gray-300 leading-snug">
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
