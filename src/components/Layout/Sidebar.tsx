import React from 'react';
import { NavLink } from 'react-router-dom';
// Updated imports for HeroIcons v2
import {
  HomeIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'AI Chat Analysis', icon: <HomeIcon className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Dashboard', icon: <ChartBarIcon className="w-4 h-4" /> },
    { to: '/contracts', label: 'Contracts', icon: <ShieldCheckIcon className="w-4 h-4" /> },
    { to: '/alerts', label: 'Alerts', icon: <BellIcon className="w-4 h-4" /> },
    { to: '/transactions', label: 'Transactions', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { to: '/upload-contract', label: 'Upload Contract', icon: <ArrowUpTrayIcon className="w-4 h-4" /> },
    { to: '/settings', label: 'Settings', icon: <Cog6ToothIcon className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-48 bg-[#202123] text-gray-300 shadow-md">
      <div className="px-3 py-4">
        <h2 className="text-base font-bold text-white mb-6 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2" />
          AI Sentinel
        </h2>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center px-3 py-2 rounded-md text-xs font-medium
                ${isActive 
                  ? 'bg-[#343541] text-white' 
                  : 'text-gray-300 hover:bg-[#2a2b32] hover:text-white'}
              `}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;