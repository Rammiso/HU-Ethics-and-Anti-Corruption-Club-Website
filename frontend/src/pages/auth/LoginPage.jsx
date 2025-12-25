import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertCircle, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { useForm } from '../../hooks/useForm';
import { cn } from '../../utils/helpers';
import { loginSchema } from '../../utils/schemas';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isAuthenticated, loading: authLoading, sessionExpired } = useAuth();
  const { showNotification, error: showError } = useNotification();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm(loginSchema, {
    email: '',
    password: ''
  });

  // Handle session expiry notification
  useEffect(() => {
    if (sessionExpired) {
      showError('Session Expired', 'Your session has expired. Please log in again.');
    }
  }, [sessionExpired, showError]);

  // Listen for session expiry events
  useEffect(() => {
    const handleSessionExpiry = () => {
      showError('Session Expired', 'Your session has expired. Please log in again.');
    };

    window.addEventListener('auth:session-expired', handleSessionExpiry);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpiry);
  }, [showError]);

  // Redirect if already authenticated
  if (isAuthenticated && !authLoading) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    try {
      clearErrors();
      
      const result = await login(data.email, data.password, rememberMe);
      
      showNotification({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${result.user.name}!`
      });

      // Navigation will be handled by the redirect logic above
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err.message.includes('email') || err.message.includes('password')) {
        setError('email', { message: err.message });
      } else if (err.message.includes('suspended') || err.message.includes('inactive')) {
        setError('root', { message: err.message });
      } else if (err.message.includes('attempts')) {
        setError('root', { message: err.message });
      } else {
        setError('root', { message: err.message || 'Login failed. Please try again.' });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-neon-green" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Form-level Error */}
            {errors.root && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-error-500/10 border border-error-500/20">
                <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0" />
                <p className="text-sm text-error-500">{errors.root.message}</p>
              </div>
            )}

            {/* Session Expired Warning */}
            {sessionExpired && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-warning-500/10 border border-warning-500/20">
                <Lock className="w-5 h-5 text-warning-500 flex-shrink-0" />
                <p className="text-sm text-warning-500">
                  Your session has expired. Please log in again.
                </p>
              </div>
            )}

            {/* Email Field */}
            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="admin@hueacc.edu.et"
              leftIcon={Mail}
              error={errors.email?.message}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />

            {/* Password Field */}
            <Input
              {...register('password')}
              type="password"
              label="Password"
              placeholder="Enter your password"
              leftIcon={Lock}
              showPasswordToggle
              error={errors.password?.message}
              disabled={isSubmitting}
              autoComplete="current-password"
              required
            />

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-neon-green focus:ring-neon-green"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              
              <Link
                to="/forgot-password"
                className="text-sm text-neon-green hover:text-neon-green/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
              leftIcon={!isSubmitting ? Shield : undefined}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
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

        {/* Security Notice */}
        <div className="mt-8 p-4 rounded-lg bg-muted/20 border border-muted/40">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                This is a secure admin area. All activities are logged and monitored. 
                Unauthorized access attempts will be reported.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;