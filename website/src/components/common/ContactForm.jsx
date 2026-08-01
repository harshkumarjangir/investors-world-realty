"use client";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setStatus('error');
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    setErrorMessage('');

    // If message is empty, supply a default
    const submissionData = {
      ...formData,
      message: formData.message.trim() || 'Requested callback from Speak with an Expert section.'
    };

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_WEBSITE_API_URL || 'http://localhost:5001/api') + '/inquiries';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setStatus('success');
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        throw new Error(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Unable to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
      <div>
        <input 
          type="text" 
          placeholder="Your Name" 
          required
          disabled={isSubmitting}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm disabled:opacity-50"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div>
        <input 
          type="tel" 
          placeholder="Phone Number" 
          required
          disabled={isSubmitting}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm disabled:opacity-50"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      <div>
        <input 
          type="email" 
          placeholder="Email Address" 
          required
          disabled={isSubmitting}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm disabled:opacity-50"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>
      <div>
        <textarea 
          placeholder="Your Message (Optional)" 
          rows={2}
          disabled={isSubmitting}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm resize-none disabled:opacity-50"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
      </div>

      {status === 'success' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs">
          Request sent successfully! Our team will contact you shortly.
        </div>
      )}
      {status === 'error' && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs">
          {errorMessage}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full inline-flex justify-center items-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-[#0a0e1a] text-sm font-bold px-8 py-3.5 rounded-lg transition-all duration-300 shadow-[0_10px_30px_rgba(234,179,8,0.2)] hover:shadow-[0_15px_40px_rgba(234,179,8,0.4)] uppercase tracking-wider hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:transform-none"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Talk to an Expert
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </>
        )}
      </button>
    </form>
  );
}
