import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Button = React.forwardRef(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover-lift',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-input',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    neon: 'bg-transparent text-neon-green border border-neon-green/50 hover:bg-neon-green/10 hover:border-neon-green hover:shadow-neon',
    success: 'bg-success-500 text-white hover:bg-success-600',
    warning: 'bg-warning-500 text-white hover:bg-warning-600',
    error: 'bg-error-500 text-white hover:bg-error-600'
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
    icon: 'h-10 w-10'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && LeftIcon && <LeftIcon className="w-4 h-4 mr-2" />}
      {children}
      {!loading && RightIcon && <RightIcon className="w-4 h-4 ml-2" />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;