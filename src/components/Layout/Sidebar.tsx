import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Shield, AlertTriangle, Activity, Plus } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart2 },
    { name: 'Contract Analysis', href: '/analysis', icon: Shield },
    { name: 'Security Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Transactions', href: '/transactions', icon: Activity },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-blue-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-white">AI Sentinel</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-blue-900 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      isActive(item.href) ? 'text-white' : 'text-blue-300 group-hover:text-white'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4">
            <button className="w-full flex items-center px-4 py-2 text-sm text-white bg-blue-700 rounded-md hover:bg-blue-600">
              <Plus className="mr-2 h-5 w-5" />
              Add Contract
            </button>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Powered by</p>
                  <p className="text-xs font-medium text-blue-200 group-hover:text-white">
                    Google Gemini
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;