import * as React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  tooltip?: string;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button({ 
  className = '', 
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  loadingText,
  tooltip,
  disabled,
  children,
  onClick,
  'aria-label': ariaLabel,
  ...props 
}, ref) {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // Base styles
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed relative overflow-hidden';
  
  // Size variants
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[32px]',
    md: 'px-4 py-2 text-sm rounded-xl min-h-[40px]',
    lg: 'px-6 py-3 text-base rounded-xl min-h-[44px]',
    xl: 'px-8 py-4 text-lg rounded-2xl min-h-[48px]'
  };
  
  // Color variants
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-900',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 focus-visible:ring-slate-400 disabled:bg-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 disabled:bg-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-500 disabled:bg-green-300',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 focus-visible:ring-yellow-500 disabled:bg-yellow-300'
  };
  
  // Disabled styles
  const disabledStyles = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '';
  
  // Create ripple effect
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      event.preventDefault();
      return;
    }
    
    createRipple(event);
    onClick?.(event);
  };
  
  // Icon spacing
  const iconSpacing = size === 'sm' ? 'gap-1.5' : size === 'xl' ? 'gap-3' : 'gap-2';
  
  const buttonClasses = `${base} ${sizes[size]} ${variants[variant]} ${disabledStyles} ${iconSpacing} ${className}`;
  
  const content = isLoading ? (
    <>
      <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : size === 'xl' ? 'w-5 h-5' : 'w-4 h-4'}`} />
      {loadingText || children}
    </>
  ) : (
    <>
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  );
  
  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={isLoading}
      title={tooltip}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white bg-opacity-30 rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      
      {content}
    </button>
  );
});