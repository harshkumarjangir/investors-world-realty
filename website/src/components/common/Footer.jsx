import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-bg text-gray-400 py-12 border-t border-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <img src="/logo.png" alt="Investor's World Realty Logo" className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
              <span className="text-2xl font-bold text-white tracking-tight">Investor's <span className="text-gold-400">World</span></span>
            </Link>
            <p className="text-sm max-w-sm mb-6">
              Invest, Grow, and Rise with Realty. We guide you every step of the way with expert knowledge and transparent advice.
            </p>
            <p className="text-sm">© {new Date().getFullYear()} Investor's World Realty. All rights reserved.</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 border-b border-gray-800 pb-2">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-gold-400 transition-colors">About Us</Link></li>
              <li><Link href="/media" className="hover:text-gold-400 transition-colors">Media Presence</Link></li>
              <li><Link href="/#services" className="hover:text-gold-400 transition-colors">What We Do</Link></li>
              <li><Link href="/#projects" className="hover:text-gold-400 transition-colors">Featured Projects</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 border-b border-gray-800 pb-2">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Jaipur, Rajasthan</li>
              <li>info@investorsworld.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
