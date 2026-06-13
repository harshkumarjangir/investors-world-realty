import { Key, Star, FileText, Settings, ClipboardList, User } from 'lucide-react';

const iconMap = {
  'key': Key,
  'star': Star,
  'file': FileText,
  'settings': Settings,
  'clipboard': ClipboardList,
  'user': User,
};

export default function ProjectServices({ data }) {
  return (
    <section className="py-24 bg-gray-50 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-dark-bg mb-16">{data.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8">
          {data.items.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Settings; // fallback icon
            
            return (
              <div key={index} className="flex items-center space-x-4 justify-center md:justify-start pl-0 md:pl-12">
                <div className="text-gold-600 flex-shrink-0">
                  <IconComponent size={32} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-serif text-gray-700 text-left w-24">
                  {/* Split the title into two lines if it contains a space for better formatting matching the screenshot */}
                  {item.title.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
