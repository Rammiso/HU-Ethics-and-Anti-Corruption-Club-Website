import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Textarea = React.forwardRef(({
  className = '',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  ...props
}, ref) => {
  const [charCount, setCharCount] = React.useState(0);
  const textareaId = props.id || props.name || 'textarea';

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  React.useEffect(() => {
    if (props.value) {
      setCharCount(props.value.length);
    }
  }, [props.value]);

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            'w-full px-3 py-2 rounded-lg glass border transition-all duration-200 resize-vertical',
            'bg-transparent text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error 
              ? 'border-error-500 focus:ring-error-500' 
              : 'border-white/10 hover:border-white/20',
            className
          )}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          onChange={handleChange}
          {...props}
        />
        
        {(showCharCount || maxLength) && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            {charCount}{maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${textareaId}-error`} className="text-sm text-error-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;