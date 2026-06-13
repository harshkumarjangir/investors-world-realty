import mediaData from '@/data/media.json';

export const metadata = {
  title: 'Client Testimonials | Investor\'s World Realty',
  description: 'Read what our clients have to say about their experience with us.',
};

export default function MediaTestimonialsPage() {
  const { testimonials } = mediaData;

  return (
    <div className="bg-[#fafafa] min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-[#0a0f1a] text-white pt-32 pb-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-gold-500">{testimonials.title}</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Hear directly from our satisfied customers and partners.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.items.map((testimonial, idx) => (
            <div key={idx} className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col relative">
              <svg className="w-12 h-12 text-gold-200 absolute top-6 right-6 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              <div className="flex-grow">
                <p className="text-gray-600 text-lg leading-relaxed italic relative z-10 mb-8 mt-4">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-[#0a0f1a] rounded-full flex items-center justify-center text-gold-500 font-bold text-xl">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-[#0a0f1a]">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
