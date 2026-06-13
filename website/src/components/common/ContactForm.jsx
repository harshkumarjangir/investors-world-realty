"use client";
import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', email: '' });
    }, 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
      <div>
        <input 
          type="text" 
          placeholder="Your Name" 
          required
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div>
        <input 
          type="tel" 
          placeholder="Phone Number" 
          required
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      <div>
        <input 
          type="email" 
          placeholder="Email Address (Optional)" 
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full inline-flex justify-center items-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-[#0a0f1a] text-sm md:text-base font-bold px-8 py-4 rounded-lg transition-all duration-300 shadow-[0_10px_30px_rgba(234,179,8,0.2)] hover:shadow-[0_15px_40px_rgba(234,179,8,0.4)] uppercase tracking-wider hover:-translate-y-1 mt-2"
      >
        {submitted ? 'Request Sent!' : 'Talk to an Expert'}
        {!submitted && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
      </button>
    </form>
  );
}
