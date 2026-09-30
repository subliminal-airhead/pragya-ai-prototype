import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { MatchBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { routes } from '../../lib/routes';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  GraduationCap,
} from 'lucide-react';

export const WhyMatchedPage: React.FC = () => {
  const { opportunity: slug } = useParams<{ opportunity: string }>();
  const { opportunities, user } = useApp();
  const opp = opportunities.find((o) => o.slug === slug || o.id === slug) || opportunities[0];
  const { whyMatchDetails } = opp;
  const candidateProjectName = user.projects?.[0]?.title || 'Practical Portfolio Projects';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Link
        to={routes.opportunityDetail(opp.slug)}
        className="inline-flex items-center gap-1.5 text-xs text-[#717A75] hover:text-[#18201D] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Opportunity Details</span>
      </Link>

      <PageHeader
        phaseKicker="Explainability Engine"
        title={`Why You Match: ${opp.title} at ${opp.company}`}
        description={`Transparent scoring breakdown calibrated for ${user.fullName} (${user.degree}, ${user.university}) against ${opp.company}'s engineering hiring requirements.`}
        actions={<MatchBadge score={opp.matchScore} />}
      />

      {/* Signal Weights Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#2D6A4F] font-bold">
            <Cpu className="w-4 h-4" />
            <span>Technical Skills Overlap</span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#18201D]">
            {whyMatchDetails.skillOverlapScore}%
          </div>
          <ProgressBar value={whyMatchDetails.skillOverlapScore} showPercent={false} color="growth" />
          <p className="text-xs text-[#717A75] pt-1 leading-relaxed">
            High overlap in {opp.matchedSkills.slice(0, 3).join(', ')}.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#2D6A4F] font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>Project Proof Quality</span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#18201D]">
            {whyMatchDetails.experienceScore}%
          </div>
          <ProgressBar value={whyMatchDetails.experienceScore} showPercent={false} color="growth" />
          <p className="text-xs text-[#717A75] pt-1 leading-relaxed">
            Demonstrated proof from &quot;{candidateProjectName}&quot; repository deliverable.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#2D6A4F] font-bold">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Alignment</span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#18201D]">
            {whyMatchDetails.educationScore}%
          </div>
          <ProgressBar value={whyMatchDetails.educationScore} showPercent={false} color="growth" />
          <p className="text-xs text-[#717A75] pt-1 leading-relaxed">
            Meets Class of {user.gradYear} timeline and {user.cgpa} CGPA criteria at {user.university}.
          </p>
        </Card>
      </div>

      {/* Detailed Diagnostic Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E1] text-[#2D6A4F] font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Strongest Candidate Advantages for {user.fullName.split(' ')[0]}</span>
          </div>
          <ul className="space-y-3 text-sm text-[#18201D]">
            {whyMatchDetails.advantages.map((adv, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] mt-2 shrink-0" />
                <span className="leading-relaxed">{adv}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E1] text-[#B27B18] font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Candidate Gaps &amp; Missing Role Keywords</span>
          </div>
          <ul className="space-y-3 text-sm text-[#18201D]">
            {whyMatchDetails.riskFactors.map((rf, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4A347] mt-2 shrink-0" />
                <span className="leading-relaxed">{rf}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Link to={routes.skillGap}>
          <Button variant="outline" size="md">
            Bridge Gaps in Skill Gap Hub
          </Button>
        </Link>
        <Link to={routes.opportunityEligibility(opp.slug)}>
          <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
            Proceed to Pre-Flight Eligibility Checklist
          </Button>
        </Link>
      </div>
    </div>
  );
};
