import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../common/AuthContext.jsx';
import { useI18n } from '../common/i18n.jsx';

const navItems = [
  { key: 'nav.dashboard', icon: LayoutDashboard, path: '/', permission: 'dashboard:read' },
  { key: 'nav.associates', icon: Users, path: '/associates', permission: 'associates:read' },
  { key: 'nav.genealogy', icon: GitBranch, path: '/genealogy', permission: 'genealogy:read' },
  { key: 'nav.payouts', icon: Wallet, path: '/payouts', permission: 'payouts:read' },
  { key: 'nav.reports', icon: FileText, path: '/reports', permission: 'reports:read' },
  { key: 'nav.funds', icon: DollarSign, path: '/funds', permission: 'funds:read' },
  { key: 'nav.properties', icon: Building, path: '/properties', permission: 'properties:read' },
  { key: 'nav.notifications', icon: Bell, path: '/notifications', permission: 'notifications:read' },
  { key: 'Commissions', icon: DollarSign, path: '/commissions', permission: 'payouts:read' },
  { key: 'Promotions', icon: Users, path: '/promotions', permission: 'associates:read' },
  { key: 'nav.kyc', icon: Shield, path: '/kyc', permission: 'kyc:read' },
  { key: 'nav.config', icon: Settings, path: '/config', permission: 'config:read' },
  { key: 'nav.transactions', icon: ArrowLeftRight, path: '/transactions', permission: 'transactions:read' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout, hasPermission } = useAuth();
  const { t, lang, switchLang } = useI18n();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const toggleLang = () => {
    switchLang(lang === 'en' ? 'hi' : 'en');
  };

  const visibleNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white truncate">
            Investors World Realty
          </h1>
          <button
            className="lg:hidden text-white hover:text-gray-300"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gold-500 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{t(item.key)}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            {/* Language toggle */}
            {/* <button
              onClick={toggleLang}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('lang.switch')}
            </button> */}

            {/* Admin name */}
            <span className="text-sm font-medium text-gray-700">
              {admin?.name || 'Admin'}
            </span>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
