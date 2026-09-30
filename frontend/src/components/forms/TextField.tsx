import React from 'react';
import { cn } from '../../lib/utils';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 text-left">
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#18201D]">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-[#F8F8F5] px-3.5 py-2 text-sm text-[#18201D] placeholder-[#717A75] shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25 focus:border-[#2D6A4F]',
            error
              ? 'border-rose-500 focus:ring-rose-500/25'
              : 'border-[#E5E6DF] hover:border-[#D0D2C7]',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-[11px] text-[#717A75]">{hint}</p>}
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
