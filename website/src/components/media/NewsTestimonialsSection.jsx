import { Newspaper, MessageSquareQuote } from 'lucide-react';

export default function NewsTestimonialsSection({ data }) {
  return (
    <section className="py-24 bg-dark-bg text-white border-t-4 border-gold-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* News Block */}
          <div className="bg-dark-surface p-12 rounded-2xl border border-gray-800 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gold-600/20 text-gold-500 rounded-full flex items-center justify-center mb-6">
              <Newspaper size={32} />
            </div>
            <h2 className="text-3xl font-serif text-white mb-4">{data.news.title}</h2>
            <p className="text-gray-400 font-light text-lg mb-8">{data.news.subtitle}</p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          </div>

          {/* Testimonials Block */}
          <div className="bg-dark-surface p-12 rounded-2xl border border-gray-800 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gold-600/20 text-gold-500 rounded-full flex items-center justify-center mb-6">
              <MessageSquareQuote size={32} />
            </div>
            <h2 className="text-3xl font-serif text-white mb-4">{data.testimonials.title}</h2>
            <p className="text-gray-400 font-light text-lg mb-8">{data.testimonials.subtitle}</p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
