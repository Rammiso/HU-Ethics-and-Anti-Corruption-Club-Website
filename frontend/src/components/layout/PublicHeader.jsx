import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Menu, X, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/helpers";

const PublicHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/news", label: "News" },
    { path: "/events", label: "Events" },
    { path: "/report", label: "Report" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <header className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-neon-sm group-hover:shadow-neon transition-shadow duration-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display neon-text">
                HUEACC
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Ethics & Anti-Corruption Club
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-neon-green",
                  isActive(link.path) ? "text-neon-green" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <Link to="/login" className="btn-neon flex items-center gap-2">
                <User className="w-4 h-4" />
                Admin Login
              </Link>
            )}

            {isAuthenticated && (
              <Link to="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4 animate-slide-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "bg-primary/10 text-neon-green"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="btn-neon flex items-center gap-2 justify-center mt-2"
                >
                  <User className="w-4 h-4" />
                  Admin Login
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="btn-primary mt-2"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
