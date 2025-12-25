import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MainContent from './MainContent';
import { cn } from '../../utils/helpers';

const Layout = ({ children, className = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={cn('flex h-screen bg-background overflow-hidden', className)}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={closeSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar onSidebarToggle={toggleSidebar} />
        
        {/* Main Content */}
        <MainContent>
          {children}
        </MainContent>
      </div>
    </div>
  );
};

export default Layout;