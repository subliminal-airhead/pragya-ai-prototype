import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MockInterview } from '../../components/sections/MockInterview';
import { InterviewPrepTips } from '../../components/sections/InterviewPrepTips';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import {
  History,
  Sparkles,
  Play,
  Layers,
} from 'lucide-react';

export const InterviewPage: React.FC = () => {
  const { targetCareer, interviewResults, user } = useApp();
  const [viewMode, setViewMode] = useState<'both' | 'tips' | 'simulation'>('both');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Phase 3: Prove"
        title="Technical Interview Preparation &amp; AI Simulation"
        description={`AI-calibrated interview prep and mock screens for ${targetCareer.title}. Tailored to ${user.fullName}'s verified skills, academic background, and target timeline.`}
        actions={
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F0F1EA] border border-[#E5E6DF] rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'both'
                  ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
                  : 'text-[#717A75] hover:text-[#18201D]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Complete View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tips')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'tips'
                  ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
                  : 'text-[#717A75] hover:text-[#18201D]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A347]" />
              <span>AI Prep Tips</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('simulation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'simulation'
                  ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
                  : 'text-[#717A75] hover:text-[#18201D]'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Mock Simulation</span>
            </button>
          </div>
        }
      />

      {/* Section 1: AI-Generated Personalized Interview Preparation Tips */}
      {(viewMode === 'both' || viewMode === 'tips') && (
        <section aria-label="AI Preparation Playbook" className="space-y-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] shrink-0" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-[#717A75] font-bold">
                Section 1 • Personalized Preparation Vectors
              </h2>
            </div>
            {viewMode === 'both' && (
              <button
                type="button"
                onClick={() => setViewMode('simulation')}
                className="text-xs text-[#2D6A4F] hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                Jump to Mock Screen Simulation →
              </button>
            )}
          </div>
          <InterviewPrepTips />
        </section>
      )}

      {/* Section 2: Interactive AI Mock Technical Screen */}
      {(viewMode === 'both' || viewMode === 'simulation') && (
        <section aria-label="Mock Technical Simulation" className="space-y-4 pt-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] shrink-0" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-[#717A75] font-bold">
                Section 2 • Interactive Rubric Evaluation &amp; Simulation
              </h2>
            </div>
            {viewMode === 'both' && (
              <button
                type="button"
                onClick={() => setViewMode('tips')}
                className="text-xs text-[#2D6A4F] hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                ← Back to Preparation Playbook
              </button>
            )}
          </div>
          <MockInterview />
        </section>
      )}

      {/* Section 3: Past Simulation History */}
      {interviewResults.length > 0 && (
        <section aria-label="Simulation History" className="max-w-4xl mx-auto space-y-4 pt-6 border-t border-[#E8E8E1]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#18201D]">
              <History className="w-4 h-4 text-[#2D6A4F]" />
              <span>Simulation Session History ({interviewResults.length} Sessions Logged)</span>
            </div>
            <span className="text-xs text-[#717A75] font-mono">
              Calibrated for {targetCareer.title}
            </span>
          </div>

          <div className="space-y-3">
            {interviewResults.map((res) => (
              <Card key={res.id} className="p-4 flex items-center justify-between text-xs bg-white border border-[#E5E6DF] shadow-xs rounded-xl">
                <div>
                  <div className="font-bold text-[#18201D] text-sm">{res.role}</div>
                  <div className="text-[#717A75] font-mono mt-0.5">{res.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#2D6A4F] font-bold text-base">
                    {res.score}/100
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 font-mono font-semibold">
                    Passed
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
