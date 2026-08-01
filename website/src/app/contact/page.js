'use client';
import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

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
    <div className="relative min-h-screen bg-[#0a0e1a] text-white pt-32 pb-24 overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="h-px w-8 bg-gold-500" />
            <span className="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">
              Get In Touch
            </span>
            <div className="h-px w-8 bg-gold-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            Let's Start a <span className="text-gradient-gold italic">Conversation</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            Have questions about a property, investment schemes, or want to consult with a realty expert? Reach out to us and let us guide you.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Contact Details (Left Column) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                Contact Information
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Connect with our team directly. We are committed to providing premium real estate guidance and transparent assistance.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              {/* Phone Card */}
              <a href="tel:+919876543210" className="group flex items-start gap-4 p-5 bg-[#0d1220]/40 backdrop-blur-xl border border-white/5 hover:border-gold-500/30 rounded-2xl transition-all duration-300 hover:transform hover:translate-x-1">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 flex items-center justify-center transition-all duration-300 shrink-0">
                  <Phone className="text-gold-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Call Us</h4>
                  <p className="text-white font-medium group-hover:text-gold-400 transition-colors text-base sm:text-lg">+91 98765 43210</p>
                  <p className="text-gray-500 text-xs mt-1">Available for calls and messaging support.</p>
                </div>
              </a>

              {/* Email Card */}
              <a href="mailto:supportiwr@gmail.com" className="group flex items-start gap-4 p-5 bg-[#0d1220]/40 backdrop-blur-xl border border-white/5 hover:border-gold-500/30 rounded-2xl transition-all duration-300 hover:transform hover:translate-x-1">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 flex items-center justify-center transition-all duration-300 shrink-0">
                  <Mail className="text-gold-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Email Us</h4>
                  <p className="text-white font-medium group-hover:text-gold-400 transition-colors text-base sm:text-lg">supportiwr@gmail.com</p>
                  <p className="text-gray-500 text-xs mt-1">Write to us for detailed inquiries or document shares.</p>
                </div>
              </a>

              {/* Address Card */}
              <div className="group flex items-start gap-4 p-5 bg-[#0d1220]/40 backdrop-blur-xl border border-white/5 hover:border-gold-500/30 rounded-2xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 flex items-center justify-center transition-all duration-300 shrink-0">
                  <MapPin className="text-gold-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Our Offices</h4>
                  <p className="text-white font-medium text-base sm:text-lg">Jaipur, Rajasthan</p>
                  <p className="text-gray-500 text-xs mt-1">Main Corporate Hub, India.</p>
                </div>
              </div>

              {/* Hours Card */}
              <div className="group flex items-start gap-4 p-5 bg-[#0d1220]/40 backdrop-blur-xl border border-white/5 hover:border-gold-500/30 rounded-2xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 flex items-center justify-center transition-all duration-300 shrink-0">
                  <Clock className="text-gold-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Working Hours</h4>
                  <p className="text-white font-medium text-base">Monday - Saturday</p>
                  <p className="text-gray-400 text-sm mt-0.5">10:00 AM - 06:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (Right Column) */}
          <div className="lg:col-span-7">
            <div className="bg-[#0d1220]/60 backdrop-blur-xl border border-white/5 p-6 sm:p-10 rounded-3xl shadow-2xl shadow-black/40">
              <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                Send a Message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Full Name <span className="text-gold-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full bg-[#0a0e1a]/60 border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm sm:text-base"
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label htmlFor="phone" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#0a0e1a]/60 border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Email Address <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full bg-[#0a0e1a]/60 border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm sm:text-base"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label htmlFor="message" className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Your Message <span className="text-gold-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your property interests or questions..."
                    required
                    className="w-full bg-[#0a0e1a]/60 border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm sm:text-base resize-none"
                  />
                </div>

                {/* Status Alerts */}
                {status === 'success' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
                    Thank you! Your message has been sent successfully. An expert will reach out to you shortly.
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-[#0a0e1a] font-bold py-4 rounded-xl sm:rounded-2xl transition-all duration-300 glow-gold hover:glow-gold transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
