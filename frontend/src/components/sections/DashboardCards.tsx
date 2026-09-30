import React from 'react';
import { Card } from '../ui/Card';
import { useApp } from '../../context/AppContext';
import { routes } from '../../lib/routes';
import { Link } from 'react-router-dom';
import {
  Target,
  Zap,
  FolderGit2,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardCards: React.FC = () => {
  const { targetCareer, skillGaps, projects, opportunities, user } = useApp();
  const isUploaded = user.resumeUploaded && user.skills.length > 0;
  const completedProjects = projects.filter((p) => p.completed).length;
  const criticalGaps = skillGaps.filter((g) => g.status === 'Action Needed').length;
  const readyOpportunities = opportunities.filter((o) => o.matchScore >= 80).length;

  const stats = [
    {
      label: 'Target Career Match',
      value: isUploaded ? `${targetCareer.matchScore}%` : '--',
      subtitle: isUploaded ? targetCareer.title : 'Upload resume to calculate fit',
      icon: Target,
      color: isUploaded ? 'text-[#2D6A4F]' : 'text-[#717A75]',
      bgColor: isUploaded ? 'bg-[#EBF3EE]' : 'bg-[#F0F1EA]',
      borderColor: isUploaded ? 'border-[#2D6A4F]/20' : 'border-[#E5E6DF]',
      link: isUploaded ? routes.careerDetail(targetCareer.slug) : routes.resumeImport,
      linkLabel: isUploaded ? 'View career map' : 'Upload resume →',
    },
    {
      label: 'Skill Diagnostic Gaps',
      value: isUploaded ? `${criticalGaps} Action Needed` : '--',
      subtitle: isUploaded ? `${skillGaps.length} benchmarks tracked` : 'Awaiting resume extraction',
      icon: Zap,
      color: isUploaded ? 'text-[#B27B18]' : 'text-[#717A75]',
      bgColor: isUploaded ? 'bg-[#FDF8ED]' : 'bg-[#F0F1EA]',
      borderColor: isUploaded ? 'border-[#D4A347]/30' : 'border-[#E5E6DF]',
      link: isUploaded ? routes.skillGap : routes.resumeImport,
      linkLabel: isUploaded ? 'Open diagnostic' : 'Upload resume →',
    },
    {
      label: 'Proof Projects Verified',
      value: isUploaded ? `${completedProjects}/${projects.length}` : '0 Verified',
      subtitle: isUploaded ? 'Extracted from resume & repo' : 'Upload resume for verification',
      icon: FolderGit2,
      color: isUploaded ? 'text-[#2D6A4F]' : 'text-[#717A75]',
      bgColor: isUploaded ? 'bg-[#EBF3EE]' : 'bg-[#F0F1EA]',
      borderColor: isUploaded ? 'border-[#2D6A4F]/20' : 'border-[#E5E6DF]',
      link: isUploaded ? routes.projects : routes.resumeImport,
      linkLabel: isUploaded ? 'Review portfolio' : 'Upload resume →',
    },
    {
      label: 'High-Match Roles',
      value: isUploaded ? `${readyOpportunities}` : '--',
      subtitle: isUploaded ? 'Passed technical pre-flight' : 'Awaiting resume benchmark',
      icon: Briefcase,
      color: isUploaded ? 'text-[#2D6A4F]' : 'text-[#717A75]',
      bgColor: isUploaded ? 'bg-[#EBF3EE]' : 'bg-[#F0F1EA]',
      borderColor: isUploaded ? 'border-[#2D6A4F]/20' : 'border-[#E5E6DF]',
      link: isUploaded ? routes.opportunities : routes.resumeImport,
      linkLabel: isUploaded ? 'Explore matches' : 'Upload resume →',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <Card key={idx} hoverEffect className="flex flex-col justify-between p-5 bg-white border border-[#E5E6DF] rounded-xl shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#717A75] font-semibold">
                  {s.label}
                </span>
                <div className={`p-2 rounded-lg border ${s.bgColor} ${s.borderColor}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-[#18201D] mb-1">
                {s.value}
              </div>
              <p className="text-xs text-[#717A75] truncate">{s.subtitle}</p>
            </div>
            <div className="pt-4 mt-2 border-t border-[#E8E8E1]">
              <Link
                to={s.link}
                className="inline-flex items-center gap-1 text-xs text-[#2D6A4F] hover:text-[#24553F] font-semibold"
              >
                <span>{s.linkLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
