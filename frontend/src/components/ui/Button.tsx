import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      icon,
      iconRight,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#2D6A4F] text-white hover:bg-[#24553F] active:bg-[#1B3F2F] shadow-sm rounded-lg border border-[#2D6A4F]/20',
      secondary:
        'bg-[#F0F1EA] text-[#18201D] hover:bg-[#E5E6DF] active:bg-[#DCDDD5] border border-[#E5E6DF] rounded-lg',
      outline:
        'border border-[#D8D9D1] bg-white text-[#18201D] hover:bg-[#F8F8F5] active:bg-[#F0F1EA] rounded-lg shadow-2xs',
      ghost:
        'bg-transparent text-[#18201D] hover:bg-[#F0F1EA] rounded-lg',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm rounded-lg',
      link: 'text-[#2D6A4F] hover:underline p-0 h-auto font-medium',
    };

    const sizes = {
      sm: 'text-xs py-1.5 px-3 gap-1.5 min-h-[32px]',
      md: 'text-sm py-2 px-4 gap-2 min-h-[40px]',
      lg: 'text-base py-2.5 px-5 gap-2.5 min-h-[44px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== 'link' && sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
