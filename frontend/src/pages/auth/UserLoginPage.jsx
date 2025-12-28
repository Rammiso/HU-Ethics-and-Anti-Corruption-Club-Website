import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { apiClient } from "../../services/api";

const UserLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/auth/user/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Store user token and info
        localStorage.setItem("userToken", token);
        localStorage.setItem("userInfo", JSON.stringify(user));
        localStorage.setItem("userType", "user");

        notification.success(
          "Login Successful",
          `Welcome back, ${user.profile?.name || user.email}!`
        );

        // Redirect to intended page or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      notification.error("Login Failed", message);

      // Handle specific errors
      if (error.response?.status === 401) {
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
        });
      } else if (error.response?.status === 423) {
        notification.error(
          "Account Locked",
          "Account is locked due to multiple failed login attempts. Please try again later."
        );
      } else if (error.response?.status === 403) {
        notification.error(
          "Account Suspended",
          "Account has been suspended. Please contact support."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue mb-4 shadow-neon">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display neon-text mb-2">
            User Login
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-futuristic pl-11 ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-futuristic pl-11 ${
                  errors.password ? "border-red-500" : ""
                }`}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-600 bg-dark-secondary focus:ring-2 focus:ring-neon-green"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Remember me
              </span>
            </label>

            {/* Forgot Password - Future feature */}
            {/* <Link 
              to="/forgot-password" 
              className="text-sm text-neon-green hover:underline"
            >
              Forgot password?
            </Link> */}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In
              </span>
            )}
          </button>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/user/register"
                className="text-neon-green hover:underline font-medium"
              >
                Create one now
              </Link>
            </p>
          </div>

          {/* Admin Login Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Are you an admin?{" "}
              <Link to="/login" className="text-neon-blue hover:underline">
                Admin Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLoginPage;
