import React from "react";
import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Us" },
    { path: "/news", label: "News" },
    { path: "/events", label: "Events" },
  ];

  const reportLinks = [
    { path: "/report", label: "Submit Report" },
    { path: "/report/track", label: "Track Report" },
    { path: "/contact", label: "Contact Us" },
  ];

  return (
    <footer className="border-t border-white/10 bg-background/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-neon-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display">HUEACC</h2>
                <p className="text-xs text-muted-foreground">
                  Ethics & Anti-Corruption
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Haramaya University Ethics and Anti-Corruption Club is dedicated
              to fostering transparency, accountability, and ethical conduct.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-neon-green transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Report Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Reporting</h3>
            <ul className="space-y-2">
              {reportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-neon-green transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-neon-green flex-shrink-0" />
                <span>Haramaya University, Dire Dawa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-neon-green flex-shrink-0" />
                <a
                  href="mailto:contact@hueacc.edu.et"
                  className="hover:text-neon-green transition-colors"
                >
                  contact@hueacc.edu.et
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-neon-green flex-shrink-0" />
                <a
                  href="tel:+251123456789"
                  className="hover:text-neon-green transition-colors"
                >
                  +251 12 345 6789
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} HUEACC. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-neon-green transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-neon-green transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
