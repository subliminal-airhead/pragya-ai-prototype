import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TrendingUp, IndianRupee } from 'lucide-react';

export const MarketInsightsPage: React.FC = () => {
  const topInDemandSkills = [
    { skill: 'Production LLMs & Evaluation', demand: 98, growth: '+140% YoY' },
    { skill: 'Distributed Systems & Microservices', demand: 94, growth: '+35% YoY' },
    { skill: 'FastAPI & Async Python Backends', demand: 92, growth: '+28% YoY' },
    { skill: 'React & Modern Full-Stack Web', demand: 91, growth: '+24% YoY' },
    { skill: 'SQL & Database Indexing Profiling', demand: 89, growth: '+18% YoY' },
  ];

  const salaryBenchmarks = [
    { role: 'AI Systems Engineer', range: '₹9,50,000 - ₹18,00,000', median: '₹13,50,000' },
    { role: 'Software Development Engineer', range: '₹7,50,000 - ₹14,00,000', median: '₹10,50,000' },
    { role: 'Full-Stack Web Developer', range: '₹6,00,000 - ₹12,00,000', median: '₹8,50,000' },
    { role: 'Cloud Infrastructure / DevOps', range: '₹7,00,000 - ₹15,00,000', median: '₹10,00,000' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Market Intelligence"
        title="Engineering Market Insights &amp; Demand Trends"
        description="Real-time hiring signals synthesized from verified engineering postings across premier technology hubs."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top In-Demand Skills */}
        <Card className="p-6 space-y-6 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
              <h3 className="font-bold text-[#18201D] text-base">Fastest Growing Competencies</h3>
            </div>
            <span className="text-xs font-mono text-[#717A75] font-medium">2026 Index</span>
          </div>

          <div className="space-y-4">
            {topInDemandSkills.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#18201D]">{item.skill}</span>
                  <span className="font-mono text-[#2D6A4F] font-bold">{item.growth}</span>
                </div>
                <ProgressBar value={item.demand} color="growth" showPercent={false} />
              </div>
            ))}
          </div>
        </Card>

        {/* Salary Benchmarks */}
        <Card className="p-6 space-y-6 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#D4A347]" />
              <h3 className="font-bold text-[#18201D] text-base">Compensation Benchmarks (India)</h3>
            </div>
            <span className="text-xs font-mono text-[#717A75] font-medium">Early Career / 1st-2nd Year</span>
          </div>

          <div className="space-y-4">
            {salaryBenchmarks.map((bench, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[#E5E6DF] bg-[#F8F8F5] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#18201D] text-sm">{bench.role}</div>
                  <div className="text-[#717A75] mt-0.5 font-mono">{bench.range}</div>
                </div>
                <div className="text-right">
                  <span className="text-[#717A75] block font-mono">Median CTC</span>
                  <span className="font-mono font-bold text-[#2D6A4F] text-sm">{bench.median}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
