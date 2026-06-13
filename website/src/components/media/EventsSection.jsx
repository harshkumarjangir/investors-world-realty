export default function EventsSection({ data }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif text-dark-bg tracking-tight">{data.title}</h2>
          <div className="mt-6 h-px w-24 bg-gold-500 mx-auto"></div>
        </div>

        <div className="space-y-24">
          {data.items.map((event, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
                
                {/* Event Image */}
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group border border-gray-100">
                    <div className="absolute inset-0 bg-dark-bg/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  </div>
                </div>
                
                {/* Event Content */}
                <div className="w-full lg:w-1/2">
                  <span className="text-gold-600 font-bold tracking-widest uppercase text-xs mb-4 block">Event</span>
                  <h3 className="text-3xl font-serif text-dark-bg mb-6 leading-snug">{event.title}</h3>
                  <div className="text-gray-600 text-lg leading-relaxed font-light whitespace-pre-line space-y-4">
                    {event.description}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
