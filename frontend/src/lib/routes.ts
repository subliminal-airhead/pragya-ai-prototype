export const routes = {
  home: '/',
  login: '/login',
  signup: '/signup',
  about: '/about',
  // Onboarding
  onboarding: {
    root: '/onboarding',
    about: '/onboarding/about',
    skills: '/onboarding/skills',
    goals: '/onboarding/goals',
    preferences: '/onboarding/preferences',
  },
  // App Core
  dashboard: '/dashboard',
  profile: '/profile',
  // Career Paths
  careerPaths: '/career-paths',
  careerDetail: (careerSlug: string) => `/career-paths/${careerSlug}`,
  // Skill Gap
  skillGap: '/skill-gap',
  skillDetail: (skillSlug: string) => `/skill-gap/${skillSlug}`,
  // Roadmap
  roadmap: '/roadmap',
  // Learning
  learning: '/learning',
  courseDetail: (courseSlug: string) => `/learning/${courseSlug}`,
  // Projects
  projects: '/projects',
  projectDetail: (projectSlug: string) => `/projects/${projectSlug}`,
  projectBuilder: (skillQuery?: string) =>
    skillQuery ? `/projects/builder?skill=${encodeURIComponent(skillQuery)}` : '/projects/builder',
  // Opportunities
  opportunities: '/opportunities',
  opportunitiesPublic: '/opportunities/public',
  opportunitiesTracker: '/opportunities/tracker',
  opportunitiesInsights: '/opportunities/insights',
  opportunityDetail: (oppSlug: string) => `/opportunities/${oppSlug}`,
  opportunityWhyMatched: (oppSlug: string) => `/opportunities/${oppSlug}/why-matched`,
  opportunityEligibility: (oppSlug: string) => `/opportunities/${oppSlug}/eligibility`,
  // Govt Schemes
  govtSchemes: '/opportunities/govt',
  // Resume
  resume: '/resume',
  resumeImport: '/resume/import',
  resumeAnalyzing: '/resume/analyzing',
  resumeReview: '/resume/review',
  resumeWorkspace: '/resume/workspace',
  resumeBuilder: '/resume/builder',
  // Interview
  interview: '/interview',
} as const;
