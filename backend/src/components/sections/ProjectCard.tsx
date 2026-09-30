import React from 'react';
import { Project } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle2, ArrowRight, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const { toggleProjectComplete } = useApp();

  return (
    <Card hoverEffect className={`flex flex-col justify-between bg-white border border-[#E5E6DF] shadow-xs ${project.completed ? 'border-[#2D6A4F] bg-[#EBF3EE]/20' : ''}`}>
      <div>
        <CardHeader>
          <div className="flex items-center justify-between text-xs text-[#717A75] mb-1">
            <span className="font-mono text-[#2D6A4F] font-semibold uppercase tracking-wider">{project.category}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                project.difficulty === 'Advanced'
                  ? 'bg-[#FDF8ED] text-[#B27B18] border-[#D4A347]/30 font-semibold'
                  : 'bg-[#F0F1EA] text-[#18201D] border-[#E5E6DF]'
              }`}>
                {project.difficulty}
              </span>
              <span className="flex items-center gap-1 text-[#717A75]">
                <Clock className="w-3 h-3" />
                ~{project.estHours}h
              </span>
            </div>
          </div>
          <CardTitle className="text-lg flex items-center gap-2 text-[#18201D]">
            <span>{project.title}</span>
            {project.completed && (
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            )}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-[#717A75]">{project.summary}</CardDescription>
        </CardHeader>

        <div className="space-y-3 mb-4">
          <div className="text-xs space-y-1">
            <span className="text-[#717A75] block font-mono font-medium">Bridges &amp; Closes Skill:</span>
            <div className="flex flex-wrap gap-1">
              {project.skillsClosed.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/30"
                >
                  <Star className="w-2.5 h-2.5 fill-[#2D6A4F]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#717A75]">
            <span className="text-[#717A75] block font-mono mb-1 font-medium">Primary Deliverables:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[#18201D]">
              {project.deliverables.slice(0, 2).map((d, i) => (
                <li key={i} className="truncate">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <CardFooter className="gap-2 border-t border-[#E8E8E1]">
        <Button
          variant={project.completed ? 'outline' : 'secondary'}
          size="sm"
          onClick={() => toggleProjectComplete(project.id)}
        >
          {project.completed ? 'Mark Incomplete' : 'Verify Artifact'}
        </Button>
        <Link to={routes.projectDetail(project.slug)}>
          <Button variant="primary" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
            View Spec &amp; Starter
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
