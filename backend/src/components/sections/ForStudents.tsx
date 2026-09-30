import React from 'react';
import { Button } from '../ui/Button';
import { Check, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';

export const ForStudents: React.FC = () => {
  const { switchPersona } = useApp();

  const demoPersonas = [
    {
      key: 'divyansh',
      title: 'Final-Year B.Tech CS Candidate',
      subtitle: 'Decent projects, weak resume phrasing',
      highlight: 'Demonstrates +18% ATS score jump through quantified metric rewriting.',
      tag: 'Divyansh Joshi (RGPV Bhopal)',
    },
    {
      key: 'pooja',
      title: 'B.Com / Arts Student',
      subtitle: 'Non-tech background seeking corporate analytics career',
      highlight: 'Demonstrates career path recommender, Skill India, and PMKVY.',
      tag: 'Pooja Sharma (Indore)',
    },
    {
      key: 'rahul',
      title: 'Polytechnic Diploma Holder',
      subtitle: 'From smaller MP town (Sagar / Jabalpur)',
      highlight: 'Demonstrates MP MMSKY scheme (₹9k-10k/mo DBT) & NAPS apprenticeships.',
      tag: 'Rahul Verma (Sagar, MP)',
    },
  ];

  return (
    <section id="personas" className="py-20 px-4 sm:px-6 border-t border-[#E8E8E1] bg-[#F8F8F5]">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#2D6A4F] uppercase tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A347]" />
            <span>Pre-Loaded Demo Personas (1-Click Evaluation)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18201D] leading-tight">
            Test Real Student Journeys Instantly
          </h2>
          <p className="text-base text-[#717A75] leading-relaxed">
            Click any persona to load their complete resume, calibrated skill gaps, NPTEL course map, and eligible government schemes. No typing needed on stage!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoPersonas.map((p) => (
            <div
              key={p.key}
              className="bg-white rounded-2xl border border-[#E5E6DF] p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-[#2D6A4F]/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#2D6A4F] font-bold uppercase">{p.tag}</span>
                  <div className="w-7 h-7 rounded-full bg-[#EBF3EE] text-[#2D6A4F] flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#18201D]">{p.title}</h3>
                <p className="text-xs text-[#717A75] font-medium">{p.subtitle}</p>
                <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E5E6DF] text-xs text-[#18201D] leading-relaxed">
                  <strong className="text-[#2D6A4F] block mb-1">Judging Lens Value:</strong>
                  {p.highlight}
                </div>
              </div>

              <Link to={routes.dashboard}>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => switchPersona(p.key)}
                  iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Load {p.key === 'divyansh' ? 'Divyansh' : p.key === 'pooja' ? 'Pooja' : 'Rahul'} Profile
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
