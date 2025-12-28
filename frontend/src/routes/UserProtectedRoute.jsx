import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * UserProtectedRoute - Route guard for user-only pages
 * Prevents unauthenticated access and admin access to user routes
 */
const UserProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check if user is logged in
  const userToken = localStorage.getItem("userToken");
  const userType = localStorage.getItem("userType");

  // Not logged in at all
  if (!userToken) {
    // Redirect to user login, saving the attempted location
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  // Logged in but not as a user (e.g., logged in as admin)
  if (userType !== "user") {
    // Redirect to admin dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and is a regular user
  return children;
};

export default UserProtectedRoute;
