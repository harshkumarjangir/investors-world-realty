export default function ProjectHighlights({ data }) {
  return (
    <section id="project-highlights" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-dark-bg">{data.title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {data.items.map((item, index) => (
            <div key={index} className="flex flex-col group">
              <div className="overflow-hidden mb-6 h-[400px]">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </div>
              <h3 className="text-2xl font-serif text-dark-bg mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed font-light mb-6 flex-grow">
                {item.description}
              </p>
              {(item.linkText || item.linkUrl) && (
                <a 
                  href={item.linkUrl || "#"} 
                  className="inline-flex items-center font-bold text-gold-600 hover:text-gold-700 transition-colors uppercase tracking-wider text-xs"
                >
                  {item.linkText || "Explore"}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
