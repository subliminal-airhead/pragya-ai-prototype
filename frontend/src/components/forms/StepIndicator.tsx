import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { id: number; label: string }[];
  onStepClick?: (step: number) => void;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
  className,
}) => {
  return (
    <div className={cn('w-full max-w-2xl mx-auto mb-8', className)}>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8E8E1] -translate-y-1/2 -z-0" />
        {steps.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div
              key={step.id}
              onClick={() => onStepClick && isDone && onStepClick(step.id)}
              className={cn(
                'relative z-10 flex flex-col items-center gap-1.5 select-none',
                isDone && onStepClick && 'cursor-pointer'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all border',
                  isDone
                    ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white ring-4 ring-[#2D6A4F]/20 shadow-xs'
                    : 'bg-white border-[#D8D9D1] text-[#717A75]'
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium hidden sm:block',
                  isCurrent ? 'text-[#2D6A4F] font-bold' : isDone ? 'text-[#18201D]' : 'text-[#717A75]'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
