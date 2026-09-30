import { routes } from './routes';
import {
  LayoutDashboard,
  Compass,
  Zap,
  Milestone,
  BookOpen,
  FolderGit2,
  Briefcase,
  FileText,
  UserCheck,
  Landmark,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

export const primaryNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: routes.dashboard,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Roadmap',
    href: routes.roadmap,
    icon: Milestone,
  },
  {
    label: 'Skill Gap',
    href: routes.skillGap,
    icon: Zap,
  },
  {
    label: 'Curriculum',
    href: routes.learning,
    icon: BookOpen,
  },
  {
    label: 'Projects',
    href: routes.projects,
    icon: FolderGit2,
  },
  {
    label: 'Opportunities',
    href: routes.opportunities,
    icon: Briefcase,
  },
  {
    label: 'Govt Schemes',
    href: routes.govtSchemes,
    icon: Landmark,
  },
  {
    label: 'Resume',
    href: routes.resumeWorkspace,
    icon: FileText,
  },
  {
    label: 'Interview',
    href: routes.interview,
    icon: UserCheck,
  },
];
