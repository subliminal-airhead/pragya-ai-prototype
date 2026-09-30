import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../lib/routes';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle2, Loader2, ArrowRight, Sparkles, Brain, Cpu, Database } from 'lucide-react';

interface Stage {
  id: number;
  label: string;
  detail: string;
  icon: typeof Brain;
}

const stages: Stage[] = [
  {
    id: 1,
    label: 'Parsing Document Structure & Formatting',
    detail: 'Evaluating ATS parseability, heading hierarchy, and date consistency',
    icon: Database,
  },
  {
    id: 2,
    label: 'Extracting Technical Competencies & Systems Proof',
    detail: 'Identifying programming languages, framework depths, and project architectures',
    icon: Cpu,
  },
  {
    id: 3,
    label: 'Benchmarking Against Industry Target Career Specs',
    detail: 'Comparing skill levels against Full-Stack, AI and Systems Engineer expectations',
    icon: Brain,
  },
  {
    id: 4,
    label: 'Synthesizing Diagnostic Matrix & Learning Roadmap',
    detail: 'Mapping critical gaps to practical lab modules and proof engineering projects',
    icon: Sparkles,
  },
];

export const AnalysisProgress: React.FC = () => {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCompletedStages([1]);
      setCurrentStage(2);
    }, 1100);
    const timer2 = setTimeout(() => {
      setCompletedStages([1, 2]);
      setCurrentStage(3);
    }, 2200);
    const timer3 = setTimeout(() => {
      setCompletedStages([1, 2, 3]);
      setCurrentStage(4);
    }, 3400);
    const timer4 = setTimeout(() => {
      setCompletedStages([1, 2, 3, 4]);
      setIsDone(true);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EE] border border-[#2D6A4F]/30 text-xs font-mono text-[#2D6A4F] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A347] animate-pulse" />
          <span>Diagnostic Engine Active</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#18201D]">
          Analyzing Engineering Profile
        </h2>
        <p className="text-sm text-[#717A75]">
          Synthesizing your experience into verified competencies and career matches
        </p>
      </div>

      <div className="space-y-3">
        {stages.map((stage) => {
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = currentStage === stage.id && !isDone;
          const Icon = stage.icon;

          return (
            <Card
              key={stage.id}
              className={`p-4 transition-all duration-300 rounded-xl bg-white border ${
                isCurrent
                  ? 'border-[#2D6A4F] bg-[#EBF3EE]/30 shadow-md ring-1 ring-[#2D6A4F]/20'
                  : isCompleted
                  ? 'border-[#E5E6DF] bg-white'
                  : 'border-[#E8E8E1] bg-[#F8F8F5] opacity-60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-[#2D6A4F] animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[#D8D9D1] flex items-center justify-center text-[10px] text-[#717A75] font-mono">
                      {stage.id}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#18201D]">
                      {stage.label}
                    </span>
                    <Icon className="w-4 h-4 text-[#717A75]" />
                  </div>
                  <p className="text-xs text-[#717A75] leading-relaxed">{stage.detail}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <Button
          variant="primary"
          size="lg"
          disabled={!isDone}
          onClick={() => navigate(routes.resumeReview)}
          iconRight={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          {isDone ? 'Review Diagnostic Results' : 'Synthesizing Profile...'}
        </Button>
      </div>
    </div>
  );
};
