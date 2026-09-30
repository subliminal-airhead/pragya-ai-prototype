import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { routes } from '../../lib/routes';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  Sparkles,
  Flag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const alignments = [
    {
      title: 'National Education Policy (NEP 2020)',
      icon: GraduationCap,
      color: 'text-[#2D6A4F]',
      badge: 'Academic Credit Transfer',
      oneLiner: 'Skill-linked, personalized pathways mapped directly to NPTEL & SWAYAM academic credits.',
      details: [
        'Multi-disciplinary credit transfer: Each recommended SWAYAM course links directly to AICTE / UGC approved credit units.',
        'Outcome-based learning: Emphasizes tangible competency demonstration rather than rote memorization.',
        'Continuous diagnostic evaluation replacing high-stakes single-point assessments.',
      ],
    },
    {
      title: 'Skill India Mission',
      icon: Award,
      color: 'text-[#D4A347]',
      badge: 'NSQF Alignment',
      oneLiner: 'Courses and apprenticeships drawn from Skill India Digital Hub, PMKVY 4.0, and NAPS.',
      details: [
        'National Apprenticeship Promotion Scheme (NAPS) co-funding matching for young engineers.',
        'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0) zero-tuition Industry 4.0 technical tracks.',
        'Direct certification verification verified on Skill India Digital passbooks.',
      ],
    },
    {
      title: 'Digital India Mission',
      icon: Sparkles,
      color: 'text-[#2D6A4F]',
      badge: 'Scalable AI Counselling',
      oneLiner: 'AI-powered personalized career counseling at a scale colleges and universities cannot staff.',
      details: [
        'Immediate ATS resume calibration and actionable quantitative rewriting recommendations.',
        'Interactive AI mock technical screening that evaluates latency constraints, problem-solving, and systems depth.',
        'Digital Public Infrastructure integration (e-Governance, DigiLocker, and MeitY internships).',
      ],
    },
    {
      title: 'Viksit Bharat 2047 & State Growth',
      icon: Flag,
      color: 'text-[#B45309]',
      badge: 'Closing the Employability Gap',
      oneLiner: 'Closing the "degree vs employable" gap with localized Madhya Pradesh opportunities and DBT schemes.',
      details: [
        'Integration with MP Mukhyamantri Seekho-Kamao Yojana (MMSKY) delivering up to ₹10,000/month Direct Benefit Transfer.',
        'Grounded retrieval over curated datasets so the LLM never hallucinates fake jobs or dead links.',
        'Empowering tier-2 and tier-3 college youth across Bhopal, Indore, Sagar, and Jabalpur.',
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto">
      <PageHeader
        phaseKicker="National Policy &amp; Mission Alignment"
        title="National Vision &amp; Policy Alignment"
        description="How Campus to Corporate bridges the university-to-industry transition in direct alignment with India's flagship educational and skill development mandates."
        actions={
          <Link to={routes.dashboard}>
            <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
              Open Candidate Dashboard
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alignments.map((a, idx) => {
          const Icon = a.icon;
          return (
            <Card key={idx} className="p-6 bg-white border border-[#E5E6DF] rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F]">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#F0F1EA] text-[#18201D] font-bold border border-[#E5E6DF]">
                  {a.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#18201D]">{a.title}</h3>
                <p className="text-xs font-semibold text-[#2D6A4F] mt-1">{a.oneLiner}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E8E8E1] text-xs">
                {a.details.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-[#717A75]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{d}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Judging Lens Summary Card */}
      <Card className="p-6 border border-[#2D6A4F]/40 bg-[#EBF3EE] rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#2D6A4F] font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Judging Criterion Benchmark • Challenge 1</span>
        </div>
        <h3 className="text-xl font-bold text-[#18201D]">
          &quot;Does this make a student more employable?&quot;
        </h3>
        <p className="text-xs text-[#18201D] leading-relaxed">
          Every screen, diagnostic metric, and recommendation directly elevates employability. Rather than generating generic LLM advice, our backend reasons deterministically over verified MP &amp; Indian datasets. A candidate goes from an uncalibrated resume to verified code proof, academic credits, state DBT stipend support, and interview confidence.
        </p>
      </Card>
    </div>
  );
};
