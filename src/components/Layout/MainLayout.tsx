import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // For chat page, use a simpler layout with collapsible sidebar
  if (isHomePage) {
    return (
      <div className="flex h-screen bg-[#343541]">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-50 p-2 bg-[#202123] rounded-md md:hidden"
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-5 h-5 text-white" />
          ) : (
            <Bars3Icon className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Mobile sidebar */}
        <div 
          className={`fixed inset-0 z-40 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out md:hidden`}
        >
          <div className="relative flex h-full">
            <div className="h-full">
              <Sidebar />
            </div>
            <div 
              className="flex-1 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            ></div>
          </div>
        </div>

        {/* Desktop sidebar - hidden by default, shown with hover */}
        <div className="hidden md:block">
          <div className="fixed top-0 left-0 h-full">
            <Sidebar />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-48">
          {children}
        </div>
      </div>
    );
  }
  
  // For other pages, use the standard layout
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-48">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
