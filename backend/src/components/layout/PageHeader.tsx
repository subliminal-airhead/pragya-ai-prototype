import React from 'react';
import { Eyebrow } from '../ui/Eyebrow';

export interface PageHeaderProps {
  title: string;
  description?: string;
  phaseKicker?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  phaseKicker,
  eyebrow,
  actions,
  children,
}) => {
  return (
    <div className="mb-8 space-y-4 pb-6 border-b border-[#E8E8E1]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          {(eyebrow || phaseKicker) && (
            <Eyebrow kicker={phaseKicker}>{eyebrow || phaseKicker}</Eyebrow>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18201D]">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-[#717A75] leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
};
