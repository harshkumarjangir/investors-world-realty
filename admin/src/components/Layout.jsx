import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Wallet,
  FileText,
  DollarSign,
  Building,
  Bell,
  Shield,
  Settings,
  ArrowLeftRight,
  LogOut,
  Menu,
  X,
  UserCircle,
  BookOpen,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../common/AuthContext.jsx';
import { useI18n } from '../common/i18n.jsx';

const navItems = [
  { key: 'nav.dashboard', icon: LayoutDashboard, path: '/', permission: 'dashboard:read' },
  { key: 'nav.associates', icon: Users, path: '/associates', permission: 'associates:read' },
  { key: 'nav.genealogy', icon: GitBranch, path: '/genealogy', permission: 'genealogy:read' },
  { key: 'Downline', icon: GitBranch, path: '/downline', permission: 'genealogy:read' },
  { key: 'nav.payouts', icon: Wallet, path: '/payouts', permission: 'payouts:read' },
  { key: 'nav.reports', icon: FileText, path: '/reports', permission: 'reports:read' },
  { key: 'nav.funds', icon: DollarSign, path: '/funds', permission: 'funds:read' },
  { key: 'nav.properties', icon: Building, path: '/properties', permission: 'properties:read' },
  { key: 'nav.notifications', icon: Bell, path: '/notifications', permission: 'notifications:read' },
  { key: 'Commissions', icon: DollarSign, path: '/commissions', permission: 'payouts:read' },
  { key: 'Promotions', icon: Users, path: '/promotions', permission: 'associates:read' },
  { key: 'nav.kyc', icon: Shield, path: '/kyc', permission: 'kyc:read' },
  { key: 'nav.support', icon: Headphones, path: '/support', permission: 'support:read' },
  { key: 'nav.config', icon: Settings, path: '/config', permission: 'config:read' },
  { key: 'nav.transactions', icon: ArrowLeftRight, path: '/transactions', permission: 'transactions:read' },
];


export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout, hasPermission } = useAuth();
  const { t, lang, switchLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => { await logout(); };
  const toggleLang = () => { switchLang(lang === 'en' ? 'hi' : 'en'); };
  const visibleNavItems = navItems.filter(item => !item.permission || hasPermission(item.permission));
  const isMastersActive = location.pathname === '/masters';
  const isMyAccountActive = location.pathname === '/my-account';

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col transform bg-slate-900 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="IWR" className="h-9 w-9 rounded-lg object-cover shrink-0" />
            <h1 className="text-sm font-bold text-white truncate leading-tight">Investors World<br />Realty</h1>
          </div>
          <button className="lg:hidden text-white hover:text-gray-300" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto sidebar-scroll px-3 pb-4">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink to={item.path} end={item.path === '/'} onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-gold-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <Icon size={18} />
                    <span>{t(item.key)}</span>
                  </NavLink>
                </li>
              );
            })}

            {/* My Account NavLink */}
            <li>
              <NavLink to="/my-account" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-gold-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <UserCircle size={18} />
                <span>My Account</span>
              </NavLink>
            </li>

            {/* Masters NavLink */}
            <li>
              <NavLink to="/masters" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-gold-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <BookOpen size={18} />
                <span>Masters</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
          <button className="lg:hidden text-gray-600 hover:text-gray-900" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <NavLink to="/company" className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gold-50 hover:text-gold-600 transition-colors">
              <UserCircle size={20} />{admin?.name || 'Admin'}
            </NavLink>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
              <LogOut size={16} /><span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto main-scroll"><Outlet /></main>
      </div>
    </div>
  );
}
