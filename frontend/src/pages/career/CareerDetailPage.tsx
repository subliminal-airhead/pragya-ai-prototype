import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { careerWhy, courseFor, projectsFor } from '../../lib/data';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { MatchBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { routes } from '../../lib/routes';
import {
  CheckCircle2,
  AlertTriangle,
  Target,
  ArrowLeft,
  BookOpen,
  FolderGit2,
} from 'lucide-react';

export const CareerDetailPage: React.FC = () => {
  const { career: slug } = useParams<{ career: string }>();
  const { careers, targetCareer, setTargetCareerId } = useApp();
  const career = careers.find((c) => c.slug === slug) || careers[0];
  const whyData = careerWhy(career);
  const isTarget = career.id === targetCareer.id;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Link
        to={routes.careerPaths}
        className="inline-flex items-center gap-1.5 text-xs text-[#717A75] hover:text-[#18201D] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Career Paths</span>
      </Link>

      <PageHeader
        phaseKicker="Career Fit &amp; Explainability"
        title={career.title}
        description={career.fullDescription}
        actions={
          <div className="flex items-center gap-3">
            <MatchBadge score={career.matchScore} />
            {!isTarget ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setTargetCareerId(career.id)}
                icon={<Target className="w-4 h-4" />}
              >
                Set as Target Career
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#2D6A4F] bg-[#EBF3EE] px-3 py-1.5 rounded-lg border border-[#2D6A4F]/40 font-bold">
                <Target className="w-3.5 h-3.5" /> Active Target Career
              </span>
            )}
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1 bg-white border border-[#E5E6DF] shadow-2xs">
          <span className="text-xs font-mono text-[#717A75] uppercase font-semibold">Average Market Comp</span>
          <div className="text-xl font-bold font-mono text-[#18201D]">{career.avgSalary}</div>
          <span className="text-xs text-[#717A75]">Annual compensation for 1st Year / Early Career</span>
        </Card>
        <Card className="p-4 space-y-1 bg-white border border-[#E5E6DF] shadow-2xs">
          <span className="text-xs font-mono text-[#717A75] uppercase font-semibold">Industry Openings</span>
          <div className="text-xl font-bold font-mono text-[#18201D]">{career.openingsEstimate}</div>
          <span className="text-xs text-[#2D6A4F] font-semibold">{career.growthRate} hiring velocity</span>
        </Card>
        <Card className="p-4 space-y-1 bg-white border border-[#E5E6DF] shadow-2xs">
          <span className="text-xs font-mono text-[#717A75] uppercase font-semibold">Top Hiring Ecosystems</span>
          <div className="text-sm font-bold text-[#18201D] truncate mt-1">
            {career.topHiringCompanies.join(', ')}
          </div>
          <span className="text-xs text-[#717A75]">Leading tech employers</span>
        </Card>
      </div>

      {/* Explainability Section: Why Matched */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E1]">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            <h3 className="font-bold text-[#18201D] text-base">Demonstrated Fit &amp; Strengths</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-[#18201D]">
            {whyData.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] mt-2 shrink-0" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E1]">
            <AlertTriangle className="w-4 h-4 text-[#B27B18]" />
            <h3 className="font-bold text-[#18201D] text-base">Key Technical Gaps to Close</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-[#18201D]">
            {whyData.gaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4A347] mt-2 shrink-0" />
                <span className="leading-relaxed">{gap}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* AI Diagnostic Summary */}
      <Card className="border border-[#2D6A4F]/30 bg-[#EBF3EE] p-5 space-y-2 shadow-2xs">
        <div className="text-xs font-mono uppercase tracking-wider text-[#2D6A4F] font-bold">
          Diagnostic Verdict &amp; Strategy
        </div>
        <p className="text-sm text-[#18201D] leading-relaxed font-medium">
          {whyData.verdict}
        </p>
      </Card>

      {/* Required Competencies Table */}
      <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
        <h3 className="text-base font-bold text-[#18201D]">
          Required Competency Matrix ({career.requiredSkills.filter(s => s.userMatches).length} of {career.requiredSkills.length} Verified)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#18201D]">
            <thead className="text-xs font-mono text-[#717A75] border-b border-[#E8E8E1] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Competency</th>
                <th className="py-2.5 px-3">Target Standard</th>
                <th className="py-2.5 px-3">Your Status</th>
                <th className="py-2.5 px-3 text-right">Recommended Bridge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E1]">
              {career.requiredSkills.map((sk) => {
                const mappedCourse = courseFor(sk.skillId);
                const mappedProjects = projectsFor(sk.skillId);
                return (
                  <tr key={sk.skillId || sk.name} className="hover:bg-[#F8F8F5]">
                    <td className="py-3 px-3 font-bold text-[#18201D]">{sk.name}</td>
                    <td className="py-3 px-3 font-mono text-xs text-[#717A75]">{sk.level}</td>
                    <td className="py-3 px-3">
                      {sk.userMatches ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[#2D6A4F] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[#B27B18] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Action Needed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {mappedCourse ? (
                        <Link
                          to={routes.courseDetail(mappedCourse.slug)}
                          className="inline-flex items-center gap-1 text-xs text-[#2D6A4F] font-semibold hover:underline"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{mappedCourse.title.split(':')[0]}</span>
                        </Link>
                      ) : mappedProjects.length > 0 ? (
                        <Link
                          to={routes.projectDetail(mappedProjects[0].slug)}
                          className="inline-flex items-center gap-1 text-xs text-[#2D6A4F] font-semibold hover:underline"
                        >
                          <FolderGit2 className="w-3 h-3" />
                          <span>{mappedProjects[0].title}</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-[#717A75] font-mono">Self-Study</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
