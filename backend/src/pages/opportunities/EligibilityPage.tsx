import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { routes } from '../../lib/routes';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const EligibilityPage: React.FC = () => {
  const { opportunity: slug } = useParams<{ opportunity: string }>();
  const navigate = useNavigate();
  const { opportunities, updateOpportunityStage, showToast, user } = useApp();
  const opp = opportunities.find((o) => o.slug === slug || o.id === slug) || opportunities[0];

  const [checklist, setChecklist] = useState(() =>
    opp.requirements.map((r, i) => ({
      id: i,
      text: r.requirement,
      checked: r.satisfied,
      mandatory: r.mandatory,
    }))
  );

  useEffect(() => {
    setChecklist(
      opp.requirements.map((r, i) => ({
        id: i,
        text: r.requirement,
        checked: r.satisfied,
        mandatory: r.mandatory,
      }))
    );
  }, [opp]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const allMandatoryMet = checklist.filter((c) => c.mandatory).every((c) => c.checked);
  const totalMet = checklist.filter((c) => c.checked).length;
  const isReady = allMandatoryMet && totalMet >= checklist.length - 1;

  const handleApply = () => {
    updateOpportunityStage(opp.id, 'Applied');
    showToast(`Application submitted! Added to your Pipeline Tracker.`);
    navigate(routes.opportunitiesTracker);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-3xl mx-auto">
      <Link
        to={routes.opportunityDetail(opp.slug)}
        className="inline-flex items-center gap-1.5 text-xs text-[#717A75] hover:text-[#18201D] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {opp.company} Opportunity</span>
      </Link>

      <PageHeader
        phaseKicker="Pre-Flight Eligibility Checklist"
        title={`Apply to ${opp.company}: ${opp.title}`}
        description={`Validating credentials for ${user.fullName} (${user.degree}, Class of ${user.gradYear}) against ${opp.company}'s minimum prerequisite gates.`}
      />

      {/* Candidate Verified Credentials Snapshot */}
      <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-[#18201D] text-sm">{user.fullName}</span>
            <span className="text-[#717A75] ml-2">({user.university})</span>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span>CGPA: <strong className="text-[#2D6A4F]">{user.cgpa || '8.4'}</strong></span>
          <span>Grad Year: <strong>{user.gradYear}</strong></span>
          <span>Skills: <strong>{user.skills.length} Verified</strong></span>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border border-[#E5E6DF] bg-white shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E1]">
          <div>
            <div className="text-xs font-mono text-[#717A75] uppercase font-semibold">Eligibility Status</div>
            <div className="text-lg font-bold text-[#18201D] mt-0.5">
              {totalMet} of {checklist.length} Gates Verified
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isReady
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40'
                : 'bg-[#FEF9EE] text-[#B45309] border-[#D4A347]/40'
            }`}
          >
            {isReady ? 'Eligible to Apply' : 'Pre-requisite Gap Detected'}
          </span>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-colors ${
                item.checked
                  ? 'bg-[#EBF3EE]/60 border-[#2D6A4F]/30 text-[#18201D]'
                  : 'bg-[#F8F8F5] border-[#E5E6DF] text-[#717A75] hover:border-[#D0D2C7]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.checked ? (
                  <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#BCC1BC]" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <span className={item.checked ? 'font-semibold text-[#18201D]' : 'text-[#717A75]'}>
                  {item.text}
                </span>
                {item.mandatory && (
                  <span className="block text-[11px] font-mono text-[#B45309] mt-0.5 font-semibold">
                    Strict Prerequisite Requirement
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Verdict Message */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
            isReady
              ? 'bg-[#EBF3EE] border-[#2D6A4F]/30 text-[#18201D]'
              : 'bg-[#FEF9EE] border-[#D4A347]/40 text-[#18201D]'
          }`}
        >
          {isReady ? (
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm mb-0.5">
              {isReady
                ? `High Probability Profile Verified for ${user.fullName.split(' ')[0]}`
                : 'Notice: Incomplete Prerequisite Gates'}
            </div>
            {isReady ? (
              <p>
                Your verified skill proof and graduation criteria meet the standard for this role.
                Dispatching your application now records it into your active Opportunity Pipeline.
              </p>
            ) : (
              <p>
                You have unmet prerequisites for this role. We strongly recommend bridging the missing
                competencies in the Skill Gap hub before submitting to avoid candidate auto-rejections.
              </p>
            )}
          </div>
        </div>

        <CardFooter className="pt-4 border-t border-[#E8E8E1] flex items-center justify-between">
          {!isReady ? (
            <Link to={routes.skillGap}>
              <Button variant="outline" size="md" icon={<Zap className="w-4 h-4 text-[#D4A347]" />}>
                Go to Skill Gap Hub
              </Button>
            </Link>
          ) : (
            <div />
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {isReady ? 'Confirm & Submit Application' : 'Proceed Anyway (Risk of Rejection)'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
