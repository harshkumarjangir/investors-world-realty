import mediaData from '@/data/media.json';

export const metadata = {
  title: 'Media Events | Investor\'s World Realty',
  description: 'Stay updated with our latest events and property showcases.',
};

export default function MediaEventsPage() {
  const { events } = mediaData;

  return (
    <div className="bg-[#fafafa] min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-[#0a0f1a] text-white pt-32 pb-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-gold-500">{events.title}</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Join us at our upcoming property showcases, webinars, and open house events.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.items.map((event, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="h-64 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif text-[#0a0f1a] mb-4">{event.title}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
