import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { cn } from '../../utils/helpers';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password);
      
      showNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back to HUEACC Admin Panel'
      });

      // Navigation will be handled by the redirect logic above
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }

      showNotification({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage
      });

      // Set form-level error
      setErrors({
        form: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-neon">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display neon-text mb-2">
            HUEACC Admin
          </h1>
          <p className="text-muted-foreground">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form-level Error */}
            {errors.form && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-error-500/10 border border-error-500/20">
                <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0" />
                <p className="text-sm text-error-500">{errors.form}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={cn(
                  'w-full px-4 py-3 rounded-lg glass border transition-all duration-200',
                  'bg-transparent text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent',
                  errors.email 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-white/10 hover:border-white/20'
                )}
                placeholder="admin@hueacc.edu.et"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-error-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    'w-full px-4 py-3 pr-12 rounded-lg glass border transition-all duration-200',
                    'bg-transparent text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent',
                    errors.password 
                      ? 'border-error-500 focus:ring-error-500' 
                      : 'border-white/10 hover:border-white/20'
                  )}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-neon-green"
                  disabled={isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-error-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                'bg-gradient-to-r from-neon-green to-green-500 text-white font-medium',
                'hover:from-neon-green/90 hover:to-green-500/90 hover:shadow-neon',
                'focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2 focus:ring-offset-background',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                'transition-all duration-200 hover-lift'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Need help? Contact{' '}
                <a 
                  href="mailto:admin@hueacc.edu.et" 
                  className="text-neon-green hover:text-neon-green/80 transition-colors"
                >
                  admin@hueacc.edu.et
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;