import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { MatchBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { routes } from '../../lib/routes';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const OpportunityDetailPage: React.FC = () => {
  const { opportunity: slug } = useParams<{ opportunity: string }>();
  const { opportunities } = useApp();
  const opp = opportunities.find((o) => o.slug === slug || o.id === slug) || opportunities[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Link
        to={routes.opportunities}
        className="inline-flex items-center gap-1.5 text-xs text-[#717A75] hover:text-[#18201D] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Opportunity Engine</span>
      </Link>

      <PageHeader
        phaseKicker={`${opp.company} • ${opp.type}`}
        title={opp.title}
        description={opp.description}
        actions={
          <div className="flex items-center gap-3">
            <MatchBadge score={opp.matchScore} />
            <Link to={routes.opportunityEligibility(opp.slug)}>
              <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                Pre-Flight Eligibility Check
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
            <h3 className="text-base font-bold text-[#18201D]">Role Requirements &amp; Candidate Match</h3>
            <div className="space-y-3">
              {opp.requirements.map((req, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF] text-sm"
                >
                  <div className="mt-0.5 shrink-0">
                    {req.satisfied ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#D4A347]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={req.satisfied ? 'text-[#18201D] font-medium' : 'text-[#717A75]'}>
                      {req.requirement}
                    </span>
                    {req.mandatory && (
                      <span className="text-[10px] font-mono text-[#B45309] ml-2 uppercase font-semibold">
                        (Strict Prerequisite)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E1]">
              <h3 className="text-base font-bold text-[#18201D]">Why You Match Diagnostic</h3>
              <Link to={routes.opportunityWhyMatched(opp.slug)} className="text-xs text-[#2D6A4F] hover:underline font-semibold">
                View Full Diagnostic Breakdown →
              </Link>
            </div>
            <p className="text-sm text-[#717A75] leading-relaxed">
              {opp.whyMatchDetails.summary}
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#717A75] font-bold">
              Opportunity Metadata
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#E8E8E1]">
                <span className="text-[#717A75]">Compensation</span>
                <span className="font-mono font-bold text-[#2D6A4F]">{opp.salaryRange}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E8E8E1]">
                <span className="text-[#717A75]">Workplace Type</span>
                <span className="text-[#18201D] font-medium">{opp.workplaceType}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E8E8E1]">
                <span className="text-[#717A75]">Location</span>
                <span className="text-[#18201D] font-medium">{opp.location}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E8E8E1]">
                <span className="text-[#717A75]">Application Deadline</span>
                <span className="font-mono text-[#B45309] font-semibold">{opp.deadline}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E8E8E1]">
                <span className="text-[#717A75]">Pipeline Status</span>
                <span className="font-mono text-[#2D6A4F] font-semibold">{opp.stage || 'Not Applied'}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              {opp.applyUrl && (
                <a
                  href={opp.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-[#E5E6DF] hover:bg-[#F0F1EA] text-xs font-semibold text-[#18201D] transition-colors"
                >
                  <span>Open Official Application Link</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#717A75]" />
                </a>
              )}
              <Link to={routes.opportunityEligibility(opp.slug)} className="w-full block">
                <Button variant="primary" size="md" className="w-full" iconRight={<ArrowRight className="w-4 h-4" />}>
                  Check Eligibility Checklist
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
