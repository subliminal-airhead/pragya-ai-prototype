import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface ChipSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  className?: string;
}

export const ChipSelect: React.FC<ChipSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  max,
  className,
}) => {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, opt]);
    }
  };

  return (
    <div className={cn('space-y-2 text-left', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#18201D]">{label}</label>
        {max && (
          <span className="text-[11px] font-mono text-[#717A75]">
            Selected: {selected.length}/{max}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
                isSelected
                  ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40 font-bold shadow-xs'
                  : 'bg-[#F0F1EA] text-[#717A75] border-[#E5E6DF] hover:text-[#18201D] hover:bg-[#E5E6DF]'
              )}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
