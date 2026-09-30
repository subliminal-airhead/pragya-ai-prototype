import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { ApplicationStage } from '../../types';
import { routes } from '../../lib/routes';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const stages: { stage: ApplicationStage; label: string; color: string }[] = [
  { stage: 'Saved', label: 'Saved Roles', color: 'border-[#E5E6DF]' },
  { stage: 'Applied', label: 'Applied', color: 'border-[#2D6A4F]/40' },
  { stage: 'Assessment', label: 'Tech Assessment', color: 'border-[#D4A347]/50' },
  { stage: 'Interview', label: 'Interviewing', color: 'border-[#2D6A4F]/50' },
  { stage: 'Offer', label: 'Offers Received', color: 'border-[#2D6A4F]' },
  { stage: 'Closed', label: 'Closed / Archived', color: 'border-[#E5E6DF]' },
];

export const ApplicationTrackerPage: React.FC = () => {
  const { opportunities, updateOpportunityStage } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Phase 4: Apply"
        title="Application Pipeline Tracker"
        description="Track active candidacy stages from saved opportunities to technical assessments, interview rounds, and offers."
        actions={
          <Link to={routes.opportunities}>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Find More Opportunities
            </Button>
          </Link>
        }
      />

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stages.map((col) => {
          const matchingOpps = opportunities.filter((o) => o.stage === col.stage);

          return (
            <div
              key={col.stage}
              className={`rounded-xl border ${col.color} bg-[#F8F8F5] p-4 space-y-4 flex flex-col justify-between min-h-[360px] shadow-2xs`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1] text-xs">
                  <span className="font-mono font-bold text-[#18201D] uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#717A75] font-mono text-[11px] border border-[#E5E6DF] font-semibold">
                    {matchingOpps.length}
                  </span>
                </div>

                <div className="space-y-3 pt-3">
                  {matchingOpps.map((opp) => (
                    <Card
                      key={opp.id}
                      hoverEffect
                      className="p-4 space-y-3 border border-[#E5E6DF] bg-white text-left shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-[#2D6A4F]">{opp.company}</div>
                          <Link
                            to={routes.opportunityDetail(opp.slug)}
                            className="text-sm font-bold text-[#18201D] hover:underline line-clamp-1"
                          >
                            {opp.title}
                          </Link>
                        </div>
                        <span className="font-mono text-xs text-[#2D6A4F] font-bold shrink-0 bg-[#EBF3EE] px-2 py-0.5 rounded border border-[#2D6A4F]/30">
                          {opp.matchScore}%
                        </span>
                      </div>

                      <div className="text-[11px] text-[#717A75] space-y-1">
                        <div className="flex justify-between font-mono">
                          <span className="text-[#18201D] font-medium">{opp.salaryRange}</span>
                          {opp.appliedDate && <span>Applied: {opp.appliedDate}</span>}
                        </div>
                        {opp.notes && (
                          <div className="p-2 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF] text-[#717A75] italic">
                            &quot;{opp.notes}&quot;
                          </div>
                        )}
                      </div>

                      {/* Stage switcher dropdown */}
                      <div className="pt-2 border-t border-[#E8E8E1] flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[#717A75] font-mono uppercase font-semibold">
                          Move Stage:
                        </span>
                        <select
                          value={opp.stage}
                          onChange={(e) =>
                            updateOpportunityStage(opp.id, e.target.value as ApplicationStage)
                          }
                          className="bg-[#F0F1EA] border border-[#E5E6DF] text-[#18201D] text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] cursor-pointer"
                        >
                          {stages.map((s) => (
                            <option key={s.stage} value={s.stage}>
                              {s.stage}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Card>
                  ))}

                  {matchingOpps.length === 0 && (
                    <div className="text-center py-12 text-[#717A75] text-xs font-mono">
                      No roles in {col.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
