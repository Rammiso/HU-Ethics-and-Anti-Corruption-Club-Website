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
  ChevronRight,
  User,
  LogOut
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';
import Button from '../ui/Button';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and analytics',
    permissions: []
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: Shield,
    description: 'Anonymous reports management',
    permissions: ['manage_reports', 'view_reports']
  },
  {
    name: 'News',
    href: '/news',
    icon: FileText,
    description: 'News articles management',
    permissions: ['manage_news', 'manage_content']
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
    description: 'Events management',
    permissions: ['manage_events', 'manage_content']
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
    description: 'Contact messages',
    permissions: ['manage_content']
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Statistics and insights',
    permissions: ['view_analytics']
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management',
    permissions: ['manage_users']
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System settings',
    permissions: ['manage_system']
  },
];

const Sidebar = ({ isOpen, onToggle, className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, hasPermission, canAccessRoute } = useAuth();

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveRoute = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  // Filter navigation items based on permissions
  const visibleNavItems = navigationItems.filter(item => {
    if (item.permissions.length === 0) return true;
    return item.permissions.some(permission => hasPermission(permission));
  });

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

        {/* User Profile Section */}
        {!isCollapsed && (
          <div className="p-4 border-b border-white/10">
            <Link
              to="/profile"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
              <User className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 scrollbar-thin overflow-y-auto">
          {visibleNavItems.map((item) => {
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
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Profile Link (collapsed state) */}
          {isCollapsed && (
            <Link
              to="/profile"
              className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-accent/50 transition-colors group"
              title="Profile"
            >
              <User className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
            </Link>
          )}

          {/* Logout Button */}
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            onClick={handleLogout}
            className={cn(
              "w-full",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            leftIcon={!isCollapsed ? LogOut : undefined}
          >
            {isCollapsed ? (
              <LogOut className="w-4 h-4" />
            ) : (
              "Sign Out"
            )}
          </Button>

          {!isCollapsed && (
            <div className="text-xs text-muted-foreground text-center pt-2">
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