import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardFooter } from '../../components/ui/Card';
import { PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useApp } from '../../context/AppContext';
import { courseFor, projectsFor } from '../../lib/data';
import { routes } from '../../lib/routes';
import { Link } from 'react-router-dom';
import { BookOpen, FolderGit2, ArrowRight, Clock } from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const { skillGaps, targetCareer, user } = useApp();
  const [filter, setFilter] = useState<'all' | 'action' | 'progress' | 'mastered'>('all');
  const isUploaded = user.resumeUploaded && user.skills.length > 0;

  const filteredGaps = skillGaps.filter((g) => {
    if (filter === 'action') return g.status === 'Action Needed';
    if (filter === 'progress') return g.status === 'In Progress';
    if (filter === 'mastered') return g.status === 'Mastered';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Diagnostic Engine"
        title="Skill Gap Diagnostics"
        description={
          isUploaded
            ? `Calibrated from ${user.resumeFileName || 'your uploaded resume'} against core requirements for ${targetCareer.title}. Every diagnostic gap is paired with an actionable SWAYAM lab and proof engineering artifact.`
            : `Awaiting resume upload for ${user.fullName}. Diagnostic scores will be evaluated directly against your uploaded resume.`
        }
      >
        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#F0F1EA] border border-[#E5E6DF] rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            All Diagnostic Gaps ({skillGaps.length})
          </button>
          <button
            onClick={() => setFilter('action')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'action'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            Action Needed ({skillGaps.filter((g) => g.status === 'Action Needed').length})
          </button>
          <button
            onClick={() => setFilter('progress')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'progress'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            In Progress ({skillGaps.filter((g) => g.status === 'In Progress').length})
          </button>
        </div>
      </PageHeader>

      {!isUploaded && (
        <Card className="p-5 bg-[#FEF9EE] border border-[#D4A347]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
          <div className="space-y-1">
            <span className="font-mono text-[#B45309] font-bold uppercase block text-[11px]">
              Baseline Pending Resume Analysis
            </span>
            <p className="text-[#717A75] leading-relaxed">
              These {skillGaps.length} skills represent target industry benchmarks for {targetCareer.title}. Upload your resume so Campus to Corporate can verify which competencies you have already acquired and calculate your true gap deltas.
            </p>
          </div>
          <Link to={routes.resumeImport} className="shrink-0">
            <Button variant="primary" size="sm">
              Upload Resume to Detect Gaps →
            </Button>
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGaps.map((gap) => {
          const course = courseFor(gap.skill.id);
          const mappedProjects = projectsFor(gap.skill.id);

          return (
            <Card key={gap.skill.id} hoverEffect className="flex flex-col justify-between p-6 bg-white border border-[#E5E6DF] shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#2D6A4F] font-bold">
                    {gap.skill.category}
                  </span>
                  <PriorityBadge priority={gap.skill.importance} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#18201D] mb-1">{gap.skill.name}</h3>
                  <p className="text-xs text-[#717A75] leading-relaxed">{gap.skill.description}</p>
                </div>

                <div className="space-y-2 py-2 border-y border-[#E8E8E1]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#717A75]">
                      Your Score: <strong className="text-[#18201D]">{gap.currentScore}%</strong> / Target:{' '}
                      <strong className="text-[#18201D]">{gap.requiredScore}%</strong>
                    </span>
                    <span className="text-[#B27B18] font-bold">{gap.gapScore}% Delta</span>
                  </div>
                  <ProgressBar
                    value={gap.currentScore}
                    color={gap.gapScore === 0 ? 'growth' : gap.gapScore < 20 ? 'growth' : 'amber'}
                    showPercent={false}
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#717A75] pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Est. ~{gap.estimatedHoursToClose}h to close
                    </span>
                    <span className="font-mono text-[#18201D] font-medium">
                      Status: {gap.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-mono text-[#717A75] uppercase tracking-wider block font-semibold">
                    Targeted Bridge Action:
                  </span>
                  <p className="text-[#18201D] leading-relaxed">{gap.recommendedAction}</p>

                  <div className="pt-2 space-y-1.5">
                    {course && (
                      <Link
                        to={routes.courseDetail(course.slug)}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF] hover:border-[#D0D2C7] text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                          <span className="text-[#18201D] font-medium truncate">{course.title}</span>
                        </div>
                        <span className="text-[#2D6A4F] font-mono font-semibold shrink-0 ml-2">SWAYAM Lab →</span>
                      </Link>
                    )}

                    {mappedProjects.map((p) => (
                      <Link
                        key={p.id}
                        to={routes.projectDetail(p.slug)}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF] hover:border-[#D0D2C7] text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FolderGit2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                          <span className="text-[#18201D] font-medium truncate">{p.title}</span>
                        </div>
                        <span className="text-[#2D6A4F] font-mono font-semibold shrink-0 ml-2">Proof Project →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <CardFooter className="gap-2 border-t border-[#E8E8E1]">
                <Link to={routes.skillDetail(gap.skill.id)} className="w-full">
                  <Button variant="secondary" size="sm" className="w-full" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                    Deep Diagnostic Drill-Down
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
