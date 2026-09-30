import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ProjectCard } from '../../components/sections/ProjectCard';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { routes } from '../../lib/routes';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects } = useApp();
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const filteredProjects = projects.filter((p) => {
    if (filter === 'verified') return p.completed;
    if (filter === 'pending') return !p.completed;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Phase 2: Build"
        title="Verifiable Portfolio Proof Projects"
        description="Construct production-grade engineering artifacts that demonstrate mastery to hiring managers. Complete with architecture specs and automated test suites."
        actions={
          <Link to={routes.projectBuilder()}>
            <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
              Custom Project Builder
            </Button>
          </Link>
        }
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
            All Artifacts ({projects.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'verified'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            Verified ({projects.filter((p) => p.completed).length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-white text-[#18201D] shadow-xs'
                : 'text-[#717A75] hover:text-[#18201D]'
            }`}
          >
            In Pipeline ({projects.filter((p) => !p.completed).length})
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
