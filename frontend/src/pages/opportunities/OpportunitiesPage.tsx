import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ApplyPanel } from '../../components/sections/ApplyPanel';
import { useApp } from '../../context/AppContext';
import { routes } from '../../lib/routes';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Kanban, BarChart3, Landmark } from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, targetCareer, user } = useApp();
  const [filter, setFilter] = useState<'all' | 'high' | 'remote' | 'saved'>('all');
  const isUploaded = user.resumeUploaded && user.skills.length > 0;

  const filtered = opportunities.filter((o) => {
    if (filter === 'high') return o.matchScore >= 90;
    if (filter === 'remote') return o.workplaceType === 'Remote';
    if (filter === 'saved') return o.stage === 'Saved';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Phase 4: Apply"
        title="Opportunity Match Engine"
        description={
          isUploaded
            ? `Algorithmic matching calibrated for ${user.fullName} (${user.resumeFileName || 'uploaded resume'}) against ${targetCareer.title}. Every role includes explainability diagnostics and a pre-flight eligibility check.`
            : `Opportunities for ${targetCareer.title}. Upload your resume to benchmark your compatibility scores and pre-flight eligibility against these hiring gates.`
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to={routes.govtSchemes}>
              <Button variant="outline" size="sm" icon={<Landmark className="w-3.5 h-3.5 text-[#2D6A4F]" />}>
                Govt Schemes (MMSKY)
              </Button>
            </Link>
            <Link to={routes.opportunitiesTracker}>
              <Button variant="outline" size="sm" icon={<Kanban className="w-3.5 h-3.5" />}>
                Pipeline Tracker
              </Button>
            </Link>
            <Link to={routes.opportunitiesInsights}>
              <Button variant="secondary" size="sm" icon={<BarChart3 className="w-3.5 h-3.5" />}>
                Market Insights
              </Button>
            </Link>
          </div>
        }
      >
        <div className="flex items-center gap-1 p-1 bg-[#F0F1EA] border border-[#E5E6DF] rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            All Matches ({opportunities.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'high'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            Top Fits ≥ 85% ({opportunities.filter((o) => o.matchScore >= 85).length})
          </button>
          <button
            onClick={() => setFilter('remote')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'remote'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            Remote Roles ({opportunities.filter((o) => o.workplaceType === 'Remote').length})
          </button>
          <button
            onClick={() => setFilter('saved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'saved'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            Saved Roles ({opportunities.filter((o) => o.stage === 'Saved').length})
          </button>
        </div>
      </PageHeader>

      {!isUploaded && (
        <div className="p-5 rounded-xl border border-[#D4A347]/40 bg-[#FEF9EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
          <div className="space-y-1">
            <span className="font-mono text-[#B45309] font-bold uppercase block text-[11px]">
              Match Scores Awaiting Candidate Resume
            </span>
            <p className="text-[#717A75] leading-relaxed">
              Campus to Corporate calculates role fit percentages and checks required credentials against your uploaded resume. Upload your resume to unlock calibrated match percentages and pre-flight eligibility.
            </p>
          </div>
          <Link to={routes.resumeImport} className="shrink-0">
            <Button variant="primary" size="sm">
              Upload Resume to Match Jobs →
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((opp) => (
          <ApplyPanel key={opp.id} opportunity={opp} />
        ))}
      </div>
    </div>
  );
};
