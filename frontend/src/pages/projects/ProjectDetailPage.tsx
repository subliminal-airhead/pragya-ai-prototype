import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { routes } from '../../lib/routes';
import {
  ArrowLeft,
  CheckCircle2,
  Terminal,
  Code2,
  FileCheck2,
  Copy,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { project: slug } = useParams<{ project: string }>();
  const { projects, toggleProjectComplete, showToast } = useApp();
  const project = projects.find((p) => p.slug === slug || p.id === slug) || projects[0];

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`git clone ${project.starterRepoUrl}.git`);
    showToast('Starter repo clone command copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <Link
        to={routes.projects}
        className="inline-flex items-center gap-1.5 text-xs text-[#717A75] hover:text-[#18201D] font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </Link>

      <PageHeader
        phaseKicker={`Portfolio Proof • ${project.category}`}
        title={project.title}
        description={project.description}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant={project.completed ? 'outline' : 'primary'}
              size="md"
              onClick={() => toggleProjectComplete(project.id)}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {project.completed ? 'Artifact Verified' : 'Verify Project Completion'}
            </Button>
          </div>
        }
      />

      {/* Starter Repo Terminal Box */}
      <Card className="border border-[#E5E6DF] bg-[#F8F8F5] p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-[#717A75]">
          <span className="font-mono flex items-center gap-1.5 text-[#2D6A4F] font-bold">
            <Terminal className="w-3.5 h-3.5" />
            Starter Template Repository
          </span>
          <button
            onClick={handleCopyClone}
            className="flex items-center gap-1 text-[#717A75] hover:text-[#18201D] text-xs font-mono font-medium cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>Copy git clone</span>
          </button>
        </div>
        <div className="p-3 rounded-lg bg-white border border-[#E5E6DF] font-mono text-xs text-[#2D6A4F] font-bold overflow-x-auto">
          git clone {project.starterRepoUrl}.git &amp;&amp; cd starter-{project.slug} &amp;&amp; npm install
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Architecture & Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E1]">
              <Code2 className="w-4 h-4 text-[#2D6A4F]" />
              <h3 className="font-bold text-[#18201D] text-base">Architectural Blueprint</h3>
            </div>
            <p className="text-sm text-[#18201D] leading-relaxed">
              {project.architectureOverview}
            </p>
            <div className="p-4 rounded-xl bg-[#F8F8F5] border border-[#E5E6DF] space-y-2 text-xs">
              <span className="font-mono text-[#717A75] uppercase tracking-wider block font-semibold">
                Required Systems Concepts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.keySkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded-md bg-[#F0F1EA] text-[#18201D] border border-[#E5E6DF] font-mono"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E8E1]">
              <FileCheck2 className="w-4 h-4 text-[#2D6A4F]" />
              <h3 className="font-bold text-[#18201D] text-base">Submission &amp; Verification Rubric</h3>
            </div>
            <ul className="space-y-3 text-sm text-[#18201D]">
              {project.deliverables.map((del, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F8F5] border border-[#E5E6DF]">
                  <div className="w-5 h-5 rounded-full bg-[#EBF3EE] border border-[#2D6A4F]/30 flex items-center justify-center text-[#2D6A4F] text-xs font-mono font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="leading-relaxed">{del}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Column: Metadata & Impact */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#717A75] font-bold">
              Artifact Metadata
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E8E8E1]">
                <span className="text-[#717A75]">Difficulty Level</span>
                <span className="font-mono font-semibold text-[#2D6A4F]">{project.difficulty}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8E8E1]">
                <span className="text-[#717A75]">Estimated Effort</span>
                <span className="font-mono text-[#18201D] font-bold">~{project.estHours} Hours</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8E8E1]">
                <span className="text-[#717A75]">Status</span>
                <span className={project.completed ? 'text-[#2D6A4F] font-semibold' : 'text-[#B27B18] font-semibold'}>
                  {project.completed ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-mono text-[#717A75] uppercase tracking-wider block mb-2 font-bold">
                Closes Target Gaps:
              </span>
              <div className="space-y-1.5">
                {project.skillsClosed.map((sc) => (
                  <div
                    key={sc}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#EBF3EE] border border-[#2D6A4F]/30 text-xs text-[#2D6A4F] font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{sc}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
