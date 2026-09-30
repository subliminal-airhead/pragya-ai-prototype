import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'growth' | 'indigo' | 'emerald' | 'amber' | 'blue';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  color = 'growth',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorStyles = {
    growth: 'bg-[#2D6A4F]',
    indigo: 'bg-[#2D6A4F]',
    emerald: 'bg-[#2D6A4F]',
    amber: 'bg-[#D4A347]',
    blue: 'bg-[#2D6A4F]',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-[#717A75] font-medium">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-mono text-[#18201D] font-semibold">{percentage}%</span>}
        </div>
      )}
      <div
        className="w-full h-2 bg-[#E8E8E1] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full transition-all duration-500 rounded-full', colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
