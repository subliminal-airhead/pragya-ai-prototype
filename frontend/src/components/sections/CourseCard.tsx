import React from 'react';
import { Course } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { BookOpen, Clock, Star, ArrowRight, Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';

export const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <Card hoverEffect className="flex flex-col justify-between bg-white border border-[#E5E6DF] shadow-xs">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between text-xs text-[#717A75] mb-1">
            <span className="font-mono font-semibold text-[#2D6A4F]">{course.provider}</span>
            <div className="flex items-center gap-1 text-[#D4A347] font-mono font-bold">
              <Star className="w-3 h-3 fill-[#D4A347]" />
              <span>{course.rating}</span>
              <span className="text-[#717A75] font-normal">({course.reviewCount})</span>
            </div>
          </div>
          <CardTitle className="text-lg text-[#18201D]">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-[#717A75]">{course.description}</CardDescription>
        </CardHeader>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-4 text-xs text-[#717A75]">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#717A75]" />
              {course.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#717A75]" />
              {course.modulesCount || 4} Modules
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[#18201D] font-medium">
              {course.level}
            </span>
          </div>

          {/* Skills taught */}
          <div className="flex flex-wrap gap-1">
            {course.skillsTaught.map((skill) => (
              <span
                key={skill}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#F0F1EA] text-[#18201D] border border-[#E5E6DF]"
              >
                {skill}
              </span>
            ))}
          </div>

          {course.nepCredits && (
            <div className="text-[11px] font-mono text-[#2D6A4F] font-semibold bg-[#EBF3EE] px-2 py-1 rounded border border-[#2D6A4F]/20">
              {course.nepCredits}
            </div>
          )}

          {course.enrolled && (
            <div className="pt-2">
              <ProgressBar
                value={course.progressPercent}
                label="Module Progress"
                color="growth"
              />
            </div>
          )}
        </div>
      </div>

      <CardFooter className="border-t border-[#E8E8E1] gap-2">
        {course.url ? (
          <a
            href={course.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#2D6A4F] font-semibold hover:underline"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-medium">
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[170px]">{course.badgeName}</span>
          </div>
        )}

        <Link to={routes.courseDetail(course.slug)}>
          <Button variant={course.enrolled ? 'primary' : 'secondary'} size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
            {course.enrolled ? (course.progressPercent > 0 ? 'Resume Lab' : 'Start Course') : 'Enroll Free'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
