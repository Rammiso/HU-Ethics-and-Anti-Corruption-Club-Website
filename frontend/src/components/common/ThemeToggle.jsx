import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-10 items-center justify-center rounded-lg
        glass hover-lift focus-ring transition-all duration-200
        hover:bg-accent hover:text-accent-foreground
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative">
        {/* Sun icon for light mode */}
        <Sun 
          className={`
            h-5 w-5 transition-all duration-300 absolute inset-0
            ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
          `}
        />
        
        {/* Moon icon for dark mode */}
        <Moon 
          className={`
            h-5 w-5 transition-all duration-300 absolute inset-0
            ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
          `}
        />
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="w-full h-full rounded-lg bg-gradient-to-r from-neon-green/20 to-neon-blue/20 blur-sm"></div>
      </div>
    </button>
  );
};

export default ThemeToggle;