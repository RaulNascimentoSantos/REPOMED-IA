import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-400',
        outline: 'border-2 border-neutral-300 bg-transparent hover:bg-neutral-50 focus-visible:ring-neutral-400',
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-400',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
        success: 'bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500',
        clinical: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700',
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-md gap-1',
        sm: 'h-9 px-3 text-sm rounded-md gap-1.5',
        md: 'h-10 px-4 text-base rounded-lg gap-2',
        lg: 'h-12 px-6 text-lg rounded-lg gap-2',
        xl: 'h-14 px-8 text-xl rounded-xl gap-3',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    }
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';