import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Lightbulb,
  ShieldAlert,
  Code2,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface PrepTip {
  id: string;
  category: 'architecture' | 'gap_defense' | 'star_story' | 'career_goals' | 'questions_to_ask';
  categoryLabel: string;
  title: string;
  impactLabel: string;
  summary: string;
  interviewerIntent: string;
  sampleScript: string;
  pitfallsToAvoid: string;
  icon: typeof Lightbulb;
}

export const InterviewPrepTips: React.FC = () => {
  const { user, targetCareer, skillGaps, showToast } = useApp();
  const [activeCategory, setActiveCategory] = useState<'all' | 'architecture' | 'gap_defense' | 'star_story' | 'career_goals' | 'questions_to_ask'>('all');
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
  const [preparedTipIds, setPreparedTipIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSeed, setRefreshSeed] = useState(0);

  const primaryGap = skillGaps.find((g) => g.status === 'Action Needed') || skillGaps[0];
  const primaryGapName = primaryGap?.skill?.name || 'Data Structures & Algorithms';
  const primaryProject = user.projects?.[0] || {
    title: 'Distributed REST Web Service',
    techStack: ['Python', 'FastAPI', 'PostgreSQL'],
  };
  const targetTimeline = user.targetTimeline || 'Summer 2027';

  const tips: PrepTip[] = useMemo(() => {
    const roleTitle = targetCareer.title;
    const isFullStack = roleTitle.toLowerCase().includes('full-stack') || roleTitle.toLowerCase().includes('web');
    const isSystems = roleTitle.toLowerCase().includes('systems') || roleTitle.toLowerCase().includes('sde') || roleTitle.toLowerCase().includes('software');

    return [
      {
        id: `tip_goals_${refreshSeed}`,
        category: 'career_goals',
        categoryLabel: 'Career Goals & Ambition Vector',
        title: `Articulating Your ${targetTimeline} Goal for ${roleTitle}`,
        impactLabel: 'High Behavioral Weight (Evaluates Intent & Longevity)',
        summary: `Hiring committees probe whether you chose ${roleTitle} intentionally or are simply mass-applying. Frame your preparation around your target timeline (${targetTimeline}), your foundation in ${user.major || 'Computer Science'} at ${user.university || 'university'}, and how this specific role bridges your path to becoming an autonomous engineer.`,
        interviewerIntent: `Interviewers want to determine if you have clear career trajectory goals, realistic growth expectations, and genuine interest in the company's technical stack.`,
        sampleScript: `"My immediate career goal is to step into a high-ownership ${roleTitle} role by ${targetTimeline}, where I can take production features from specification to deployment. At ${user.university || 'college'}, I focused on building verified project proof rather than just theoretical coursework. Over the next two years, my aim is to master sub-system observability and distributed system patterns on your team."`,
        pitfallsToAvoid: `Never give vague answers like "I just want any engineering role" or focus solely on compensation/perks. Avoid sounding like you will leave for a master's program within 6 months.`,
        icon: Lightbulb,
      },
      {
        id: `tip_arch_${refreshSeed}`,
        category: 'architecture',
        categoryLabel: 'Core Architecture Strategy',
        title: isSystems
          ? `High-Throughput State & Caching Invariants for ${roleTitle}`
          : isFullStack
          ? `Component Hydration & State Normalization Strategy`
          : `Scalable Modular Architecture & Concurrency Tradeoffs`,
        impactLabel: 'Technical Architecture Benchmark',
        summary: isSystems
          ? `Interviewers for ${roleTitle} will probe how you handle partition splits, cache stampedes (Redlock/Mutex), and sub-15ms latency constraints. Anchor your explanations with in-memory caching and connection pooling.`
          : isFullStack
          ? `When discussing frontend architectures, demonstrate deep knowledge of server-side data fetching waterfalls vs client component re-renders. Address bundle optimization and sub-50ms interaction latency.`
          : `Lead with architectural constraints and data flow diagrams before writing any code. Clarify read-to-write ratios and storage sizing early.`,
        interviewerIntent: `The hiring manager wants to verify you don't just write functional code, but understand how systems behave under real load and failure modes.`,
        sampleScript: `"Before choosing between an SQL store and a distributed cache, I evaluate the read-to-write ratio. If we're facing an 80/20 read-heavy workload with sub-20ms SLAs, I'd introduce an in-memory Redis cluster with consistent hashing to prevent cache stampedes."`,
        pitfallsToAvoid: `Don't jump straight into drawing boxes or coding without asking clarifying questions about throughput (QPS), payload size, and availability requirements.`,
        icon: Code2,
      },
      {
        id: `tip_gap_${refreshSeed}`,
        category: 'gap_defense',
        categoryLabel: 'Skill-Gap Defense Mechanism',
        title: `Proactively Defending Your ${primaryGapName} Proficiency`,
        impactLabel: `Critical Defense (Bridges Your ${primaryGap?.gapScore || 25}% Diagnostic Delta)`,
        summary: `Your diagnostic evaluation detected ${primaryGapName} as an active benchmark to strengthen for ${roleTitle}. When interviewers touch on this domain, use proactive framing by explaining the underlying first principles and production best practices.`,
        interviewerIntent: `The interviewer wants to test whether you know your limitations, how quickly you ramp up on missing technologies, and if you understand foundational concepts.`,
        sampleScript: `"While I have focused primarily on ${user.skills[0]?.name || 'Python'} in my recent work, I apply core first principles to ${primaryGapName} such as strict schema typing, defensive input validation, and automated unit test suites."`,
        pitfallsToAvoid: `Never pretend to be an expert in an area where you have beginner knowledge. State what you know with high precision, and outline how you verify solutions using testing harnesses.`,
        icon: ShieldAlert,
      },
      {
        id: `tip_star_${refreshSeed}`,
        category: 'star_story',
        categoryLabel: 'Project STAR Narrative',
        title: `Framing "${primaryProject.title}" with Quantified Metrics`,
        impactLabel: 'Resume Validation & Proven Artifact Proof',
        summary: `Turn your repository deliverables into a compelling 90-second behavioral response. Frame ${primaryProject.title} around a concrete engineering bottleneck, your technical intervention, and the resulting performance or latency impact.`,
        interviewerIntent: `Interviewers want to distinguish candidates who actually engineered project features from those who simply cloned a tutorial repository.`,
        sampleScript: `"In my ${primaryProject.title} project, the primary challenge was handling concurrent requests without database locks. I implemented an async pipeline using ${Array.isArray(primaryProject.techStack) ? primaryProject.techStack.slice(0, 2).join(' and ') : primaryProject.techStack}, which reduced latency by over 30% and achieved zero downtime in simulated tests."`,
        pitfallsToAvoid: `Don't list features like a product spec. Focus on the trade-offs you evaluated: why you chose technology X over technology Y, and what broke during initial development.`,
        icon: MessageSquare,
      },
      {
        id: `tip_questions_${refreshSeed}`,
        category: 'questions_to_ask',
        categoryLabel: 'Reverse Interview Strategy',
        title: `High-Signal Questions to Ask the Hiring Team`,
        impactLabel: 'Demonstrates Cultural Fit & Strategic Thinking',
        summary: `At the end of technical rounds, avoid generic questions like "What does a typical day look like?". Ask targeted questions about engineering culture, deployment autonomy, and architectural decision-making.`,
        interviewerIntent: `Hiring leads evaluate candidate curiosity, technical maturity, and how thoughtfully they evaluate team culture.`,
        sampleScript: `"How does your engineering team manage technical debt when sprint delivery deadlines are tight? And what automated safeguards (like canary rollouts or feature flags) do junior engineers have when shipping code to production?"`,
        pitfallsToAvoid: `Avoid questions that could be answered by reading the company's public landing page or job description. Ask about engineering practices.`,
        icon: HelpCircle,
      },
    ];
  }, [user, targetCareer, primaryGap, primaryProject, refreshSeed, targetTimeline]);

  const filteredTips = useMemo(() => {
    if (activeCategory === 'all') return tips;
    return tips.filter((t) => t.category === activeCategory);
  }, [tips, activeCategory]);

  const togglePrepared = (id: string) => {
    setPreparedTipIds((prev) => {
      const next = !prev[id];
      const updated = { ...prev, [id]: next };
      if (next) {
        showToast('Vector marked as prepared for technical rounds!');
      }
      return updated;
    });
  };

  const copyScript = (tip: PrepTip) => {
    navigator.clipboard.writeText(tip.sampleScript);
    setCopiedId(tip.id);
    showToast('Sample response script copied to clipboard!');
    setTimeout(() => {
      setCopiedId((curr) => (curr === tip.id ? null : curr));
    }, 2500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshSeed((prev) => prev + 1);
      setIsRefreshing(false);
      showToast('AI synthesized fresh role-specific preparation vectors!');
    }, 600);
  };

  const preparedCount = Object.values(preparedTipIds).filter(Boolean).length;
  const readinessPercent = Math.round((preparedCount / tips.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="p-6 bg-white border border-[#E5E6DF] rounded-xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E8E8E1]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#2D6A4F] uppercase tracking-wider font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A347]" />
              <span>Personalized AI Preparation Vectors</span>
            </div>
            <h3 className="text-xl font-bold text-[#18201D]">
              Interview Strategy for {targetCareer.title}
            </h3>
            <p className="text-xs text-[#717A75] leading-relaxed max-w-2xl">
              Calibrated for <strong className="text-[#18201D] font-medium">{user.fullName}</strong> based on your verified skills, academic foundation at {user.university}, and active skill gap in {primaryGapName}.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
              onClick={handleRefresh}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Refresh Strategy
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[#2D6A4F]/25 bg-[#EBF3EE] space-y-1">
            <span className="text-[#2D6A4F] font-mono uppercase text-[11px] font-bold block">
              Readiness Meter
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold font-mono text-[#18201D]">
                {preparedCount} / {tips.length} Prepared
              </span>
              <span className="font-mono text-[#2D6A4F] font-bold">{readinessPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#D6E6DB] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[#2D6A4F] rounded-full transition-all duration-300"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>
          <div className="p-3 rounded-lg border border-[#E5E6DF] bg-[#F8F8F5] space-y-1">
            <span className="text-[#717A75] font-mono uppercase text-[11px] font-semibold block">
              Target Role
            </span>
            <div className="text-sm font-bold text-[#18201D] truncate">
              {targetCareer.title}
            </div>
            <div className="text-[11px] text-[#2D6A4F] font-mono font-medium">
              {user.resumeUploaded ? `${targetCareer.matchScore}% Match Score` : 'Awaiting Resume'}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-[#E5E6DF] bg-[#F8F8F5] space-y-1">
            <span className="text-[#717A75] font-mono uppercase text-[11px] font-semibold block">
              Goal Horizon
            </span>
            <div className="text-sm font-bold text-[#18201D] truncate">
              {targetTimeline}
            </div>
            <div className="text-[11px] text-[#717A75] font-mono font-medium truncate">
              {user.preferredWorkType?.join(' / ') || 'Remote / Hybrid'}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-[#E5E6DF] bg-[#F8F8F5] space-y-1">
            <span className="text-[#717A75] font-mono uppercase text-[11px] font-semibold block">
              Diagnostic Defense
            </span>
            <div className="text-sm font-bold text-[#18201D] truncate">
              {primaryGapName}
            </div>
            <div className="text-[11px] text-[#B45309] font-mono font-medium">
              {primaryGap?.gapScore ? `${primaryGap.gapScore}% Delta to Bridge` : 'Benchmark Target'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 shadow-xs'
                : 'bg-[#F0F1EA] text-[#717A75] hover:text-[#18201D] border border-transparent'
            }`}
          >
            All Insights ({tips.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('career_goals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'career_goals'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 shadow-xs'
                : 'bg-[#F0F1EA] text-[#717A75] hover:text-[#18201D] border border-transparent'
            }`}
          >
            Career Goals &amp; Role
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'architecture'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 shadow-xs'
                : 'bg-[#F0F1EA] text-[#717A75] hover:text-[#18201D] border border-transparent'
            }`}
          >
            System Architecture
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('gap_defense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'gap_defense'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 shadow-xs'
                : 'bg-[#F0F1EA] text-[#717A75] hover:text-[#18201D] border border-transparent'
            }`}
          >
            Skill-Gap Defense
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('star_story')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'star_story'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 shadow-xs'
                : 'bg-[#F0F1EA] text-[#717A75] hover:text-[#18201D] border border-transparent'
            }`}
          >
            Project STAR Story
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('questions_to_ask')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'questions_to_ask'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30 shadow-xs'
                : 'bg-[#F0F1EA] text-[#717A75] hover:text-[#18201D] border border-transparent'
            }`}
          >
            Reverse Questions
          </button>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredTips.map((tip, idx) => {
          const isExpanded = expandedTipId === tip.id;
          const isPrepared = Boolean(preparedTipIds[tip.id]);
          const Icon = tip.icon;
          return (
            <Card
              key={tip.id}
              className={`p-5 sm:p-6 transition-all rounded-xl border bg-white shadow-xs ${
                isPrepared
                  ? 'border-[#2D6A4F]/40 bg-[#FFFFFF]'
                  : 'border-[#E5E6DF] hover:border-[#D0D2C7]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                      isPrepared
                        ? 'bg-[#EBF3EE] border-[#2D6A4F]/30 text-[#2D6A4F]'
                        : 'bg-[#F0F1EA] border-[#E5E6DF] text-[#717A75]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#717A75]">
                      <span className="font-mono text-[#2D6A4F] font-semibold">
                        0{idx + 1}. {tip.categoryLabel}
                      </span>
                      <span aria-hidden="true" className="text-[#D0D2C7]">•</span>
                      <span className="font-medium text-[#717A75]">{tip.impactLabel}</span>
                    </div>
                    <h4 className="text-base font-bold text-[#18201D] leading-snug">
                      {tip.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => togglePrepared(tip.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isPrepared
                        ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40 shadow-xs'
                        : 'bg-white text-[#717A75] hover:text-[#18201D] border-[#E5E6DF] hover:border-[#D0D2C7]'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isPrepared ? 'text-[#2D6A4F]' : 'text-[#717A75]'}`} />
                    <span>{isPrepared ? 'Prepared' : 'Mark Prepared'}</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#18201D] leading-relaxed pt-3 pb-2">
                {tip.summary}
              </p>

              <div className="pt-2 border-t border-[#E8E8E1]">
                <button
                  type="button"
                  onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                  className="flex items-center gap-1 text-xs text-[#2D6A4F] hover:text-[#24553F] font-semibold py-1 transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Sample Script & Pitfalls' : 'View Sample Response Script & Interviewer Intent'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isExpanded && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-[#E8E8E1]/80 text-xs animate-in fade-in duration-150">
                    <div className="p-3 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF] space-y-1">
                      <span className="font-mono text-[#717A75] uppercase text-[11px] font-semibold block">
                        What the Interviewer is Evaluating:
                      </span>
                      <p className="text-[#18201D] leading-relaxed">
                        {tip.interviewerIntent}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#EBF3EE]/60 border border-[#2D6A4F]/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[#2D6A4F] uppercase text-[11px] font-bold">
                          Recommended Response Phrasing:
                        </span>
                        <button
                          type="button"
                          onClick={() => copyScript(tip)}
                          className="flex items-center gap-1 text-[11px] text-[#2D6A4F] hover:text-[#24553F] font-semibold cursor-pointer"
                        >
                          {copiedId === tip.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#2D6A4F]" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[#18201D] font-mono text-[11px] leading-relaxed bg-white p-3 rounded-md border border-[#2D6A4F]/20">
                        {tip.sampleScript}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FEF9EE] border border-[#D4A347]/40 space-y-1">
                      <span className="font-mono text-[#B45309] uppercase text-[11px] font-bold block">
                        Common Screening Pitfalls to Avoid:
                      </span>
                      <p className="text-[#18201D] leading-relaxed">
                        {tip.pitfallsToAvoid}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
