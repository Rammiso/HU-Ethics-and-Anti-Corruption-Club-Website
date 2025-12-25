import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Shield, 
  Users, 
  Settings, 
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and analytics'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: Shield,
    description: 'Anonymous reports management'
  },
  {
    name: 'News',
    href: '/news',
    icon: FileText,
    description: 'News articles management'
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
    description: 'Events management'
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
    description: 'Contact messages'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Statistics and insights'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management',
    superAdminOnly: true
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System settings',
    superAdminOnly: true
  },
];

const Sidebar = ({ isOpen, onToggle, className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActiveRoute = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full transition-all duration-300 ease-in-out',
          'glass border-r border-white/10 shadow-2xl',
          'flex flex-col',
          // Desktop styles
          'lg:relative lg:z-auto',
          isCollapsed ? 'lg:w-16' : 'lg:w-70',
          // Mobile styles
          isOpen ? 'w-70 translate-x-0' : 'w-70 -translate-x-full lg:translate-x-0',
          className
        )}
        style={{ width: isCollapsed ? '4rem' : '17.5rem' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-display neon-text">HUEACC</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          )}
          
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg glass hover-lift focus-ring"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg glass hover-lift focus-ring"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 scrollbar-thin overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'nav-item group relative',
                  isActive && 'active neon',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.name : item.description}
              >
                <Icon className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-neon-green' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </div>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-green rounded-r-full shadow-neon-sm" />
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {!isCollapsed && (
            <div className="text-xs text-muted-foreground text-center">
              <div>Version 1.0.0</div>
              <div className="mt-1">© 2024 HUEACC</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;