import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Input = React.forwardRef(({
  className = '',
  type = 'text',
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  showPasswordToggle = false,
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [inputType, setInputType] = React.useState(type);

  React.useEffect(() => {
    if (showPasswordToggle && type === 'password') {
      setInputType(showPassword ? 'text' : 'password');
    } else {
      setInputType(type);
    }
  }, [showPassword, type, showPasswordToggle]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputId = props.id || props.name || 'input';

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={cn(
            'w-full px-3 py-2 rounded-lg glass border transition-all duration-200',
            'bg-transparent text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error 
              ? 'border-error-500 focus:ring-error-500' 
              : 'border-white/10 hover:border-white/20',
            LeftIcon && 'pl-10',
            (RightIcon || showPasswordToggle) && 'pr-10',
            className
          )}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-neon-green"
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
        
        {RightIcon && !showPasswordToggle && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;