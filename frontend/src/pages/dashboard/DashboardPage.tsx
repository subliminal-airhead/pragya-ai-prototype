import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DashboardCards } from '../../components/sections/DashboardCards';
import { NextStep } from '../../components/ui/NextStep';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PriorityBadge } from '../../components/ui/Badge';
import { ProgressChecklist } from '../../components/ui/ProgressChecklist';
import { useApp } from '../../context/AppContext';
import { routes } from '../../lib/routes';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  BookOpen,
  FileCheck2,
  TrendingUp,
  CheckCircle2,
  Landmark,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, targetCareer, skillGaps, milestones, toggleTaskComplete, opportunities } = useApp();
  const isUploaded = user.resumeUploaded && user.skills.length > 0;
  const currentMilestone = milestones.find((m) => m.status === 'Current') || milestones[0];
  const highMatchOpp = opportunities.slice().sort((a, b) => b.matchScore - a.matchScore)[0] || opportunities[0];
  const primaryGap = skillGaps.find((g) => g.status === 'Action Needed') || skillGaps[0];
  const primaryGapName = primaryGap?.skill?.name || 'Core Foundations';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        phaseKicker="AI Career Readiness &amp; Employability Platform"
        title={`Welcome back, ${user.fullName.split(' ')[0]}`}
        description={
          isUploaded
            ? `Calibrated for ${user.fullName} (${user.degree}, ${user.major}) from uploaded resume (${user.resumeFileName || 'Resume.pdf'}). Target: ${targetCareer.title} (${targetCareer.matchScore}% current match).`
            : `Awaiting resume upload for ${user.fullName}. All benchmarks, NPTEL courses, and MP government schemes will calibrate directly from your uploaded resume.`
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to={routes.careerPaths}>
              <Button variant="outline" size="sm">
                Explore Career Paths
              </Button>
            </Link>
            <Link to={routes.govtSchemes}>
              <Button variant="outline" size="sm" icon={<Landmark className="w-3.5 h-3.5 text-[#2D6A4F]" />}>
                Govt Schemes (MMSKY)
              </Button>
            </Link>
            <Link to={routes.resumeWorkspace}>
              <Button variant="primary" size="sm" icon={<FileCheck2 className="w-3.5 h-3.5" />}>
                ATS Resume Workspace
              </Button>
            </Link>
          </div>
        }
      />

      {/* Resume Ingestion State Banner */}
      {!isUploaded ? (
        <Card className="p-6 bg-[#FEF9EE] border border-[#D4A347]/40 rounded-xl space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#B45309]">
                <Sparkles className="w-4 h-4 text-[#D4A347]" />
                <span>Resume Upload Required • Operating System Uncalibrated</span>
              </div>
              <h2 className="text-xl font-bold text-[#18201D]">
                Every Metric in Campus to Corporate is Calibrated Directly from Your Resume
              </h2>
              <p className="text-xs text-[#717A75] max-w-3xl leading-relaxed">
                Nothing is shown by default. Upload your resume (PDF, Word, or plain text) to parse your verified competencies, compute ATS readiness scores, and discover personalized opportunity matches.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link to={routes.resumeImport}>
                <Button variant="primary" size="sm" icon={<FileCheck2 className="w-4 h-4" />}>
                  Upload Your Resume
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="p-3.5 rounded-xl border border-[#2D6A4F]/30 bg-[#EBF3EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <span className="text-[#18201D]">
              <strong>Calibrated from Uploaded Resume:</strong>{' '}
              <span className="font-mono text-[#2D6A4F] font-bold">{user.resumeFileName || 'Resume.pdf'}</span>{' '}
              (ATS {user.resumeAtsScore}%) • {user.skills.length} verified competencies benchmarked against {targetCareer.title}.
            </span>
          </div>
          <Link
            to={routes.resumeImport}
            className="text-xs font-semibold text-[#2D6A4F] hover:underline shrink-0"
          >
            Upload New Resume Version →
          </Link>
        </div>
      )}

      {/* Recommended Next Step In The Core Loop */}
      {isUploaded ? (
        <NextStep
          phase="Learn"
          title={`Master ${primaryGapName} Benchmark for ${targetCareer.title}`}
          description={primaryGap?.recommendedAction || `Bridges your critical competency gap in ${primaryGapName} required for ${targetCareer.title} hiring gates.`}
          actionLabel={`Bridge ${primaryGapName}`}
          actionHref={routes.skillGap}
          impactScore={`+${Math.min(12, Math.round(primaryGap?.gapScore ? primaryGap.gapScore * 0.35 : 8))}% Match Score`}
        />
      ) : (
        <NextStep
          phase="Prove"
          title="Upload Your Resume to Calibrate Your Career Operating System"
          description="Everything in your dashboard — verified skills, career match percentages, and job recommendations — is powered by your uploaded resume. Upload your resume now to run your personalized diagnostic."
          actionLabel="Upload Resume Now"
          actionHref={routes.resumeImport}
          impactScore="Calibrate 100% of Metrics"
        />
      )}

      {/* Top 4 Metric Cards */}
      <DashboardCards />

      {/* 2-Column Grid: Active Diagnostic Gaps + Active Roadmap Phase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Skill Gaps Diagnostic */}
        <Card className="flex flex-col justify-between bg-white border border-[#E5E6DF] shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4A347]" />
                <h3 className="font-bold text-[#18201D] text-base">Active Skill Gaps</h3>
              </div>
              <Link to={routes.skillGap} className="text-xs text-[#2D6A4F] hover:underline font-semibold">
                View all diagnostic gaps →
              </Link>
            </div>
            <div className="space-y-3">
              {skillGaps.slice(0, 4).map((gap) => (
                <div
                  key={gap.skill.id}
                  className="p-3.5 rounded-lg border border-[#E5E6DF] bg-[#F8F8F5] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#18201D]">{gap.skill.name}</span>
                    <PriorityBadge priority={gap.skill.importance} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#717A75] font-mono">
                    <span>
                      Current: <strong className="text-[#18201D]">{gap.currentScore}%</strong> / Target:{' '}
                      <strong className="text-[#18201D]">{gap.requiredScore}%</strong>
                    </span>
                    <span className="text-[#B27B18] font-bold">{gap.gapScore}% Gap</span>
                  </div>
                  <div className="w-full h-2 bg-[#E8E8E1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4A347] rounded-full transition-all"
                      style={{ width: `${gap.currentScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#717A75] pt-1 leading-relaxed">
                    {gap.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-[#E8E8E1] flex items-center justify-between text-xs">
            <span className="text-[#717A75] font-mono">Estimated bridge time: ~36 hours</span>
            <Link to={routes.roadmap} className="text-[#2D6A4F] hover:underline font-bold">
              Open Complete Roadmap →
            </Link>
          </div>
        </Card>

        {/* Right Column: Active Roadmap Milestone Checklist */}
        <Card className="flex flex-col justify-between bg-white border border-[#E5E6DF] shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2D6A4F]" />
                <h3 className="font-bold text-[#18201D] text-base">
                  {currentMilestone.title}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#717A75] font-medium">{currentMilestone.timeframe}</span>
            </div>
            <p className="text-xs text-[#717A75] leading-relaxed">
              {currentMilestone.description}
            </p>
            <ProgressChecklist
              items={currentMilestone.tasks}
              onToggle={(taskId) => toggleTaskComplete(currentMilestone.id, taskId)}
            />
          </div>
          <div className="pt-4 mt-4 border-t border-[#E8E8E1] flex items-center justify-between text-xs">
            <span className="text-[#717A75] font-mono">
              Tasks Completed:{' '}
              <strong className="text-[#18201D]">{currentMilestone.tasks.filter((t) => t.completed).length}</strong> /{' '}
              {currentMilestone.tasks.length}
            </span>
            <Link to={routes.roadmap}>
              <Button variant="secondary" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Phases
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Featured High-Match Opportunity Card */}
      <Card className="border border-[#E5E6DF] bg-white p-6 shadow-sm rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#2D6A4F] font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Top Career Matched Opportunity ({highMatchOpp.matchScore}% Compatibility)</span>
            </div>
            <h3 className="text-xl font-bold text-[#18201D]">
              {highMatchOpp.title} • {highMatchOpp.company}
            </h3>
            <p className="text-sm text-[#717A75] max-w-2xl leading-relaxed">
              {highMatchOpp.whyMatchDetails.summary}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#717A75] pt-1 font-mono">
              <span>{highMatchOpp.location}</span>
              <span>•</span>
              <span className="text-[#18201D] font-bold">{highMatchOpp.salaryRange}</span>
              <span>•</span>
              <span className="text-[#B27B18] font-semibold">Deadline: {highMatchOpp.deadline}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to={routes.opportunityWhyMatched(highMatchOpp.slug)}>
              <Button variant="outline" size="md">
                Why Matched
              </Button>
            </Link>
            <Link to={routes.opportunityEligibility(highMatchOpp.slug)}>
              <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                Verify Eligibility &amp; Apply
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
