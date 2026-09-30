export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type SkillCategory =
  | 'Languages'
  | 'AI & ML'
  | 'Frameworks'
  | 'Cloud & Systems'
  | 'Core CS'
  | 'Soft Skills';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  userLevel?: SkillLevel;
  requiredLevel: SkillLevel;
  importance: 'Critical' | 'Important' | 'Nice-to-have';
  inDemandScore: number; // 0 - 100
  mappedCourseId?: string;
  mappedProjectIds?: string[];
  description: string;
}

export interface SkillGap {
  skill: SkillItem;
  currentScore: number; // 0 - 100
  requiredScore: number; // 0 - 100
  gapScore: number; // requiredScore - currentScore
  status: 'Mastered' | 'In Progress' | 'Action Needed';
  recommendedAction: string;
  estimatedHoursToClose: number;
}

export interface CareerPath {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  matchScore: number; // 0 - 100
  marketDemand: 'Very High' | 'High' | 'Steady';
  avgSalary: string;
  openingsEstimate: string;
  isTarget: boolean;
  requiredSkills: {
    skillId: string;
    name: string;
    level: SkillLevel;
    userMatches: boolean;
  }[];
  growthRate: string;
  topHiringCompanies: string[];
  whyMatchRationale: {
    strengths: string[];
    gaps: string[];
    verdict: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  topics: string[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  provider: string;
  level: SkillLevel;
  duration: string;
  description: string;
  skillsTaught: string[];
  modulesCount: number;
  enrolled: boolean;
  progressPercent: number;
  rating: number;
  reviewCount: number;
  modules: CourseModule[];
  badgeName: string;
  url?: string;
  isFree?: boolean;
  nepCredits?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estHours: number;
  summary: string;
  description: string;
  keySkills: string[];
  skillsClosed: string[];
  deliverables: string[];
  starterRepoUrl: string;
  prerequisites: string[];
  architectureOverview: string;
  completed: boolean;
  featured: boolean;
}

export type ApplicationStage = 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Closed';

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Co-op' | 'Fellowship';
  workplaceType: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange: string;
  matchScore: number;
  readinessLabel: 'Ready to Apply' | 'Minor Gap' | 'Bridge Needed';
  deadline: string;
  postedDate: string;
  description: string;
  applyUrl?: string;
  requirements: {
    requirement: string;
    satisfied: boolean;
    mandatory: boolean;
  }[];
  matchedSkills: string[];
  missingSkills: string[];
  stage?: ApplicationStage;
  appliedDate?: string;
  notes?: string;
  whyMatchDetails: {
    overallFit: number;
    skillOverlapScore: number;
    experienceScore: number;
    educationScore: number;
    summary: string;
    advantages: string[];
    riskFactors: string[];
  };
}

export interface GovtScheme {
  id: string;
  name: string;
  category: string;
  ministryOrDept: string;
  portalName: string;
  portalUrl: string;
  monthlyStipendInr: string;
  targetAudience: string;
  description: string;
  benefits: string[];
  eligible: boolean;
  reasons: string[];
  lastVerified: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  phase: 'Learn' | 'Build' | 'Prove' | 'Apply';
  description: string;
  timeframe: string;
  status: 'Completed' | 'Current' | 'Upcoming';
  tasks: {
    id: string;
    text: string;
    completed: boolean;
    linkTo?: string;
    type?: 'course' | 'project' | 'assessment' | 'resume';
  }[];
}

export interface UserExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  description: string;
  highlights: string[];
}

export interface UserProjectItem {
  id: string;
  title: string;
  role: string;
  techStack: string[];
  summary: string;
  bullets: string[];
  link?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  headline: string;
  university: string;
  degree: string;
  major: string;
  gradYear: string;
  cgpa: string;
  location: string;
  bio: string;
  targetCareerId: string;
  targetTimeline: string;
  preferredWorkType: string[];
  preferredLocations: string[];
  skills: { name: string; level: SkillLevel; verified: boolean }[];
  experiences: UserExperience[];
  projects: UserProjectItem[];
  resumeUploaded: boolean;
  resumeFileName?: string;
  resumeAtsScore?: number;
  resumeLastAnalyzed?: string;
  resumeSummary?: string;
  resumeRawText?: string;
  personaId?: string;
}

export interface MockInterviewQuestion {
  id: string;
  category: 'System Design' | 'Coding Architecture' | 'Behavioral / Leadership' | 'Domain & AI';
  role: string;
  question: string;
  context: string;
  keyPointsToCover: string[];
  timeLimitSeconds: number;
}

export interface MockInterviewResult {
  id: string;
  date: string;
  role: string;
  score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    rubricScores: {
      technicalDepth: number;
      communication: number;
      problemSolving: number;
      confidence: number;
    };
    overallReview: string;
  };
}
