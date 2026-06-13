import ContactForm from './ContactForm';

export default function CtaBlock({ data }) {
  // Split title if it contains "future" to make "future?" italic gold
  const titleParts = data.title.split('future');
  const titleDisplay = titleParts.length > 1 
    ? <>{titleParts[0]} <span className="text-gold-500 italic">future{titleParts[1]}</span></>
    : data.title;

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#0a0f1a]">
      {/* Stunning Background Image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-fixed opacity-50"></div>
      
      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-[#0a0f1a]/80 to-transparent"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Content */}
        <div className="md:w-3/5 text-left">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            Take The Next Step
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-[1.15] drop-shadow-lg">
            {titleDisplay}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-xl leading-relaxed">
            {data.subtitle} Our experts are here to provide transparent, reliable, and value-driven guidance at every step.
          </p>
        </div>

        {/* Right Content - Modern Button Card */}
        <div className="md:w-2/5 flex justify-center md:justify-end w-full">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl flex flex-col items-center text-center w-full max-w-md relative overflow-hidden group hover:bg-white/10 transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>
            
            <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">Speak with an Expert</h3>
            <p className="text-gray-300 text-sm mb-6 font-light leading-relaxed">
              Drop your details below and our advisors will reach out.
            </p>
            
            <ContactForm />
          </div>
        </div>
        
      </div>
    </section>
  );
}
