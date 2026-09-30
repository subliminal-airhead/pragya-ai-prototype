import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variants = {
    default: 'bg-[#F0F1EA] text-[#18201D] border-[#E5E6DF]',
    success: 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/30',
    warning: 'bg-[#FDF8ED] text-[#B27B18] border-[#D4A347]/30',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/30',
    outline: 'border-[#E5E6DF] text-[#717A75] bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const MatchBadge: React.FC<{ score: number; label?: string; className?: string }> = ({
  score,
  label,
  className,
}) => {
  const isHigh = score >= 85;
  const isMedium = score >= 70 && score < 85;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border',
        isHigh
          ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/30'
          : isMedium
          ? 'bg-[#FDF8ED] text-[#B27B18] border-[#D4A347]/30'
          : 'bg-[#F0F1EA] text-[#717A75] border-[#E5E6DF]',
        className
      )}
    >
      <span className="font-mono text-sm leading-none font-bold">{score}%</span>
      <span>{label || (isHigh ? 'Strong Fit' : isMedium ? 'Good Match' : 'Gap Bridgeable')}</span>
    </div>
  );
};

export const PriorityBadge: React.FC<{ priority: 'Critical' | 'Important' | 'Nice-to-have' }> = ({
  priority,
}) => {
  if (priority === 'Critical') {
    return <Badge variant="danger">Critical Gap</Badge>;
  }
  if (priority === 'Important') {
    return <Badge variant="warning">Important</Badge>;
  }
  return <Badge variant="default">Nice-to-have</Badge>;
};
