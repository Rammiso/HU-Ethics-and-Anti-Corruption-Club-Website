import React from 'react';
import { cn } from '../../utils/helpers';

const MainContent = ({ children, className = '' }) => {
  return (
    <main className={cn(
      'flex-1 flex flex-col min-h-0',
      'bg-background',
      className
    )}>
      {/* Content Area */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
          {children}
        </div>
      </div>
    </main>
  );
};

export default MainContent;