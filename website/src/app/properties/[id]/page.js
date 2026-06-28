import { getPropertyById } from '@/lib/api';
import Link from 'next/link';
import ContactForm from '@/components/common/ContactForm';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: property } = await getPropertyById(id);
  
  if (!property) {
    return { title: 'Property Not Found | Investor\'s World Realty' };
  }
  
  return {
    title: `${property.name} | Investor's World Realty`,
    description: property.description?.substring(0, 160) || 'Premium property listed by Investor\'s World Realty.',
  };
}

export default async function PropertyDetailsPage({ params }) {
  const { id } = await params;
  const { data: property } = await getPropertyById(id);

  if (!property) {
    return (
      <div className="bg-[#fafafa] min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl md:text-5xl font-serif text-[#0a0f1a] mb-6">Property Not Found</h1>
        <p className="text-gray-500 mb-8">The property you are looking for does not exist or has been removed.</p>
        <Link href="/properties" className="bg-gold-500 text-[#0a0f1a] px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-gold-400 transition-colors">
          Browse All Properties
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const images = property.images && property.images.length > 0 
    ? property.images.map(img => `${process.env.NEXT_PUBLIC_IMAGE_SERVER || "http://localhost:5000"}/${img.url}`) 
    : ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80'];

  return (
    <div className="bg-[#fafafa] min-h-screen pb-16">
      {/* Padding block for fixed navbar */}
      <div className="pt-32"></div>
      
      {/* Property Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link href="/properties" className="inline-flex items-center gap-2 text-gray-500 hover:text-gold-600 transition-colors mb-6 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Properties
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="flex gap-2 mb-4">
              <span className="bg-gold-500 text-[#0a0f1a] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {property.status}
              </span>
              <span className="bg-[#0a0f1a] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {property.type}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#0a0f1a] mb-2">{property.name}</h1>
            <p className="text-gray-500 text-lg flex items-center gap-1.5">
              <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {property.location}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-gray-500 mb-1">Asking Price</p>
            <h2 className="text-4xl font-bold text-[#0a0f1a]">{formatPrice(property.price)}</h2>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg">
          <div className="md:col-span-3 bg-gray-200 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[0]} alt={property.name} className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:flex flex-col gap-4">
            {images.slice(1, 3).map((img, idx) => (
              <div key={idx} className="bg-gray-200 relative h-1/2 rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="Gallery" className="w-full h-full object-cover" />
              </div>
            ))}
            {images.length <= 1 && (
               <div className="bg-gray-100 relative h-full rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                 <span className="text-gray-400 font-medium">More images coming soon</span>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Details */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <h3 className="text-2xl font-serif text-[#0a0f1a] mb-6">Property Overview</h3>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                {property.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Property ID</p>
                  <p className="font-semibold text-[#0a0f1a]">#{property.id.substring(0,6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Property Type</p>
                  <p className="font-semibold text-[#0a0f1a] capitalize">{property.type.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Property Status</p>
                  <p className="font-semibold text-[#0a0f1a] capitalize">{property.status.toLowerCase()}</p>
                </div>
                {property.size && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Property Size</p>
                    <p className="font-semibold text-[#0a0f1a]">{property.size}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-serif text-[#0a0f1a] mb-6">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact/Booking Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="bg-[#0a0f1a] p-8 rounded-3xl shadow-xl sticky top-28">
              <h3 className="text-2xl font-serif text-white mb-2">Interested in this property?</h3>
              <p className="text-gray-400 text-sm mb-8">Contact our real estate experts today for a showing.</p>
              <ContactForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
