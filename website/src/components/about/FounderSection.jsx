export default function FounderSection({ data }) {
  return (
    <>
      {/* Founder Section */}
      <section className="py-24 lg:py-32 bg-[#fdfdfd] relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-[#fdfdfd] z-0"></div>
        
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Modern Premium Card */}
          <div className="flex flex-col md:flex-row bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100/50">
            
            {/* Left Content: Bio */}
            <div className="md:w-[55%] p-10 md:p-16 lg:p-20 flex flex-col justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1e293b] relative overflow-hidden group">
              {/* Subtle decorative glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 transition-all duration-700 group-hover:bg-gold-500/20"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl lg:text-[56px] font-serif text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600 font-bold mb-4 uppercase tracking-wide leading-tight">
                  {data.name}
                </h2>
                <h3 className="text-[17px] md:text-lg text-gray-300 font-serif mb-10 pb-6 border-b border-white/10 tracking-wide">
                  The FOUNDER of Investor's World Realty Pvt. Ltd.
                </h3>
                
                <div className="space-y-6 text-[14px] md:text-[15px] text-gray-400 leading-[1.9] font-light">
                  {data.bio.map((paragraph, index) => (
                    <p key={index} className="transition-colors duration-300 hover:text-gray-200">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Content: Founder Image */}
            <div className="md:w-[45%] relative min-h-[450px] md:min-h-full bg-gray-100 overflow-hidden">
              <img 
                src="/deepak.webp" 
                alt={data.name} 
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1.5s] ease-in-out hover:scale-105"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Press & Publications Section */}
      <section className="py-24 bg-[#081736] text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white text-sm font-bold tracking-[0.2em] uppercase mb-4">Featured In</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#d4af37] mb-16">
            PRESS & PUBLICATIONS
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-5xl mx-auto">
            
            {/* Mockup of Article Screenshot */}
            <a 
              href="https://m.dailyhunt.in/news/india/english/thebusinessstories-epaper-dh81e4e6e2104e4dbbb7f32ee26194cfb7/-newsid-dh81e4e6e2104e4dbbb7f32ee26194cfb7_44a0e76ea1a743589c023291140689b6?sm=Y" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block bg-white p-6 md:p-8 border-[8px] border-[#d4af37] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-transform duration-500 text-left w-full max-w-[700px] group"
            >
               <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4 flex items-center justify-between border-b pb-3">
                 <span>DailyHunt</span>
                 <span className="text-[10px] bg-gray-100 px-2 py-1 rounded">Business Stories</span>
               </div>
               
               <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#0a0f1a] leading-[1.3] mb-6 group-hover:text-blue-700 transition-colors">
                 Family's First Generational Businessman: How Deepak Yadav Built His Way Up
               </h3>
               
               <div className="flex flex-col sm:flex-row gap-6">
                 <img 
                    src="/deepak.webp" 
                    alt="Deepak Yadav" 
                    className="w-full sm:w-48 h-auto object-cover rounded shadow-sm" 
                 />
                 <div className="flex-1 space-y-4 pt-1">
                   <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed">
                     Today, Mr. Deepak Yadav is known as the founder of Investor's World Realty Pvt. Ltd, a well-established real estate company in Jaipur, Rajasthan. But his journey did not begin with business plans or big opportunities. It started with responsibility, resilience, and a series of small but defining decisions.
                   </p>
                   <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed">
                     As the eldest son in the family, Deepak stepped into the working world early. In 1999, just after his Class 10th result day, he made the decision to start earning and went out looking for a job.
                   </p>
                 </div>
               </div>
            </a>

          </div>
          
          <div className="mt-16">
            <a 
              href="https://m.dailyhunt.in/news/india/english/thebusinessstories-epaper-dh81e4e6e2104e4dbbb7f32ee26194cfb7/-newsid-dh81e4e6e2104e4dbbb7f32ee26194cfb7_44a0e76ea1a743589c023291140689b6?sm=Y" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-3 text-white hover:text-[#d4af37] text-sm md:text-base uppercase tracking-[0.15em] font-bold transition-all duration-300 hover:gap-5"
            >
              Read the DailyHunt Article <span className="text-xl">→</span>
            </a>
          </div>
          
        </div>
      </section>
    </>
  );
}
