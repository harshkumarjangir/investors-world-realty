export default function ProjectNav({ items }) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 sticky top-16 z-40 shadow-sm hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex justify-center space-x-12 py-4">
          {items.map((item, index) => (
            <li key={index}>
              <a 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-gray-600 hover:text-gold-600 transition-colors text-sm font-medium tracking-wide"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
