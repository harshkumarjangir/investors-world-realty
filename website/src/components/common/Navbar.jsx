'use client';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
            <Link href="/media" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10">
              Media
            </Link>
            <Link href="/#services" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10">
              Services
            </Link>
            <Link href="/project" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10">
              Projects
            </Link>
          </div>

          <div className="hidden md:flex items-center pr-1">
            <Link href="#contact" className="bg-gold-500 hover:bg-gold-400 text-dark-bg px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transform hover:-translate-y-0.5">
              Talk to an Expert
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center pr-2">
            <button className="text-gray-300 hover:text-white p-2 transition-colors rounded-full hover:bg-white/10">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
