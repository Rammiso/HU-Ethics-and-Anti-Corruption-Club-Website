import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Select = React.forwardRef(({
  className = '',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = 'Select an option...',
  options = [],
  ...props
}, ref) => {
  const selectId = props.id || props.name || 'select';

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 pr-10 rounded-lg glass border transition-all duration-200 appearance-none',
            'bg-transparent text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error 
              ? 'border-error-500 focus:ring-error-500' 
              : 'border-white/10 hover:border-white/20',
            className
          )}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      
      {error && (
        <p id={`${selectId}-error`} className="text-sm text-error-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;