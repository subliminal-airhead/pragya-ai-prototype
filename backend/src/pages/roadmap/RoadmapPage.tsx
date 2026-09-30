import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../lib/api';
import {
  Compass,
  Zap,
  BookOpen,
  Briefcase,
  Landmark,
  Sparkles,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { CareerCard } from '../../components/sections/CareerCard';
import { CourseCard } from '../../components/sections/CourseCard';
import { ApplyPanel } from '../../components/sections/ApplyPanel';

interface StepProgress {
  step: 'careers' | 'gaps' | 'courses' | 'opportunities' | 'govt' | 'score';
  status: 'pending' | 'started' | 'done' | 'failed';
  progress: number;
}

export const RoadmapPage: React.FC = () => {
  const { targetCareer, user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'careers' | 'gaps' | 'courses' | 'opportunities' | 'govt'>('overview');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState<number>(100);
  const [streamedSteps, setStreamedSteps] = useState<Record<string, StepProgress>>({
    careers: { step: 'careers', status: 'done', progress: 0.25 },
    gaps: { step: 'gaps', status: 'done', progress: 0.45 },
    courses: { step: 'courses', status: 'done', progress: 0.65 },
    opportunities: { step: 'opportunities', status: 'done', progress: 0.8 },
    govt: { step: 'govt', status: 'done', progress: 0.92 },
    score: { step: 'score', status: 'done', progress: 1.0 },
  });

  const [roadmapData, setRoadmapData] = useState<{
    careers: any[];
    gaps: any;
    courses: any[];
    opportunities: any[];
    govt_schemes: any[];
    employability_score: {
      score: number;
      score_after_improvements: number;
      breakdown: {
        technical_skills: number;
        project_proof: number;
        academic_alignment: number;
        resume_ats: number;
      };
    };
  } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load from session storage or stream
  useEffect(() => {
    const savedRoadmapId = localStorage.getItem('pragya_last_roadmap_id');
    if (savedRoadmapId) {
      apiClient.getStoredRoadmap(savedRoadmapId)
        .then((data) => {
          if (data && data.careers) {
            setRoadmapData(data);
          }
        })
        .catch(() => {
          // If not found, stream a fresh one
          triggerRoadmapStream();
        });
    } else {
      triggerRoadmapStream();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [user.id, targetCareer.id]);

  const triggerRoadmapStream = () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsStreaming(true);
    setStreamProgress(0.05);

    setStreamedSteps({
      careers: { step: 'careers', status: 'started', progress: 0.1 },
      gaps: { step: 'gaps', status: 'pending', progress: 0.3 },
      courses: { step: 'courses', status: 'pending', progress: 0.5 },
      opportunities: { step: 'opportunities', status: 'pending', progress: 0.7 },
      govt: { step: 'govt', status: 'pending', progress: 0.85 },
      score: { step: 'score', status: 'pending', progress: 0.95 },
    });

    const accumulatedData: any = {
      careers: [],
      gaps: null,
      courses: [],
      opportunities: [],
      govt_schemes: [],
      employability_score: {
        score: user.resumeAtsScore ? Math.round(user.resumeAtsScore * 0.9) : 74,
        score_after_improvements: 92,
        breakdown: { technical_skills: 78, project_proof: 72, academic_alignment: 85, resume_ats: user.resumeAtsScore || 78 },
      },
    };

    apiClient.streamRoadmap(
      { profileId: user.id, targetRole: targetCareer.title },
      {
        onStep: (data) => {
          setStreamProgress(data.progress);
          setStreamedSteps((prev) => ({
            ...prev,
            [data.step]: { step: data.step as any, status: data.status as any, progress: data.progress },
          }));

          if (data.status === 'done' && data.data) {
            if (data.step === 'careers') accumulatedData.careers = data.data;
            if (data.step === 'gaps') accumulatedData.gaps = data.data;
            if (data.step === 'courses') accumulatedData.courses = data.data;
            if (data.step === 'opportunities') accumulatedData.opportunities = data.data;
            if (data.step === 'govt') accumulatedData.govt_schemes = data.data;
            if (data.step === 'score') accumulatedData.employability_score = data.data;

            setRoadmapData({ ...accumulatedData });
          }
        },
        onDone: (roadmapId) => {
          setIsStreaming(false);
          setStreamProgress(1.0);
          localStorage.setItem('pragya_last_roadmap_id', roadmapId);
          showToast('Roadmap generation complete!');
        },
        onError: (err) => {
          console.warn('Stream error, falling back:', err);
          setIsStreaming(false);
        },
      },
      controller.signal
    );
  };

  const currentScore = roadmapData?.employability_score?.score || 76;
  const targetScore = roadmapData?.employability_score?.score_after_improvements || 92;
  const scoreDelta = targetScore - currentScore;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Grounded Execution Engine"
        title="Personalized Employability Roadmap"
        description={`Continuously calibrated for ${user.fullName} (${user.degree}, ${user.university}). Target role: ${targetCareer.title}.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={isStreaming}
              onClick={triggerRoadmapStream}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />}
            >
              Re-generate Stream
            </Button>
          </div>
        }
      />

      {/* Streaming Progress Stepper (per Blueprint Section 7.4) */}
      {isStreaming && (
        <Card className="p-5 border border-[#2D6A4F]/30 bg-[#EBF3EE]/60 rounded-xl space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#2D6A4F] font-mono font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Streaming Roadmap Pipeline ({Math.round(streamProgress * 100)}%)</span>
            </div>
            <span className="font-mono text-[#717A75]">Server-Sent Events (SSE) Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-xs">
            {[
              { key: 'careers', label: '1. Careers' },
              { key: 'gaps', label: '2. Skill Gaps' },
              { key: 'courses', label: '3. SWAYAM' },
              { key: 'opportunities', label: '4. Internships' },
              { key: 'govt', label: '5. MMSKY' },
              { key: 'score', label: '6. Score' },
            ].map(({ key, label }) => {
              const stepState = streamedSteps[key];
              const isDone = stepState?.status === 'done';
              const isCurrent = stepState?.status === 'started';

              return (
                <div
                  key={key}
                  className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                    isDone
                      ? 'bg-white border-[#2D6A4F]/40 text-[#2D6A4F] font-bold shadow-2xs'
                      : isCurrent
                      ? 'bg-white border-[#D4A347] text-[#B45309] font-bold ring-2 ring-[#D4A347]/20'
                      : 'bg-[#F0F1EA]/50 border-transparent text-[#717A75]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B45309]" />
                    ) : null}
                    <span>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Hero Employability Score Ring & Delta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-[#E5E6DF] rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[#717A75] mb-2 uppercase font-semibold">
              <span>Employability Index</span>
              <span className="text-[#2D6A4F] font-bold font-mono">0 - 100</span>
            </div>
            <div className="flex items-baseline gap-3 my-2">
              <span className="text-5xl font-extrabold font-mono text-[#18201D]">
                {currentScore}
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-[#717A75]">Current Bar</span>
                <span className="text-xs font-mono font-bold text-[#2D6A4F]">
                  +{scoreDelta}% after roadmap
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-[#E8E8E1] rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#2D6A4F] rounded-full transition-all duration-700"
                style={{ width: `${currentScore}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-[#717A75] mt-4 pt-4 border-t border-[#E8E8E1]">
            Based on verified skills, NPTEL course completion, project proof, and target role compatibility.
          </p>
        </Card>

        <Card className="lg:col-span-2 p-6 bg-white border border-[#E5E6DF] rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <h3 className="font-bold text-base text-[#18201D]">Employability Signal Breakdown</h3>
            <span className="text-xs font-mono text-[#2D6A4F] font-bold">
              Target Bar: {targetScore}% (Job Ready)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E5E6DF] space-y-1">
              <span className="text-[#717A75] font-mono uppercase text-[11px] block">Technical Skills</span>
              <div className="text-xl font-bold font-mono text-[#18201D]">
                {roadmapData?.employability_score?.breakdown?.technical_skills || 78}%
              </div>
              <span className="text-[10px] text-[#2D6A4F] font-medium">Verified by code</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E5E6DF] space-y-1">
              <span className="text-[#717A75] font-mono uppercase text-[11px] block">Project Proof</span>
              <div className="text-xl font-bold font-mono text-[#18201D]">
                {roadmapData?.employability_score?.breakdown?.project_proof || 72}%
              </div>
              <span className="text-[10px] text-[#2D6A4F] font-medium">GitHub repositories</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E5E6DF] space-y-1">
              <span className="text-[#717A75] font-mono uppercase text-[11px] block">Academic Alignment</span>
              <div className="text-xl font-bold font-mono text-[#18201D]">
                {roadmapData?.employability_score?.breakdown?.academic_alignment || 85}%
              </div>
              <span className="text-[10px] text-[#2D6A4F] font-medium">NEP 2020 credits</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E5E6DF] space-y-1">
              <span className="text-[#717A75] font-mono uppercase text-[11px] block">Resume ATS</span>
              <div className="text-xl font-bold font-mono text-[#18201D]">
                {roadmapData?.employability_score?.breakdown?.resume_ats || 78}%
              </div>
              <span className="text-[10px] text-[#2D6A4F] font-medium">Single-column parse</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#EBF3EE] border border-[#2D6A4F]/30 text-xs text-[#18201D] flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A347]" />
              Completing the 2 prescribed SWAYAM modules bridges your delta from {currentScore}% to {targetScore}%.
            </span>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs text-[#2D6A4F] font-bold hover:underline cursor-pointer ml-2 shrink-0"
            >
              Open SWAYAM Path →
            </button>
          </div>
        </Card>
      </div>

      {/* Roadmap Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F0F1EA] border border-[#E5E6DF] rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Roadmap Overview</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('careers')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'careers'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Careers ({roadmapData?.careers?.length || 3})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'gaps'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#D4A347]" />
          <span>Skill Gaps ({roadmapData?.gaps?.gaps?.length || 4})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Learning Path ({roadmapData?.courses?.length || 3})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('opportunities')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'opportunities'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Opportunities ({roadmapData?.opportunities?.length || 2})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('govt')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'govt'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Govt Schemes ({roadmapData?.govt_schemes?.length || 5})</span>
        </button>
      </div>

      {/* Tab 1: Overview Phase Stepper */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border border-[#E5E6DF] rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-[#18201D]">Execution Lifecycle</h3>
            <p className="text-xs text-[#717A75] leading-relaxed">
              Your customized sequence combining NPTEL SWAYAM academic certifications, verifiable portfolio deliverables, MP state youth stipends, and targeted job applications.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-[#2D6A4F]/30 bg-[#EBF3EE] space-y-2">
                <span className="font-mono text-[#2D6A4F] text-xs font-bold block uppercase">Phase 1 • Learn</span>
                <h4 className="font-bold text-sm text-[#18201D]">NPTEL / SWAYAM</h4>
                <p className="text-xs text-[#717A75]">Complete 2 AICTE credit modules in Data Structures &amp; Relational Indexing.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white space-y-2">
                <span className="font-mono text-[#2D6A4F] text-xs font-bold block uppercase">Phase 2 • Build</span>
                <h4 className="font-bold text-sm text-[#18201D]">FastAPI Artifact</h4>
                <p className="text-xs text-[#717A75]">Build Student Expense API with JWT authentication and automated Pytest tests.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white space-y-2">
                <span className="font-mono text-[#2D6A4F] text-xs font-bold block uppercase">Phase 3 • Prove</span>
                <h4 className="font-bold text-sm text-[#18201D]">ATS 85+ &amp; Mock AI</h4>
                <p className="text-xs text-[#717A75]">Re-write project bullets with quantified metrics and clear technical screen.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white space-y-2">
                <span className="font-mono text-[#2D6A4F] text-xs font-bold block uppercase">Phase 4 • Apply</span>
                <h4 className="font-bold text-sm text-[#18201D]">MMSKY &amp; Jobs</h4>
                <p className="text-xs text-[#717A75]">Dispatch 5 verified applications &amp; claim state ₹10,000/mo DBT allowance.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Careers */}
      {activeTab === 'careers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(roadmapData?.careers || []).map((c: any) => (
            <CareerCard
              key={c.id}
              career={{
                id: c.id,
                slug: c.slug,
                title: c.title,
                category: c.category,
                shortDescription: c.short_description,
                fullDescription: c.full_description,
                matchScore: c.match_score,
                marketDemand: c.market_demand,
                avgSalary: c.avg_salary,
                openingsEstimate: c.openings_estimate,
                isTarget: c.is_target,
                growthRate: c.growth_rate,
                topHiringCompanies: c.top_hiring_companies,
                requiredSkills: (c.required_skills || []).map((sk: any) => ({
                  skillId: sk.name.toLowerCase(),
                  name: sk.name,
                  level: sk.level,
                  userMatches: sk.user_matches,
                })),
                whyMatchRationale: c.why_match_rationale,
              }}
            />
          ))}
        </div>
      )}

      {/* Tab 3: Skill Gaps */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <Card className="p-6 bg-white border border-[#E5E6DF] space-y-4">
            <h3 className="text-lg font-bold text-[#18201D]">
              Diagnostic Skill Gaps for {targetCareer.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(roadmapData?.gaps?.gaps || []).map((gap: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-[#E5E6DF] bg-[#F8F8F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#18201D]">{gap.skill_name}</span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      gap.status === 'Mastered'
                        ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/30'
                        : 'bg-[#FDF8ED] text-[#B27B18] border-[#D4A347]/30'
                    }`}>
                      {gap.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#717A75] font-mono flex justify-between">
                    <span>Current: {gap.current_score}% / Target: {gap.required_score}%</span>
                    <span className="text-[#B45309] font-bold">{gap.gap_score}% Delta</span>
                  </div>
                  <p className="text-xs text-[#18201D] pt-1">{gap.recommended_action}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Courses */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(roadmapData?.courses || []).map((course: any) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                slug: course.id,
                title: course.title,
                provider: course.provider,
                level: course.level,
                duration: course.duration,
                description: course.description,
                skillsTaught: course.skills_covered || [],
                modulesCount: 4,
                enrolled: false,
                progressPercent: 0,
                rating: course.rating,
                reviewCount: course.review_count,
                badgeName: 'Verified SWAYAM Credential',
                url: course.url,
                isFree: course.is_free,
                nepCredits: course.nep_credits,
                modules: [],
              }}
            />
          ))}
        </div>
      )}

      {/* Tab 5: Opportunities */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          {(roadmapData?.opportunities || []).map((opp: any) => (
            <ApplyPanel
              key={opp.id}
              opportunity={{
                id: opp.id,
                slug: opp.id,
                title: opp.title,
                company: opp.company,
                location: opp.location,
                type: opp.type,
                workplaceType: opp.workplace_type,
                salaryRange: opp.stipend_range,
                matchScore: opp.match_score,
                readinessLabel: opp.readiness_label,
                deadline: opp.deadline,
                postedDate: opp.posted_date,
                description: opp.description,
                applyUrl: opp.apply_url,
                requirements: opp.requirements || [],
                matchedSkills: opp.matched_skills || [],
                missingSkills: opp.missing_skills || [],
                whyMatchDetails: opp.why_match_details || {
                  overallFit: opp.match_score,
                  skillOverlapScore: 85,
                  experienceScore: 80,
                  educationScore: 90,
                  summary: 'Candidate demonstrates strong alignment.',
                  advantages: [],
                  riskFactors: [],
                },
              }}
            />
          ))}
        </div>
      )}

      {/* Tab 6: Govt Schemes */}
      {activeTab === 'govt' && (
        <div className="space-y-4">
          <Card className="p-6 bg-white border border-[#E5E6DF] space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#18201D]">
                Madhya Pradesh &amp; Central Government Schemes
              </h3>
              <p className="text-xs text-[#717A75] mt-1">
                Official schemes providing direct financial stipend allowances (DBT) and statutory apprenticeship certifications.
              </p>
            </div>

            <div className="space-y-4">
              {(roadmapData?.govt_schemes || []).map((sch: any) => (
                <div
                  key={sch.id}
                  className="p-5 rounded-xl border border-[#E5E6DF] bg-[#F8F8F5] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-[#2D6A4F] font-bold uppercase block">
                        {sch.category}
                      </span>
                      <h4 className="text-base font-bold text-[#18201D] mt-0.5">{sch.name}</h4>
                      <p className="text-xs text-[#717A75]">{sch.ministry_or_dept}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#2D6A4F] bg-[#EBF3EE] px-3 py-1 rounded-md border border-[#2D6A4F]/30 shrink-0">
                      {sch.monthly_stipend_inr}
                    </span>
                  </div>

                  <p className="text-xs text-[#18201D] leading-relaxed">{sch.description}</p>

                  <div className="p-3 rounded-lg bg-white border border-[#E5E6DF] space-y-1 text-xs">
                    <span className="font-mono text-[#717A75] uppercase text-[11px] font-semibold block">
                      Candidate Eligibility Diagnostic:
                    </span>
                    <ul className="space-y-1 list-disc list-inside text-[#18201D]">
                      {(sch.reasons || []).map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E1] text-xs">
                    <span className="text-[#717A75] font-mono">Last verified: {sch.last_verified}</span>
                    <a
                      href={sch.portal_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D6A4F] text-white font-semibold hover:bg-[#24553F] transition-colors"
                    >
                      <span>Visit {sch.portal_name}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
