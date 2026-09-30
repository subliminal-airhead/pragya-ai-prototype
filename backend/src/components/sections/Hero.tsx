import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-20 pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Background warm glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#2D6A4F]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2D6A4F]/25 bg-[#EBF3EE] text-xs font-mono text-[#2D6A4F] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A347]" />
          <span>AI-Powered Career Readiness &amp; Employability Platform</span>
          <span className="text-[#D0D2C7]">•</span>
          <span className="text-[#717A75]">Hackathon Challenge 1</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#18201D] leading-[1.1]">
          Bridge the Gap from Campus to{' '}
          <span className="text-[#2D6A4F] underline decoration-[#D4A347]/50 decoration-wavy decoration-2">
            Top-Tier Corporate
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#717A75] max-w-3xl mx-auto leading-relaxed">
          Upload your resume, get a personalized, India-specific roadmap from your current profile to a job-ready one — with real NPTEL courses, verified internships, and MP/National government schemes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to={routes.signup}>
            <Button
              variant="primary"
              size="lg"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Start Free Career Diagnostic
            </Button>
          </Link>
          <Link to={routes.dashboard}>
            <Button variant="secondary" size="lg" icon={<Compass className="w-4 h-4" />}>
              Explore Live Demo
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-12 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white space-y-1 shadow-2xs">
            <div className="text-xs font-mono text-[#2D6A4F] uppercase font-bold">01 / Diagnostic</div>
            <div className="text-sm font-bold text-[#18201D]">Skill Gap Benchmarking</div>
            <div className="text-xs text-[#717A75]">Extracts gaps against 3,200+ industry job descriptions.</div>
          </div>
          <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white space-y-1 shadow-2xs">
            <div className="text-xs font-mono text-[#D4A347] uppercase font-bold">02 / Learn &amp; Build</div>
            <div className="text-sm font-bold text-[#18201D]">NPTEL &amp; SWAYAM Labs</div>
            <div className="text-xs text-[#717A75]">NEP 2020 credit-mapped courses and GitHub starter repos.</div>
          </div>
          <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white space-y-1 shadow-2xs">
            <div className="text-xs font-mono text-[#2D6A4F] uppercase font-bold">03 / Govt Schemes</div>
            <div className="text-sm font-bold text-[#18201D]">MMSKY &amp; NAPS Match</div>
            <div className="text-xs text-[#717A75]">Stipend up to ₹10,000/mo DBT verified on official portals.</div>
          </div>
          <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white space-y-1 shadow-2xs">
            <div className="text-xs font-mono text-[#717A75] uppercase font-bold">04 / Apply &amp; Prove</div>
            <div className="text-sm font-bold text-[#18201D]">ATS Resume &amp; Mock AI</div>
            <div className="text-xs text-[#717A75]">Quantified metric rewriting and AI interview screen.</div>
          </div>
        </div>
      </div>
    </section>
  );
};
