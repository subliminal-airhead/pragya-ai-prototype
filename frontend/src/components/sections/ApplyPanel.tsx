import React from 'react';
import { Opportunity } from '../../types';
import { MatchBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ArrowRight, Bookmark, BookmarkCheck, CheckCircle2, AlertCircle, MapPin, IndianRupee, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';

export const ApplyPanel: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
  const { saveOpportunity } = useApp();
  const isSaved = opportunity.stage === 'Saved';
  const isApplied = Boolean(opportunity.stage && opportunity.stage !== 'Saved');

  return (
    <div className="rounded-xl border border-[#E5E6DF] bg-white p-5 space-y-4 hover:border-[#D0D2C7] transition-all shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-[#18201D] text-base">{opportunity.company}</span>
            <span className="text-[#D0D2C7]">•</span>
            <span className="text-xs text-[#717A75] font-mono">{opportunity.type}</span>
            <span className="text-[#D0D2C7]">•</span>
            <span className="text-xs text-[#717A75]">{opportunity.workplaceType}</span>
          </div>
          <Link
            to={routes.opportunityDetail(opportunity.slug)}
            className="text-lg font-bold text-[#18201D] hover:text-[#2D6A4F] transition-colors"
          >
            {opportunity.title}
          </Link>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <MatchBadge score={opportunity.matchScore} />
          <button
            onClick={() => saveOpportunity(opportunity.id)}
            className="p-2 rounded-lg border border-[#E5E6DF] hover:border-[#D0D2C7] text-[#717A75] hover:text-[#18201D] transition-colors cursor-pointer"
            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            aria-label="Save opportunity"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-[#2D6A4F]" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-[#717A75] py-2 border-y border-[#E8E8E1]">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#717A75]" />
          {opportunity.location}
        </span>
        <span className="flex items-center gap-1 font-mono text-[#18201D] font-semibold">
          <IndianRupee className="w-3.5 h-3.5 text-[#2D6A4F]" />
          {opportunity.salaryRange}
        </span>
        <span className="text-[#717A75] font-mono">Deadline: {opportunity.deadline}</span>
        {opportunity.stage && (
          <span className="ml-auto px-2 py-0.5 rounded text-[11px] font-mono bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 font-semibold">
            Stage: {opportunity.stage}
          </span>
        )}
      </div>

      {/* Why Matched Snapshot */}
      <div className="bg-[#F8F8F5] p-3.5 rounded-lg border border-[#E5E6DF] text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[#717A75] uppercase tracking-wider font-semibold">
            Why Matched Diagnostic
          </span>
          <Link
            to={routes.opportunityWhyMatched(opportunity.slug)}
            className="text-[#2D6A4F] font-semibold hover:underline"
          >
            Full Explainability →
          </Link>
        </div>
        <p className="text-[#18201D] leading-relaxed">{opportunity.whyMatchDetails.summary}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {opportunity.matchedSkills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 font-medium"
            >
              <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
              {s}
            </span>
          ))}
          {opportunity.missingSkills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#FDF8ED] text-[#B27B18] border border-[#D4A347]/30 font-medium"
            >
              <AlertCircle className="w-3 h-3 text-[#B27B18]" />
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link
          to={routes.opportunityEligibility(opportunity.slug)}
          className="text-xs text-[#717A75] hover:text-[#18201D] hover:underline"
        >
          Check Pre-requisite Eligibility Checklist →
        </Link>
        <div className="flex items-center gap-2">
          {opportunity.applyUrl && (
            <a
              href={opportunity.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E6DF] hover:bg-[#F0F1EA] text-xs font-semibold text-[#18201D] transition-colors"
            >
              <span>Portal</span>
              <ExternalLink className="w-3 h-3 text-[#717A75]" />
            </a>
          )}
          <Link to={routes.opportunityEligibility(opportunity.slug)}>
            <Button
              variant={opportunity.matchScore >= 90 ? 'primary' : 'secondary'}
              size="sm"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {isApplied ? 'Review Status' : 'Check Eligibility & Apply'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
