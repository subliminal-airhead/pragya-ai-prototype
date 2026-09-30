import React from 'react';
import { Card } from '../ui/Card';
import { ArrowRight, BookOpen, Hammer, Award, Send, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      phase: 'Phase 1: Learn',
      icon: BookOpen,
      title: 'Targeted NPTEL & SWAYAM Courses',
      description:
        'Instead of generic tutorials, the platform prescribes verified SWAYAM/NPTEL and Skill India courses that carry academic credit recognition under NEP 2020.',
      cta: 'Explore Curriculum',
      href: routes.learning,
    },
    {
      phase: 'Phase 2: Build',
      icon: Hammer,
      title: 'Engineer Verifiable Portfolio Artifacts',
      description:
        'Recruiters ignore copy-pasted todo apps. Construct real production FastAPI microservices, database schemas, and automated test suites with GitHub starters.',
      cta: 'View Proof Projects',
      href: routes.projects,
    },
    {
      phase: 'Phase 3: Prove',
      icon: Award,
      title: 'ATS Resume Review & Mock Screen',
      description:
        'Calibrate your resume with quantified metrics and practice AI-guided mock interviews with rubric feedback on latency and systems depth.',
      cta: 'Run ATS Review',
      href: routes.resumeWorkspace,
    },
    {
      phase: 'Phase 4: Apply',
      icon: Send,
      title: 'Matched Opportunities & Govt Schemes',
      description:
        'Apply with confidence. View detailed match explainability, verify eligibility prerequisites, and claim state schemes like MP MMSKY (₹10,000/mo DBT).',
      cta: 'Browse Matches',
      href: routes.opportunities,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 border-t border-[#E8E8E1] bg-white">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-wider text-[#2D6A4F] font-bold">
            System Architecture &amp; Core Flow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18201D]">
            Resume In → Job Ready Out
          </h2>
          <p className="text-sm sm:text-base text-[#717A75]">
            Grounded reasoning over curated India &amp; Madhya Pradesh datasets. The LLM never invents courses, schemes, or jobs — every recommendation is a real, clickable entry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Card key={idx} hoverEffect className="flex flex-col justify-between p-6 bg-[#F8F8F5] border border-[#E5E6DF] shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#2D6A4F]">
                      {s.phase}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#18201D]">{s.title}</h3>
                  <p className="text-xs text-[#717A75] leading-relaxed">{s.description}</p>
                </div>
                <div className="pt-6 mt-4 border-t border-[#E8E8E1]">
                  <Link
                    to={s.href}
                    className="inline-flex items-center gap-1.5 text-xs text-[#2D6A4F] hover:text-[#24553F] font-bold"
                  >
                    <span>{s.cta}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
