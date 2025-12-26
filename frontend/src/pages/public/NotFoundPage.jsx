import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";

const NotFoundPage = () => {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-9xl font-bold font-display neon-text">404</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-neon-green to-neon-blue mx-auto mt-4 rounded-full"></div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary flex items-center gap-2 justify-center"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;
