export default function ProjectLocation({ data }) {
  return (
    <section id="location" className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          {/* Map Side */}
          <div className="w-full md:w-2/3 h-[500px] bg-gray-200 rounded-lg overflow-hidden shadow-md">
            <iframe 
              src={data.mapUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
            ></iframe>
          </div>
          
          {/* Text Side */}
          <div className="w-full md:w-1/3">
            <h2 className="text-3xl md:text-4xl font-serif text-dark-bg">{data.title}</h2>
          </div>

        </div>
      </div>
    </section>
  );
}
