'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Footer() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_WEBSITE_API_URL || "http://localhost:5001/api") + "/projects")
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, []);
  return (
    <footer className="bg-dark-bg border-t border-white/5">

      {/* Contact bar */}
      <div id="contact" className="bg-dark-surface border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Phone,
                label: 'Call Us',
                value: '+91 98765 43210',
                href: 'tel:+919876543210',
              },
              {
                icon: Mail,
                label: 'Email Us',
                value: 'supportiwr@gmail.com',
                href: 'mailto:supportiwr@gmail.com',
              },
              {
                icon: MapPin,
                label: 'Our Offices',
                value: 'Jaipur, Rajasthan',
                href: '#',
              },
            ].map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="group flex items-center gap-4 p-4 glass rounded-2xl hover:border-gold-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 flex items-center justify-center transition-all duration-300">
                  <Icon size={20} className="text-gold-400" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest mb-0.5">{label}</div>
                  <div className="text-white font-medium text-sm">{value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <img src="/logo.png" alt="Investor's World Realty" className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
              <div>
                <span className="text-white font-bold text-xl tracking-tight">Investor's </span>
                <span className="text-gradient-gold font-bold text-xl">World </span>
                <span className="text-white font-bold text-xl tracking-tight">Realty</span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
              At Investor's World Realty, we don't just sell properties — we build investors. Expert guidance, transparent advice, and a commitment to your financial growth.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: InstagramIcon, href: '#', label: 'Instagram' },
                { icon: FacebookIcon, href: '#', label: 'Facebook' },
                { icon: XIcon, href: '#', label: 'X / Twitter' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-500/30 transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 pb-3 border-b border-white/5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Our Services', href: '/#services' },
                { label: 'Projects', href: '/project' },
                { label: 'Properties', href: '/properties' },
                { label: 'Media', href: '/media' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-gray-500 hover:text-gold-400 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-4 h-px bg-gray-700 group-hover:bg-gold-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 pb-3 border-b border-white/5">Projects</h4>
            <ul className="space-y-3">
              {projects.length > 0 ? (
                projects.map(p => {
                  const name = p.hero?.title || p.slug;
                  return (
                    <li key={p.slug}>
                      <Link href={`/project/${p.slug}`} className="text-gray-500 hover:text-gold-400 transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-4 h-px bg-gray-700 group-hover:bg-gold-500 transition-colors" />
                        {name}
                      </Link>
                    </li>
                  );
                })
              ) : (
                [
                  'Daksh Green',
                  'Dam View Farms',
                  'Motisons Township',
                  'Tirupati Farm House',
                  'Vrindavan Vihar',
                  'Swarn Nagri',
                ].map(name => (
                  <li key={name}>
                    <Link href="/project" className="text-gray-500 hover:text-gold-400 transition-colors text-sm flex items-center gap-2 group">
                      <span className="w-4 h-px bg-gray-700 group-hover:bg-gold-500 transition-colors" />
                      {name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Investor's World Realty Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-600">
            <Link href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gold-400 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
