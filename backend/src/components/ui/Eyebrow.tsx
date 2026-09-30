import React from 'react';
import { cn } from '../../lib/utils';

export interface EyebrowProps {
  children: React.ReactNode;
  kicker?: string;
  className?: string;
}

export const Eyebrow: React.FC<EyebrowProps> = ({ children, kicker, className }) => {
  return (
    <div className={cn('flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2D6A4F] mb-1 font-semibold', className)}>
      {kicker && (
        <>
          <span className="text-[#2D6A4F]">{kicker}</span>
          <span className="text-[#D0D2C7]" aria-hidden="true">/</span>
        </>
      )}
      <span className="text-[#717A75] font-medium">{children}</span>
    </div>
  );
};
