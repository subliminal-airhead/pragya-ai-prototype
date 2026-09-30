import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface NextStepProps {
  phase: 'Learn' | 'Build' | 'Prove' | 'Apply' | 'Career';
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  impactScore?: string;
  className?: string;
}

export const NextStep: React.FC<NextStepProps> = ({
  phase,
  title,
  description,
  actionLabel,
  actionHref,
  impactScore,
  className,
}) => {
  return (
    <Card className={`border border-[#E5E6DF] border-l-4 border-l-[#2D6A4F] bg-white p-5 shadow-sm rounded-xl ${className || ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2D6A4F] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A347]" />
            <span>Next Recommended Action • {phase}</span>
            {impactScore && (
              <span className="text-[#2D6A4F] font-bold">({impactScore})</span>
            )}
          </div>
          <h4 className="text-base font-bold text-[#18201D]">{title}</h4>
          <p className="text-sm text-[#717A75] max-w-2xl">{description}</p>
        </div>
        <Link to={actionHref} className="shrink-0">
          <Button variant="primary" iconRight={<ArrowRight className="w-4 h-4" />}>
            {actionLabel}
          </Button>
        </Link>
      </div>
    </Card>
  );
};
