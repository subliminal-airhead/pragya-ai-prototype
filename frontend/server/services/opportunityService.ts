import jobsData from '../data/jobs.json';
import { StudentProfile } from './store';

export interface OpportunityItem {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workplace_type: string;
  stipend_range: string;
  match_score: number;
  readiness_label: 'Ready to Apply' | 'Minor Gap' | 'Bridge Needed';
  deadline: string;
  posted_date: string;
  description: string;
  apply_url: string;
  requirements: Array<{
    requirement: string;
    satisfied: boolean;
    mandatory: boolean;
  }>;
  matched_skills: string[];
  missing_skills: string[];
  why_match_details: {
    overall_fit: number;
    skill_overlap_score: number;
    experience_score: number;
    education_score: number;
    summary: string;
    advantages: string[];
    risk_factors: string[];
  };
}

export function matchOpportunities(profile: StudentProfile, targetRole?: string): OpportunityItem[] {
  const userSkillNames = new Set((profile.skills || []).map((s) => s.name.toLowerCase()));
  const userCgpaNum = parseFloat(profile.cgpa || '8.0') || 8.0;

  return jobsData.map((job) => {
    const evaluatedReqs = job.requirements.map((req) => {
      const lower = req.requirement.toLowerCase();
      let satisfied = false;

      const hasSkill = Array.from(userSkillNames).some((s) => lower.includes(s));
      if (hasSkill) satisfied = true;
      else if (lower.includes('b.tech') || lower.includes('degree') || lower.includes('engineering')) {
        satisfied = Boolean(profile.degree);
      } else if (lower.includes('60%') || lower.includes('cgpa')) {
        satisfied = userCgpaNum >= 6.5;
      } else if (lower.includes('git') && userSkillNames.has('git')) {
        satisfied = true;
      }

      return {
        requirement: req.requirement,
        satisfied,
        mandatory: req.mandatory,
      };
    });

    const allSkills = Array.from(new Set([...job.matched_skills, ...job.missing_skills]));
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const sk of allSkills) {
      if (userSkillNames.has(sk.toLowerCase())) {
        matchedSkills.push(sk);
      } else {
        missingSkills.push(sk);
      }
    }

    const skillRatio = allSkills.length > 0 ? matchedSkills.length / allSkills.length : 0.5;
    const reqRatio = evaluatedReqs.filter((r) => r.satisfied).length / Math.max(1, evaluatedReqs.length);

    const skillOverlapScore = Math.min(98, Math.max(30, Math.round(skillRatio * 100)));
    const experienceScore = Math.min(95, Math.max(35, Math.round(reqRatio * 85 + (profile.projects?.length || 0) * 5)));
    const educationScore = Math.min(98, Math.max(50, Math.round((userCgpaNum / 10) * 100)));

    const overallFit = Math.min(97, Math.max(35, Math.round(skillOverlapScore * 0.5 + experienceScore * 0.25 + educationScore * 0.25)));
    const readinessLabel: 'Ready to Apply' | 'Minor Gap' | 'Bridge Needed' =
      overallFit >= 85 ? 'Ready to Apply' : overallFit >= 70 ? 'Minor Gap' : 'Bridge Needed';

    const advantages: string[] = [
      `Extracted from candidate profile: Verified competency in ${matchedSkills.slice(0, 3).join(', ') || 'core software fundamentals'}`,
    ];
    if (profile.university) {
      advantages.push(`Academic credentials in ${profile.degree || 'B.Tech'} (${profile.major || 'CSE'}) with ${profile.cgpa || 'strong'} CGPA at ${profile.university}`);
    }
    if (profile.projects && profile.projects.length > 0) {
      advantages.push(`Applied project deliverable demonstrated in "${profile.projects[0].title}"`);
    }

    const riskFactors: string[] = [];
    if (missingSkills.length > 0) {
      riskFactors.push(`Strengthening ${missingSkills.slice(0, 2).join(' & ')} would eliminate candidate auto-screening risk.`);
    } else {
      riskFactors.push(`High applicant pool volume; highlight live repository links and test coverage.`);
    }

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      workplace_type: job.workplace_type,
      stipend_range: job.stipend_range,
      match_score: overallFit,
      readiness_label: readinessLabel,
      deadline: job.deadline,
      posted_date: job.posted_date,
      description: job.description,
      apply_url: job.apply_url,
      requirements: evaluatedReqs,
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      why_match_details: {
        overall_fit: overallFit,
        skill_overlap_score: skillOverlapScore,
        experience_score: experienceScore,
        education_score: educationScore,
        summary: `Algorithm matches ${profile.full_name.split(' ')[0]} with ${matchedSkills.length} core requirements in ${matchedSkills.slice(0, 2).join(' & ') || 'technical fundamentals'}.`,
        advantages,
        risk_factors: riskFactors,
      },
    };
  }).sort((a, b) => b.match_score - a.match_score);
}
