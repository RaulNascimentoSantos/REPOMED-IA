import * as React from 'react';
import { Eye, EyeOff, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'error' | 'success' | 'warning';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: InputSize;
  variant?: InputVariant;
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  showPasswordToggle?: boolean;
  mask?: 'cpf' | 'phone' | 'cep';
  debounceMs?: number;
  containerClassName?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({
  className = '',
  containerClassName = '',
  size = 'md',
  variant = 'default',
  label,
  helperText,
  error,
  success,
  leftIcon,
  rightIcon,
  clearable = false,
  showPasswordToggle = false,
  mask,
  debounceMs = 0,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value || '');
  const debounceTimerRef = React.useRef<NodeJS.Timeout>();
  
  const inputId = id || React.useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  
  // Determine actual variant based on props
  const actualVariant = error ? 'error' : success ? 'success' : variant;
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-3 py-2 text-sm min-h-[40px]',
    lg: 'px-4 py-3 text-base min-h-[44px]'
  };
  
  // Variant classes
  const variantClasses = {
    default: 'border-slate-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500'
  };
  
  // Base classes
  const baseClasses = 'w-full rounded-xl border bg-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-700';
  
  // Apply mask formatting
  const applyMask = (value: string, maskType: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    
    switch (maskType) {
      case 'cpf':
        return numbersOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
      case 'phone':
        if (numbersOnly.length <= 10) {
          return numbersOnly.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
          return numbersOnly.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
        }
      case 'cep':
        return numbersOnly.replace(/(\d{5})(\d{3})/, '$1-$2').slice(0, 9);
      default:
        return value;
    }
  };
  
  // Handle change with debounce and masking
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Apply mask if specified
    if (mask) {
      newValue = applyMask(newValue, mask);
      e.target.value = newValue;
    }
    
    setInternalValue(newValue);
    
    // Debounced onChange
    if (debounceMs > 0 && onChange) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onChange(e);
      }, debounceMs);
    } else if (onChange) {
      onChange(e);
    }
  };
  
  // Handle clear
  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };
  
  // Handle focus/blur
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  // Cleanup debounce timer
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Sync internal value with external value
  React.useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value as string);
    }
  }, [value, internalValue]);
  
  // Get status icon
  const getStatusIcon = () => {
    if (actualVariant === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
    if (actualVariant === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (actualVariant === 'warning') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return null;
  };
  
  // Get password toggle icon
  const getPasswordIcon = () => {
    if (!showPasswordToggle || type !== 'password') return null;
    return (
      <button
        type="button"
        className="flex items-center justify-center w-4 h-4 text-slate-500 hover:text-slate-700"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    );
  };
  
  // Get clear button
  const getClearButton = () => {
    if (!clearable || !internalValue || disabled) return null;
    return (
      <button
        type="button"
        className="flex items-center justify-center w-4 h-4 text-slate-500 hover:text-slate-700"
        onClick={handleClear}
        aria-label="Clear input"
      >
        <X className="w-4 h-4" />
      </button>
    );
  };
  
  const inputClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[actualVariant]} ${leftIcon || rightIcon || clearable || showPasswordToggle ? 'pr-10' : ''} ${leftIcon ? 'pl-10' : ''} ${className}`;
  
  const inputType = showPasswordToggle && type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-900 dark:text-slate-100"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            <span className="text-slate-500">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={inputClasses}
          aria-describedby={ariaDescribedBy || (helperText || error || success) ? `${error ? errorId : ''} ${helperText ? helperId : ''}`.trim() || undefined : undefined}
          autoComplete={mask ? 'off' : props.autoComplete}
          {...props}
        />
        
        {(rightIcon || getStatusIcon() || getClearButton() || getPasswordIcon()) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {rightIcon && <span className="text-slate-500">{rightIcon}</span>}
            {getStatusIcon()}
            {getClearButton()}
            {getPasswordIcon()}
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <div className="text-xs">
          {error && (
            <p id={errorId} className="text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {success && !error && (
            <p className="text-green-600 dark:text-green-400">
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p id={helperId} className="text-slate-600 dark:text-slate-400">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});