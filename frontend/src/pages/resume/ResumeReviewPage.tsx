import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { routes } from '../../lib/routes';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const ResumeReviewPage: React.FC = () => {
  const { user, targetCareer } = useApp();
  const atsScore = user.resumeAtsScore || 78;
  const parseabilityScore = 94;
  const quantificationScore = Math.min(95, Math.max(68, Math.round(atsScore * 0.9)));
  const keywordDensityScore = Math.min(98, Math.max(72, Math.round(atsScore * 0.96)));

  const primaryProject = user.projects?.[0] || {
    title: 'Distributed REST Web Service',
    techStack: ['Python', 'FastAPI', 'SQL'],
    bullets: [
      'Built a backend API in Python and deployed with Docker.',
      'Helped connect PostgreSQL database and wrote endpoints.',
    ],
  };

  const bulletImprovements = [
    {
      original: primaryProject.bullets?.[0] || 'Worked on backend APIs in Python and helped deploy with Docker.',
      improved: `Architected async ${primaryProject.techStack?.[0] || 'FastAPI'} microservices handling 2,500+ req/min with token-bucket rate limiting and zero-downtime containerized deployments.`,
      reason: 'Replaces generic task description with quantifiable throughput numbers and production architecture components.',
    },
    {
      original: primaryProject.bullets?.[1] || 'Created database models and queries for student features.',
      improved: `Optimized SQL query execution latency by 38% through multi-column B-tree indexing and connection pooling across 50,000+ records.`,
      reason: 'Demonstrates verifiable performance benchmarks and measurable optimization scale.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="AI Profile Ingestion Completed"
        title="Resume Diagnostic &amp; ATS Calibration"
        description={`Parsed from ${user.resumeFileName || `${user.fullName.replace(/\s+/g, '_')}_Resume.pdf`}. Calibrated for ${user.fullName} benchmarked against ${targetCareer.title}.`}
        actions={
          <div className="flex items-center gap-3">
            <Link to={routes.careerPaths}>
              <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                Continue to Career Paths
              </Button>
            </Link>
          </div>
        }
      />

      {/* Candidate Profile Summary Strip */}
      <div className="p-4 rounded-xl border border-[#2D6A4F]/30 bg-[#EBF3EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-sm text-[#18201D]">{user.fullName}</div>
            <div className="text-[#717A75]">{user.university} • {user.degree} ({user.major})</div>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-[#18201D]">
          <span>CGPA: <strong className="text-[#2D6A4F]">{user.cgpa || '8.4'}</strong></span>
          <span>Grad: <strong>{user.gradYear}</strong></span>
          <span>Target: <strong className="text-[#2D6A4F]">{targetCareer.title}</strong></span>
        </div>
      </div>

      {/* Top ATS Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 border border-[#2D6A4F]/40 bg-[#EBF3EE] text-center shadow-xs">
          <span className="text-xs font-mono uppercase text-[#2D6A4F] font-bold">
            Overall ATS Readiness
          </span>
          <div className="text-4xl font-extrabold font-mono text-[#18201D]">
            {atsScore} / 100
          </div>
          <span className="text-xs text-[#2D6A4F] font-semibold">
            {atsScore >= 90 ? 'Top 5% of Applicants' : atsScore >= 80 ? 'Top 15% of Applicants' : 'Actionable Improvements Needed'}
          </span>
        </Card>
        <Card className="p-5 space-y-2 bg-white border border-[#E5E6DF] shadow-xs">
          <span className="text-xs font-mono uppercase text-[#717A75] font-semibold">Machine Parseability</span>
          <div className="text-2xl font-bold font-mono text-[#18201D]">{parseabilityScore}%</div>
          <ProgressBar value={parseabilityScore} color="growth" showPercent={false} />
          <span className="text-[11px] text-[#717A75]">Clean single-column schema detected</span>
        </Card>
        <Card className="p-5 space-y-2 bg-white border border-[#E5E6DF] shadow-xs">
          <span className="text-xs font-mono uppercase text-[#717A75] font-semibold">Metric Quantification</span>
          <div className="text-2xl font-bold font-mono text-[#18201D]">{quantificationScore}%</div>
          <ProgressBar value={quantificationScore} color="amber" showPercent={false} />
          <span className="text-[11px] text-[#B45309] font-medium">Add latency &amp; throughput numbers</span>
        </Card>
        <Card className="p-5 space-y-2 bg-white border border-[#E5E6DF] shadow-xs">
          <span className="text-xs font-mono uppercase text-[#717A75] font-semibold">Target Keyword Density</span>
          <div className="text-2xl font-bold font-mono text-[#18201D]">{keywordDensityScore}%</div>
          <ProgressBar value={keywordDensityScore} color="growth" showPercent={false} />
          <span className="text-[11px] text-[#717A75]">Matches {user.skills.length} core engineering competencies</span>
        </Card>
      </div>

      {/* Extracted Verified Competencies */}
      <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#18201D]">
            Extracted Technical Competencies ({user.skills.length} Skills Identified)
          </h3>
          <span className="text-xs text-[#717A75] font-mono">
            {user.skills.filter(s => s.verified).length} Verified by System
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.skills.map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#EBF3EE] border border-[#2D6A4F]/30 text-[#2D6A4F]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{s.name}</span>
              <span className="text-[10px] font-mono text-[#717A75]">({s.level})</span>
            </span>
          ))}
        </div>
      </Card>

      {/* Actionable Bullet Optimization */}
      <Card className="p-6 space-y-6 bg-white border border-[#E5E6DF] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
          <div>
            <h3 className="text-base font-bold text-[#18201D]">
              AI Action Metric Rewrite Suggestions
            </h3>
            <p className="text-xs text-[#717A75]">
              Calibrated for {user.fullName}&apos;s project &quot;{primaryProject.title}&quot;.
            </p>
          </div>
          <Link to={routes.resumeWorkspace} className="text-xs text-[#2D6A4F] hover:underline font-bold">
            Open Interactive Workspace →
          </Link>
        </div>
        <div className="space-y-4">
          {bulletImprovements.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-[#E5E6DF] bg-[#F8F8F5] space-y-3 text-xs"
            >
              <div className="space-y-1">
                <span className="font-mono text-rose-700 uppercase font-semibold">Before (Generic):</span>
                <p className="text-[#717A75] bg-white p-2.5 rounded-lg border border-[#E5E6DF]">
                  {item.original}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[#2D6A4F] uppercase font-bold">
                  After (Quantified Metric):
                </span>
                <p className="text-[#18201D] bg-[#EBF3EE] p-2.5 rounded-lg border border-[#2D6A4F]/30 font-medium">
                  {item.improved}
                </p>
              </div>
              <div className="text-[11px] text-[#717A75] italic">
                Reason: {item.reason}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Student Journey Next Step */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-[#2D6A4F]/30 bg-white shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-[#18201D]">Ready to inspect your matched Career Paths?</h4>
          <p className="text-xs text-[#717A75]">
            See how your extracted profile compares against {targetCareer.title} and adjacent software roles.
          </p>
        </div>
        <Link to={routes.careerPaths}>
          <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
            Explore {targetCareer.title} ({targetCareer.matchScore}% Match)
          </Button>
        </Link>
      </div>
    </div>
  );
};
