'use client';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'About', href: '/about' },
  {
    label: 'Media', href: '/media',
    children: [
      { label: 'Events', href: '/media/events' },
      { label: 'Gallery', href: '/media/gallery' },
      { label: 'News & Press', href: '/media/news' },
      { label: 'Testimonials', href: '/media/testimonials' },
    ],
  },
  { label: 'Services', href: '/#services' },
  { label: 'Projects', href: '/project', children: [] }, // populated dynamically
  { label: 'Properties', href: '/properties' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    fetch('/api/projects-proxy').catch(() => { });
    // Fetch projects for dropdown
    fetch((process.env.NEXT_PUBLIC_WEBSITE_API_URL || "http://localhost:5001/api") + "/projects")
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => { });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const allLinks = navLinks.map(link =>
    link.label === 'Projects'
      ? {
        ...link,
        children: [
          { label: 'All Projects', href: '/project' },
          ...projects.map(p => ({ label: p.hero?.title || p.slug, href: `/project/${p.slug}` })),
        ],
      }
      : link
  );

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-500`}>
          <div className={`flex items-center justify-between rounded-2xl transition-all duration-500 px-5 py-3 ${scrolled
              ? 'bg-[#0a0e1a]/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50'
              : 'bg-[#0a0e1a]/60 backdrop-blur-xl border border-white/5'
            }`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <img
                src="/logo.png"
                alt="Investor's World Realty"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="hidden sm:block">
                <span className="text-white font-bold text-lg tracking-tight">Investor's </span>
                <span className="text-gradient-gold font-bold text-lg">World</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {allLinks.map((link) =>
                link.children && link.children.length > 0 ? (
                  <div key={link.label} className="relative group">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/5">
                      {link.label}
                      <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                      <div className="bg-[#0d1220]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 py-2 min-w-[180px]">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <Link
                href="/#contact"
                className="hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-[#0a0e1a] text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 glow-gold-sm hover:glow-gold transform hover:-translate-y-0.5"
              >
                Talk to an Expert
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-24 md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <div className="relative mx-4 bg-[#0d1220]/98 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
            {allLinks.map((link) =>
              link.children && link.children.length > 0 ? (
                <div key={link.label}>
                  <button
                    onClick={() => setOpenMobileSection(openMobileSection === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between py-3 px-4 text-white font-medium text-base rounded-xl hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                    <ChevronDown size={16} className={`transition-transform ${openMobileSection === link.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openMobileSection === link.label && (
                    <div className="pl-4 flex flex-col gap-1 pb-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 px-4 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 text-white font-medium text-base rounded-xl hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link
                href="/#contact"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-gold-500 to-gold-400 text-[#0a0e1a] font-bold py-4 rounded-2xl transition-all glow-gold"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
