import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { courseFor, projectsFor } from '../../lib/data';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { routes } from '../../lib/routes';
import {
  ArrowLeft,
  BookOpen,
  FolderGit2,
  Sparkles,
} from 'lucide-react';

export const SkillDetailPage: React.FC = () => {
  const { skill: skillId } = useParams<{ skill: string }>();
  const { skillGaps, updateSkillGapScore, showToast } = useApp();
  const gap = skillGaps.find((g) => g.skill.id === skillId) || skillGaps[0];
  const course = courseFor(gap.skill.id);
  const mappedProjects = projectsFor(gap.skill.id);

  const handleSimulateAssessment = () => {
    updateSkillGapScore(gap.skill.id, 15);
    showToast(`Diagnostic verified! ${gap.skill.name} proficiency score increased by +15%.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Link
        to={routes.skillGap}
        className="inline-flex items-center gap-1.5 text-xs text-[#717A75] hover:text-[#18201D] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Skill Gap Diagnostics</span>
      </Link>

      <PageHeader
        phaseKicker={`Competency Diagnostic • ${gap.skill.category}`}
        title={gap.skill.name}
        description={gap.skill.description}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={handleSimulateAssessment}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Take Skill Verification Quiz (+15%)
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-2 bg-white border border-[#E5E6DF] shadow-2xs">
          <span className="text-xs font-mono text-[#717A75] uppercase font-semibold">Current Proficiency</span>
          <div className="text-2xl font-bold font-mono text-[#18201D]">{gap.currentScore}%</div>
          <ProgressBar value={gap.currentScore} showPercent={false} color="amber" />
          <span className="text-xs text-[#717A75] block pt-1">Benchmark Standard: {gap.requiredScore}%</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border border-[#E5E6DF] shadow-2xs">
          <span className="text-xs font-mono text-[#717A75] uppercase font-semibold">Market In-Demand Score</span>
          <div className="text-2xl font-bold font-mono text-[#2D6A4F]">
            {gap.skill.inDemandScore}/100
          </div>
          <span className="text-xs text-[#717A75] block">
            Featured in 92% of target role job postings
          </span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border border-[#E5E6DF] shadow-2xs">
          <span className="text-xs font-mono text-[#717A75] uppercase font-semibold">Required Time Investment</span>
          <div className="text-2xl font-bold font-mono text-[#2D6A4F]">
            ~{gap.estimatedHoursToClose} Hours
          </div>
          <span className="text-xs text-[#717A75] block">
            Covers 1 dedicated lab course and 1 verified project
          </span>
        </Card>
      </div>

      {/* Recommended Bridge Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#18201D]">Recommended Engineering Solutions</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {course && (
            <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono text-[#2D6A4F] uppercase font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>Phase 1: Conceptual &amp; Lab Mastery</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#18201D]">{course.title}</h4>
                <p className="text-xs text-[#717A75] mt-1 leading-relaxed">{course.description}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E1] text-xs text-[#717A75]">
                <span className="font-mono">{course.duration}</span>
                <Link to={routes.courseDetail(course.slug)}>
                  <Button variant="primary" size="sm">
                    Open SWAYAM Lab
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {mappedProjects.map((p) => (
            <Card key={p.id} className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono text-[#2D6A4F] uppercase font-semibold">
                <FolderGit2 className="w-4 h-4" />
                <span>Phase 2: Verifiable Portfolio Proof</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#18201D]">{p.title}</h4>
                <p className="text-xs text-[#717A75] mt-1 leading-relaxed">{p.summary}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E1] text-xs text-[#717A75]">
                <span className="font-mono">Est. ~{p.estHours}h build time</span>
                <Link to={routes.projectDetail(p.slug)}>
                  <Button variant="secondary" size="sm">
                    View Project Spec
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
