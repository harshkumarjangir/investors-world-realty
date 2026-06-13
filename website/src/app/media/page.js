export const metadata = {
  title: 'Media Center | Investor\'s World Realty',
  description: 'Explore our latest news, events, gallery, and client testimonials.',
};

export default function MediaPage() {
  return (
    <div className="bg-[#fafafa] min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-[#0a0f1a] text-white pt-32 pb-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-gold-500">Media Center</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Your hub for all Investor's World Realty news, events, and visual showcases.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <a href="/media/events" className="group block bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-serif text-[#0a0f1a] group-hover:text-gold-600 transition-colors mb-2">Events</h3>
            <p className="text-gray-500">Join us at our upcoming property showcases and open houses.</p>
          </a>

          <a href="/media/gallery" className="group block bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-serif text-[#0a0f1a] group-hover:text-gold-600 transition-colors mb-2">Gallery</h3>
            <p className="text-gray-500">Explore high-quality visuals of our premium properties.</p>
          </a>

          <a href="/media/news" className="group block bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-serif text-[#0a0f1a] group-hover:text-gold-600 transition-colors mb-2">News & Insights</h3>
            <p className="text-gray-500">Read the latest market trends and company announcements.</p>
          </a>

          <a href="/media/testimonials" className="group block bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-serif text-[#0a0f1a] group-hover:text-gold-600 transition-colors mb-2">Testimonials</h3>
            <p className="text-gray-500">Hear stories and feedback directly from our satisfied clients.</p>
          </a>

        </div>
      </div>
    </div>
  );
}
