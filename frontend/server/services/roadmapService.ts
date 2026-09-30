import { Response } from 'express';
import { store, StudentProfile, StoredRoadmap } from './store';
import { recommendCareers } from './careerService';
import { computeSkillGaps } from './gapService';
import { recommendCourses } from './courseService';
import { matchOpportunities } from './opportunityService';
import { matchGovtSchemes } from './govtService';

export function calculateEmployabilityScore(profile: StudentProfile, careerMatchScore: number, gapReport: any) {
  const currentSkillsCount = (profile.skills || []).length;
  const verifiedSkillsCount = (profile.skills || []).filter((s) => s.verified).length;
  const technicalSkills = Math.min(98, Math.max(40, Math.round((verifiedSkillsCount / 8) * 100)));

  const projectProof = Math.min(95, Math.max(35, (profile.projects || []).length * 40));
  const academicAlignment = Math.min(96, Math.max(50, Math.round(((parseFloat(profile.cgpa || '8.0') || 8.0) / 10) * 100)));
  const resumeAts = profile.ats_score || 75;

  const currentScore = Math.min(
    95,
    Math.max(30, Math.round(technicalSkills * 0.35 + projectProof * 0.25 + academicAlignment * 0.15 + resumeAts * 0.25))
  );

  const improvedScore = Math.min(98, currentScore + 16);

  return {
    score: currentScore,
    score_after_improvements: improvedScore,
    breakdown: {
      technical_skills: technicalSkills,
      project_proof: projectProof,
      academic_alignment: academicAlignment,
      resume_ats: resumeAts,
    },
  };
}

export async function streamRoadmapGeneration(
  res: Response,
  profile: StudentProfile,
  interests: string[] = [],
  targetRole?: string
): Promise<string> {
  const roadmapId = `rdm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const roleName = targetRole || profile.target_role || 'Software Development Engineer';

  // Helper to send SSE event
  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Helper for small realistic delay
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 1. Careers Step
  sendEvent('step', { step: 'careers', status: 'started', progress: 0.1 });
  await wait(200);
  const careers = recommendCareers(profile, interests);
  sendEvent('step', { step: 'careers', status: 'done', progress: 0.25, data: careers });

  // 2. Gaps Step
  sendEvent('step', { step: 'gaps', status: 'started', progress: 0.3 });
  await wait(200);
  const gaps = computeSkillGaps(profile, roleName);
  sendEvent('step', { step: 'gaps', status: 'done', progress: 0.45, data: gaps });

  // 3. Courses Step
  sendEvent('step', { step: 'courses', status: 'started', progress: 0.5 });
  await wait(200);
  const courses = recommendCourses(profile, roleName);
  sendEvent('step', { step: 'courses', status: 'done', progress: 0.65, data: courses });

  // 4. Opportunities Step
  sendEvent('step', { step: 'opportunities', status: 'started', progress: 0.7 });
  await wait(200);
  const opportunities = matchOpportunities(profile, roleName);
  sendEvent('step', { step: 'opportunities', status: 'done', progress: 0.8, data: opportunities });

  // 5. Govt Schemes Step
  sendEvent('step', { step: 'govt', status: 'started', progress: 0.85 });
  await wait(200);
  const govtSchemes = matchGovtSchemes(profile);
  sendEvent('step', { step: 'govt', status: 'done', progress: 0.92, data: govtSchemes });

  // 6. Employability Score Step
  sendEvent('step', { step: 'score', status: 'started', progress: 0.95 });
  await wait(150);
  const targetCareerMatch = careers.find((c) => c.is_target) || careers[0];
  const scoreData = calculateEmployabilityScore(profile, targetCareerMatch.match_score, gaps);
  sendEvent('step', { step: 'score', status: 'done', progress: 1.0, data: scoreData });

  // Store full roadmap for GET /api/roadmap/:id
  const fullRoadmap: StoredRoadmap = {
    id: roadmapId,
    profile_id: profile.id,
    target_role: roleName,
    created_at: new Date().toISOString(),
    employability_score: scoreData,
    careers,
    gaps,
    courses,
    opportunities,
    govt_schemes: govtSchemes,
  };

  store.saveRoadmap(fullRoadmap);

  // Send done event
  sendEvent('done', { roadmap_id: roadmapId });
  res.end();

  return roadmapId;
}
