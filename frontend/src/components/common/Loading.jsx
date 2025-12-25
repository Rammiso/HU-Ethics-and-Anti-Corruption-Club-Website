import React from 'react';
import { cn } from '../../utils/helpers';

const Loading = ({ 
  size = 'md', 
  variant = 'default',
  text = '',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const SpinnerComponent = ({ className: spinnerClassName }) => {
    if (variant === 'neon') {
      return (
        <div className={cn('spinner-neon', sizeClasses[size], spinnerClassName)}>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-green animate-spin" />
          <div className="absolute inset-1 rounded-full border border-transparent border-t-neon-blue animate-spin animate-reverse" />
        </div>
      );
    }

    return (
      <div className={cn('spinner', sizeClasses[size], spinnerClassName)} />
    );
  };

  if (text) {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        <SpinnerComponent />
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      </div>
    );
  }

  return <SpinnerComponent className={className} />;
};

// Full page loading component
export const PageLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loading size="lg" variant="neon" />
        <p className="mt-4 text-muted-foreground animate-pulse">{text}</p>
      </div>
    </div>
  );
};

// Inline loading component
export const InlineLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loading size="sm" />
      <span>{text}</span>
    </div>
  );
};

// Button loading component
export const ButtonLoading = () => {
  return <Loading size="sm" className="mr-2" />;
};

export default Loading;