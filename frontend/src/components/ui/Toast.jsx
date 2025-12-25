import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Toast = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onRemove,
  className = ''
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onRemove?.(id);
    }, 150);
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      className: 'bg-success-500/10 border-success-500/20 text-success-500',
      iconColor: 'text-success-500'
    },
    error: {
      icon: AlertCircle,
      className: 'bg-error-500/10 border-error-500/20 text-error-500',
      iconColor: 'text-error-500'
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-warning-500/10 border-warning-500/20 text-warning-500',
      iconColor: 'text-warning-500'
    },
    info: {
      icon: Info,
      className: 'bg-info-500/10 border-info-500/20 text-info-500',
      iconColor: 'text-info-500'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'glass-card border max-w-sm w-full transition-all duration-150 cursor-pointer hover-lift',
        config.className,
        isExiting ? 'animate-slide-out-right opacity-0' : 'animate-slide-in-right',
        className
      )}
      onClick={handleRemove}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-sm mb-1">{title}</h4>
          )}
          {message && (
            <p className="text-sm opacity-90">{message}</p>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="flex-shrink-0 p-1 rounded-full hover:bg-current/20 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;