'use client';
import { createContext, useContext, useState } from 'react';
import { X, ArrowRight, Loader2 } from 'lucide-react';

const ContactModalContext = createContext();

export const useContactModal = () => useContext(ContactModalContext);

export const ContactModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

  const openModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setStatus(null);
    setErrorMessage('');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    setErrorMessage('');

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_WEBSITE_API_URL || 'http://localhost:5001/api') + '/inquiries';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        // Close after a brief delay so they see the success message
        setTimeout(() => closeModal(), 2500);
      } else {
        throw new Error(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Unable to submit your inquiry. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContactModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-250 relative text-white">
            
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-white/5">
              <div>
                <h3 className="text-xl font-bold font-serif text-gradient-gold">Talk to an Expert</h3>
                <p className="text-xs text-gray-400 mt-1">Get custom advisory and premium real estate solutions</p>
              </div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Input */}
                <div>
                  <label htmlFor="modal-name" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="modal-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full bg-[#070b12] border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm"
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label htmlFor="modal-phone" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="modal-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#070b12] border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="modal-email" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-gold-400">*</span>
                </label>
                <input
                  type="email"
                  id="modal-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full bg-[#070b12] border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm"
                />
              </div>

              {/* Message Input */}
              <div>
                <label htmlFor="modal-message" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Your Message <span className="text-gold-400">*</span>
                </label>
                <textarea
                  id="modal-message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your property interests or questions..."
                  required
                  className="w-full bg-[#070b12] border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm resize-none"
                />
              </div>

              {/* Status Alerts */}
              {status === 'success' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs">
                  Thank you! Your message has been sent successfully. An expert will reach out to you shortly.
                </div>
              )}
              {status === 'error' && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-[#0a0e1a] font-bold py-3.5 rounded-xl transition-all duration-300 glow-gold hover:glow-gold transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:pointer-events-none text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </ContactModalContext.Provider>
  );
};
