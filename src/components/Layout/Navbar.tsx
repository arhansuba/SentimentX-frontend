import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';

interface NavbarProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme, isDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <Link to="/" className="text-xl font-bold text-blue-600 flex items-center">
                <span className="ml-2 hidden md:block">MultiversX AI Sentinel</span>
                <span className="ml-2 md:hidden">AI Sentinel</span>
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <div className="relative">
              <button
                className="p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    
                    <div className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 text-xs">!</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">High risk alert</p>
                          <p className="text-xs text-gray-500">Contract: erd1...xyz detected reentrancy vulnerability</p>
                          <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-yellow-600 text-xs">!</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Medium risk alert</p>
                          <p className="text-xs text-gray-500">Contract: erd1...abc has suspicious token transfers</p>
                          <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-2 text-center">
                      <Link to="/alerts" className="text-xs text-blue-600 hover:text-blue-800">
                        View all notifications
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex items-center">
              <div className="flex items-center">
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">AI Sentinel</div>
                  <div className="text-sm font-medium text-gray-500">MultiversX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={toggleTheme}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </nav>
  );
};

export default Navbar;