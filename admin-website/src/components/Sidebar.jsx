import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Building2, Settings, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Home Page CMS', path: '/home', icon: <Home size={20} /> },
    { name: 'Projects CMS', path: '/projects', icon: <Building2 size={20} /> },
    { name: 'Contact Inquiries', path: '/inquiries', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="w-64 bg-[#0a0f1a] text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-serif text-gold-500 font-bold">IWR Admin</h2>
        <p className="text-xs text-gray-400 mt-1">Website CMS</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
