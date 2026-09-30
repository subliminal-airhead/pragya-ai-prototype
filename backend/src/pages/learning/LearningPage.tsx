import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { CourseCard } from '../../components/sections/CourseCard';
import { useApp } from '../../context/AppContext';

export const LearningPage: React.FC = () => {
  const { courses } = useApp();
  const [filter, setFilter] = useState<'all' | 'enrolled'>('all');

  const filteredCourses = courses.filter((c) => {
    if (filter === 'enrolled') return c.enrolled;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Phase 1: Learn"
        title="SWAYAM, NPTEL &amp; Skill India Curriculum"
        description="Concise, rigor-tested course modules mapped directly to diagnostic skill gaps. Learn the underlying theory with NEP 2020 academic credits before constructing proof projects."
      >
        <div className="flex items-center gap-1 p-1 bg-[#F0F1EA] border border-[#E5E6DF] rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setFilter('enrolled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'enrolled'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            Enrolled Labs ({courses.filter((c) => c.enrolled).length})
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};
