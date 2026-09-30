import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { routes } from '../../lib/routes';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Circle,
  Award,
  ExternalLink,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { course: slug } = useParams<{ course: string }>();
  const { courses, updateCourseProgress } = useApp();
  const course = courses.find((c) => c.slug === slug || c.id === slug) || courses[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Link
        to={routes.learning}
        className="inline-flex items-center gap-1.5 text-xs text-[#717A75] hover:text-[#18201D] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Curriculum</span>
      </Link>

      <PageHeader
        phaseKicker={`Curriculum • ${course.provider}`}
        title={course.title}
        description={course.description}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#D4A347] font-mono text-sm font-bold">
              <Star className="w-4 h-4 fill-[#D4A347]" />
              <span>{course.rating}</span>
            </div>
            {course.url && (
              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2D6A4F] text-white text-xs font-semibold hover:bg-[#24553F]"
              >
                <span>Open Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <span className="text-xs font-mono text-[#717A75] px-2.5 py-1 rounded-md bg-[#F0F1EA] border border-[#E5E6DF] font-semibold">
              {course.level}
            </span>
          </div>
        }
      />

      {/* Progress & Stats Card */}
      <Card className="p-6 space-y-4 border border-[#E5E6DF] bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#2D6A4F] uppercase tracking-wider mb-1 font-bold">
              Active Lab Progress
            </div>
            <h3 className="text-lg font-bold text-[#18201D]">
              {course.progressPercent}% Completed ({course.modules.filter((m) => m.completed).length} of{' '}
              {course.modules.length} Modules)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#2D6A4F]" />
            <span className="text-xs font-mono text-[#717A75] font-semibold">Award: {course.badgeName}</span>
          </div>
        </div>
        <ProgressBar
          value={course.progressPercent}
          color="growth"
          showPercent={false}
        />
      </Card>

      {/* Modules Syllabus List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#18201D]">Curriculum Modules &amp; Labs</h3>
        <div className="space-y-3">
          {course.modules.map((mod, index) => (
            <Card
              key={mod.id}
              className={`p-5 transition-all bg-white border ${
                mod.completed ? 'border-[#E8E8E1] bg-[#F8F8F5]/50' : 'border-[#E5E6DF] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => updateCourseProgress(course.id, mod.id)}
                    className="mt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] rounded-full cursor-pointer"
                    title={mod.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {mod.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#BCC1BC] hover:text-[#717A75]" />
                    )}
                  </button>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#717A75]">Module 0{index + 1}</span>
                      <span className="text-xs text-[#D0D2C7]">•</span>
                      <span className="text-xs text-[#717A75] font-mono">{mod.duration}</span>
                    </div>
                    <h4
                      className={`text-base font-semibold ${
                        mod.completed ? 'text-[#717A75] line-through opacity-75' : 'text-[#18201D]'
                      }`}
                    >
                      {mod.title}
                    </h4>
                    {/* Topics covered */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {mod.topics.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#F0F1EA] text-[#18201D] border border-[#E5E6DF] font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant={mod.completed ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => updateCourseProgress(course.id, mod.id)}
                >
                  {mod.completed ? 'Completed' : 'Complete Lab'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
