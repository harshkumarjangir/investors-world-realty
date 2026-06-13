import mediaData from '@/data/media.json';

export const metadata = {
  title: 'Real Estate News | Investor\'s World Realty',
  description: 'Read the latest news and insights in the real estate market.',
};

export default function MediaNewsPage() {
  const { news } = mediaData;

  return (
    <div className="bg-[#fafafa] min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-[#0a0f1a] text-white pt-32 pb-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-gold-500">{news.title}</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Stay informed with the latest market trends, company news, and industry analysis.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12">
          {news.items.map((article, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row group">
              <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 md:p-12 md:w-2/3 flex flex-col justify-center">
                <span className="text-sm font-bold text-gold-500 uppercase tracking-wider mb-3 block">{article.date}</span>
                <h3 className="text-3xl font-serif text-[#0a0f1a] mb-4">{article.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">{article.excerpt}</p>
                <div>
                  <button className="text-[#0a0f1a] font-bold border-b-2 border-gold-500 pb-1 hover:text-gold-600 transition-colors">Read Full Article</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
