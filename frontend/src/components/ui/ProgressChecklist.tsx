import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  linkTo?: string;
  hint?: string;
}

export interface ProgressChecklistProps {
  items: ChecklistItem[];
  onToggle?: (id: string) => void;
  className?: string;
}

export const ProgressChecklist: React.FC<ProgressChecklistProps> = ({
  items,
  onToggle,
  className,
}) => {
  return (
    <ul className={cn('space-y-2.5', className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            'flex items-start gap-3 p-2.5 rounded-lg border transition-all text-sm',
            item.completed
              ? 'bg-[#F0F1EA]/60 border-[#E8E8E1] text-[#717A75]'
              : 'bg-white border-[#E5E6DF] text-[#18201D] hover:border-[#D0D2C7] shadow-2xs'
          )}
        >
          <button
            type="button"
            onClick={() => onToggle?.(item.id)}
            className="mt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] rounded-full cursor-pointer"
            aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            ) : (
              <Circle className="w-4 h-4 text-[#717A75] hover:text-[#18201D]" />
            )}
          </button>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className={cn(item.completed && 'line-through opacity-75 text-[#717A75]')}>
              {item.text}
            </span>
            {item.linkTo && (
              <Link
                to={item.linkTo}
                className="text-xs text-[#2D6A4F] hover:underline font-semibold shrink-0"
              >
                Go to task →
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
