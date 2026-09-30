import React from 'react';
import { CareerPath } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { MatchBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ArrowRight, CheckCircle2, TrendingUp, Building2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';

export const CareerCard: React.FC<{ career: CareerPath }> = ({ career }) => {
  const { setTargetCareerId } = useApp();

  return (
    <Card hoverEffect className={`flex flex-col justify-between bg-white border border-[#E5E6DF] ${career.isTarget ? 'border-[#2D6A4F] bg-[#EBF3EE]/30 ring-1 ring-[#2D6A4F]/20' : ''}`}>
      <div>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 mb-1">
            <MatchBadge score={career.matchScore} />
            {career.isTarget && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2D6A4F] bg-[#EBF3EE] px-2 py-0.5 rounded-md border border-[#2D6A4F]/30 font-bold">
                <Target className="w-3 h-3" /> Target Career
              </span>
            )}
          </div>
          <CardTitle className="text-xl mt-1 text-[#18201D]">{career.title}</CardTitle>
          <CardDescription className="text-[#717A75]">{career.shortDescription}</CardDescription>
        </CardHeader>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E8E8E1] text-xs mb-4">
          <div>
            <span className="text-[#717A75] block mb-0.5">Average Compensation</span>
            <span className="font-mono font-semibold text-[#18201D]">{career.avgSalary}</span>
          </div>
          <div>
            <span className="text-[#717A75] block mb-0.5">Market Demand</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#2D6A4F]">
              <TrendingUp className="w-3.5 h-3.5" />
              {career.marketDemand} ({career.growthRate})
            </span>
          </div>
        </div>

        {/* Required Skills breakdown */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-mono text-[#717A75] uppercase tracking-wider font-semibold">
            Key Role Competencies ({career.requiredSkills.filter(s => s.userMatches).length}/{career.requiredSkills.length} Verified)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {career.requiredSkills.map((skill) => (
              <span
                key={skill.skillId || skill.name}
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border ${
                  skill.userMatches
                    ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/30 font-medium'
                    : 'bg-[#F0F1EA] text-[#717A75] border-[#E5E6DF]'
                }`}
              >
                {skill.userMatches && <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />}
                <span>{skill.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Top Hiring Companies */}
        <div className="flex items-center gap-1.5 text-xs text-[#717A75] mb-2">
          <Building2 className="w-3.5 h-3.5 text-[#717A75] shrink-0" />
          <span className="text-[#717A75]">Hiring:</span>
          <span className="truncate text-[#18201D] font-medium">{career.topHiringCompanies.slice(0, 4).join(', ')}</span>
        </div>
      </div>

      <CardFooter className="gap-2 border-t border-[#E8E8E1]">
        {!career.isTarget ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTargetCareerId(career.id)}
          >
            Set as Target
          </Button>
        ) : (
          <div className="text-xs text-[#2D6A4F] font-mono font-bold">
            Active Target Roadmap
          </div>
        )}
        <Link to={routes.careerDetail(career.slug)}>
          <Button variant="secondary" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
            Diagnostic &amp; Why
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
