import React from 'react';
import { Logo } from './Logo';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';

export const MarketingFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#E8E8E1] bg-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="space-y-3 max-w-sm">
          <Logo linkToApp={false} />
          <p className="text-sm text-[#717A75] leading-relaxed">
            AI-Powered Career Readiness &amp; Employability Platform for Indian students.
            Turn diagnostics into real courses, verified proof, government schemes, and job offers.
          </p>
          <div className="text-xs text-[#2D6A4F] font-mono font-semibold">
            Resume in → Profile → Career matches → Skill gaps → Learning path → Govt schemes → Improved resume → Mock interview
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#18201D] font-semibold">
              Product Flow
            </div>
            <ul className="space-y-1.5 text-[#717A75]">
              <li>
                <Link to={routes.careerPaths} className="hover:text-[#2D6A4F]">
                  Career Paths
                </Link>
              </li>
              <li>
                <Link to={routes.skillGap} className="hover:text-[#2D6A4F]">
                  Skill Gap Diagnostic
                </Link>
              </li>
              <li>
                <Link to={routes.roadmap} className="hover:text-[#2D6A4F]">
                  Streamed Roadmap
                </Link>
              </li>
              <li>
                <Link to={routes.learning} className="hover:text-[#2D6A4F]">
                  SWAYAM &amp; NPTEL Labs
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#18201D] font-semibold">
              Employability
            </div>
            <ul className="space-y-1.5 text-[#717A75]">
              <li>
                <Link to={routes.govtSchemes} className="hover:text-[#2D6A4F]">
                  MP MMSKY &amp; NAPS Schemes
                </Link>
              </li>
              <li>
                <Link to={routes.resumeWorkspace} className="hover:text-[#2D6A4F]">
                  ATS Resume Review
                </Link>
              </li>
              <li>
                <Link to={routes.opportunities} className="hover:text-[#2D6A4F]">
                  Opportunity Match Engine
                </Link>
              </li>
              <li>
                <Link to={routes.interview} className="hover:text-[#2D6A4F]">
                  AI Mock Interview
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#18201D] font-semibold">
              National Alignment
            </div>
            <ul className="space-y-1.5 text-[#717A75]">
              <li>
                <Link to={routes.about} className="hover:text-[#2D6A4F]">
                  NEP 2020 &amp; Skill India
                </Link>
              </li>
              <li>
                <Link to={routes.login} className="hover:text-[#2D6A4F]">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to={routes.signup} className="hover:text-[#2D6A4F]">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#E8E8E1] flex flex-col sm:flex-row items-center justify-between text-xs text-[#717A75] gap-4">
        <span>© {new Date().getFullYear()} Campus to Corporate: AI Career Readiness Platform.</span>
        <span>Built for Indian engineering, polytechnic &amp; college students.</span>
      </div>
    </footer>
  );
};
