import { Image as ImageIcon } from 'lucide-react';

export default function GallerySection({ data }) {
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-serif text-dark-bg tracking-tight mb-6">{data.title}</h2>
        <p className="text-xl text-gray-500 font-light mb-16">{data.subtitle}</p>
        
        {/* Placeholder Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="aspect-square bg-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
