'use client';
import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function ProjectFaqs({ data }) {
  const [openIndex, setOpenIndex] = useState(0); // First one open by default

  const toggleFaq = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1); // Close if clicking the currently open one
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faqs" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-dark-bg">{data.title}</h2>
        </div>

        <div className="space-y-4">
          {data.items.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index} 
                className="border-b border-gray-200 pb-4"
              >
                <button
                  className="w-full flex items-center justify-between py-4 text-left focus:outline-none group"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-sm font-bold text-gray-800 group-hover:text-gold-600 transition-colors">
                    {faq.question}
                  </span>
                  <div className={`ml-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    isOpen ? 'bg-gold-600 text-white' : 'bg-gold-50 text-dark-bg group-hover:bg-gold-100'
                  }`}>
                    {isOpen ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-500 text-sm leading-relaxed pr-12 pb-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
