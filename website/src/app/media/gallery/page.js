import mediaData from '@/data/media.json';

export const metadata = {
  title: 'Media Gallery | Investor\'s World Realty',
  description: 'Browse our extensive gallery of premium properties.',
};

export default function MediaGalleryPage() {
  const { gallery } = mediaData;

  return (
    <div className="bg-[#fafafa] min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-[#0a0f1a] text-white pt-32 pb-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-gold-500">{gallery.title}</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Explore high-quality images and videos of our featured real estate projects.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.items.map((item, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 aspect-video cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-500 bg-[#0a0f1a] px-3 py-1 rounded-full mb-2 inline-block">
                  {item.category}
                </span>
                <h3 className="text-xl font-serif text-white">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
