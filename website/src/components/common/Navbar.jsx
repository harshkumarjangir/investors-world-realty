'use client';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    fetch('http://localhost:5001/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Failed to fetch projects for navbar:', err));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 lg:px-8 pt-4 pb-2 pointer-events-none">
      <nav className={`mx-auto max-w-6xl transition-all duration-500 pointer-events-auto rounded-full bg-[#0a0f1a]/95 backdrop-blur-xl border border-white/10 ${
        scrolled 
          ? 'shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-2 px-4' 
          : 'shadow-lg py-3 px-3'
      }`}>
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center pl-2">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Investor's World Realty" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-500" />
              <span className="text-xl font-bold text-white tracking-tight hidden sm:block">Investor's <span className="text-gold-400">World</span></span>
            </Link>
          </div>
          
          {/* Desktop Links - Pill style hover */}
          <div className="hidden md:flex items-center bg-white/5 rounded-full p-1 border border-white/5">
            <Link href="/about" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10">
              About Us
            </Link>
            <div className="relative group">
              <Link href="/media" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10 flex items-center gap-1">
                Media
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              
              <div className="absolute left-0 mt-2 w-48 bg-[#0a0f1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 py-2">
                <Link href="/media/events" className="block px-5 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Events</Link>
                <Link href="/media/gallery" className="block px-5 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Gallery</Link>
                <Link href="/media/news" className="block px-5 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">News</Link>
                <Link href="/media/testimonials" className="block px-5 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Testimonials</Link>
              </div>
            </div>

            <Link href="/#services" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10">
              Services
            </Link>

            <div className="relative group">
              <Link href="/project" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10 flex items-center gap-1">
                Projects
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              
              <div className="absolute left-0 mt-2 w-48 bg-[#0a0f1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 py-2">
                <Link href="/project" className="block px-5 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10 mb-1 font-medium">All Projects</Link>
                {projects.map((proj) => (
                  <Link key={proj.slug} href={`/project/${proj.slug}`} className="block px-5 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                    {proj.hero?.title || proj.slug}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/properties" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10">
              Properties
            </Link>
          </div>

          <div className="hidden md:flex items-center pr-1">
            <Link href="#contact" className="bg-gold-500 hover:bg-gold-400 text-dark-bg px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transform hover:-translate-y-0.5">
              Talk to an Expert
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center pr-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 transition-colors rounded-full hover:bg-white/10"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full px-4 mt-2 pointer-events-auto">
          <div className="bg-[#0a0f1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 flex flex-col gap-6">
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-gray-200 hover:text-white font-medium text-lg">About Us</Link>
            
            <div className="flex flex-col gap-3">
              <span className="text-gold-500 font-bold text-xs uppercase tracking-widest">Media</span>
              <div className="pl-4 flex flex-col gap-3 border-l border-white/10">
                <Link href="/media/events" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">Events</Link>
                <Link href="/media/gallery" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">Gallery</Link>
                <Link href="/media/news" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">News</Link>
                <Link href="/media/testimonials" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">Testimonials</Link>
              </div>
            </div>

            <Link href="/#services" onClick={() => setMobileMenuOpen(false)} className="text-gray-200 hover:text-white font-medium text-lg">Services</Link>
            
            <div className="flex flex-col gap-3">
              <span className="text-gold-500 font-bold text-xs uppercase tracking-widest">Projects</span>
              <div className="pl-4 flex flex-col gap-3 border-l border-white/10">
                <Link href="/project" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white font-medium border-b border-white/10 pb-2">All Projects</Link>
                {projects.map((proj) => (
                  <Link key={proj.slug} href={`/project/${proj.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">
                    {proj.hero?.title || proj.slug}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/properties" onClick={() => setMobileMenuOpen(false)} className="text-gray-200 hover:text-white font-medium text-lg">Properties</Link>
            
            <div className="pt-6 mt-2 border-t border-white/10">
              <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-gold-500 hover:bg-gold-400 text-dark-bg px-6 py-4 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
