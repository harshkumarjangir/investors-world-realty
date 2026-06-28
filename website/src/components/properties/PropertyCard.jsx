import Link from 'next/link';

export default function PropertyCard({ property }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Safe check for images, default if none
  const imageUrl = property.thumbnail 
    ? `${process.env.NEXT_PUBLIC_IMAGE_SERVER || "http://localhost:5000"}/${property.thumbnail}` 
    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

  return (
    <Link href={`/properties/${property.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="relative h-64 overflow-hidden">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="bg-gold-500 text-[#0a0f1a] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {property.status}
          </span>
          <span className="bg-[#0a0f1a]/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {property.type}
          </span>
        </div>
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={property.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif text-[#0a0f1a] group-hover:text-gold-600 transition-colors line-clamp-1">{property.name}</h3>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gold-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="truncate">{property.location}</span>
        </p>

        <div className="text-2xl font-bold text-[#0a0f1a] mb-4">
          {formatPrice(property.price)}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
          {property.size && (
            <div className="flex items-center gap-1">
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
               {property.size}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
