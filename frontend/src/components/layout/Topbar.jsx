import React, { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";
import { cn } from "../../utils/helpers";

const Topbar = ({ onSidebarToggle, className = "" }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Mock notifications - replace with real data
  const notifications = [
    {
      id: 1,
      title: "New Report Submitted",
      message: "A new anonymous report has been submitted",
      time: "5 minutes ago",
      unread: true,
    },
    {
      id: 2,
      title: "System Update",
      message: "System maintenance completed successfully",
      time: "1 hour ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 border-b border-white/10",
        "glass backdrop-blur-md",
        "flex items-center justify-between px-4 lg:px-6",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg glass hover-lift focus-ring"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="
              w-64 pl-10 pr-4 py-2 rounded-lg
              glass border border-white/10
              bg-transparent text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg glass hover-lift focus-ring"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 glass rounded-xl shadow-2xl border border-white/10 z-50">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread notifications
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b border-white/5 hover:bg-accent/50 transition-colors cursor-pointer",
                      notification.unread && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          notification.unread ? "bg-neon-green" : "bg-muted"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/10">
                <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-2 rounded-lg glass hover-lift focus-ring transition-all duration-200"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium">
                {user?.name || "Admin User"}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.role || "Administrator"}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isProfileOpen && "rotate-180"
              )}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-2xl border border-white/10 z-50">
              <div className="p-4 border-b border-white/10">
                <div className="font-medium">{user?.name || "Admin User"}</div>
                <div className="text-sm text-muted-foreground">
                  {user?.email || "admin@hueacc.edu.et"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Role: {user?.role || "Administrator"}
                </div>
              </div>

              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left">
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left">
                  <Settings className="w-4 h-4" />
                  <span>Preferences</span>
                </button>
              </div>

              <div className="p-2 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-error-500/10 hover:text-error-500 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Topbar;
