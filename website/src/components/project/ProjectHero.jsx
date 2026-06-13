export default function ProjectHero({ data }) {
  return (
    <section className="relative flex flex-col">
      {/* Hero Image */}
      <div className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-dark-bg/20 to-transparent z-10" />
          <img 
            src={data.image} 
            alt={data.title} 
            className="w-full h-full object-cover object-bottom"
          />
        </div>
        <div className="relative z-20 text-center px-4 w-full">
          <h1 className="text-5xl md:text-7xl font-serif text-white tracking-wide drop-shadow-lg">
            {data.title}
          </h1>
        </div>
      </div>

      {/* Book A Site Visit Inline Form */}
      <div className="bg-white border-b border-gray-200 shadow-sm relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-lg font-serif text-dark-bg whitespace-nowrap">
              Book A Site Visit
            </div>
            <form className="flex-grow flex flex-col md:flex-row gap-4 w-full">
              <input 
                type="text" 
                placeholder="Name*" 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                required 
              />
              <input 
                type="email" 
                placeholder="Email*" 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                required 
              />
              <input 
                type="tel" 
                placeholder="Mobile Number*" 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                required 
              />
              <button 
                type="submit" 
                className="bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-8 rounded-md transition-colors whitespace-nowrap"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
