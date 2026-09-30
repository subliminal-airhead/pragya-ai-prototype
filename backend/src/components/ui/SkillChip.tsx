import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface SkillChipProps {
  label: string;
  level?: string;
  selected?: boolean;
  verified?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  label,
  level,
  selected = false,
  verified = false,
  onClick,
  className,
}) => {
  const isClickable = Boolean(onClick);
  const baseClasses =
    'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors';
  const interactiveClasses = isClickable
    ? selected
      ? 'bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 hover:bg-[#E1EDE5] cursor-pointer font-semibold shadow-2xs'
      : 'bg-[#F0F1EA] text-[#18201D] border border-[#E5E6DF] hover:bg-[#E5E6DF] cursor-pointer'
    : 'bg-[#F0F1EA] text-[#18201D] border border-[#E5E6DF]';

  const Content = (
    <>
      {verified && <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] shrink-0" />}
      {selected && <Check className="w-3 h-3 text-[#2D6A4F] shrink-0" />}
      <span>{label}</span>
      {level && (
        <span className="text-[10px] text-[#717A75] font-mono ml-0.5 opacity-90">
          ({level})
        </span>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(baseClasses, interactiveClasses, className)}
      >
        {Content}
      </button>
    );
  }

  return <span className={cn(baseClasses, interactiveClasses, className)}>{Content}</span>;
};
