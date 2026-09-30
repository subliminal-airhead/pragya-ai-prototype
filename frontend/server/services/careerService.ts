import rolesData from '../data/roles.json';
import { StudentProfile } from './store';

const LEVEL_WEIGHTS: Record<string, number> = {
  Beginner: 40,
  Intermediate: 75,
  Advanced: 95,
  Expert: 100,
};

export interface CareerMatch {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  full_description: string;
  avg_salary: string;
  market_demand: string;
  growth_rate: string;
  openings_estimate: string;
  match_score: number;
  is_target: boolean;
  top_hiring_companies: string[];
  required_skills: Array<{
    name: string;
    level: string;
    user_matches: boolean;
    user_level?: string;
  }>;
  why_match_rationale: {
    strengths: string[];
    gaps: string[];
    verdict: string;
  };
}

export function recommendCareers(profile: StudentProfile, interests: string[] = []): CareerMatch[] {
  const userSkillMap = new Map<string, string>();
  for (const s of profile.skills || []) {
    userSkillMap.set(s.name.toLowerCase(), s.level);
  }

  const matches: CareerMatch[] = rolesData.map((role) => {
    let matchedWeight = 0;
    let totalWeight = 0;

    const evaluatedSkills = role.required_skills.map((req) => {
      const userLevel = userSkillMap.get(req.name.toLowerCase());
      const hasSkill = Boolean(userLevel);
      const reqWeight = req.weight || 80;
      totalWeight += reqWeight;

      if (userLevel) {
        const userScore = LEVEL_WEIGHTS[userLevel] || 50;
        const targetScore = LEVEL_WEIGHTS[req.level] || 85;
        matchedWeight += Math.min(reqWeight, (userScore / targetScore) * reqWeight);
      }

      return {
        name: req.name,
        level: req.level,
        user_matches: hasSkill && (LEVEL_WEIGHTS[userLevel || 'Beginner'] >= (LEVEL_WEIGHTS[req.level] || 80) * 0.75),
        user_level: userLevel,
      };
    });

    const rawMatch = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 30;

    // Bonus for aligned interests
    const interestOverlap = (interests || []).some((interest) =>
      role.title.toLowerCase().includes(interest.toLowerCase()) ||
      role.category.toLowerCase().includes(interest.toLowerCase())
    );
    const interestBonus = interestOverlap ? 6 : 0;

    // Academic alignment
    const isMajorAligned =
      (profile.major || '').toLowerCase().includes('computer') ||
      (profile.major || '').toLowerCase().includes('data') ||
      (profile.major || '').toLowerCase().includes('ai') ||
      (profile.degree || '').toLowerCase().includes('b.tech');
    const academicBonus = isMajorAligned ? 4 : 0;

    const matchScore = Math.min(98, Math.max(25, Math.round(rawMatch * 0.9 + interestBonus + academicBonus)));
    const matchedSkills = evaluatedSkills.filter((s) => s.user_matches).map((s) => s.name);
    const missingSkills = evaluatedSkills.filter((s) => !s.user_matches).map((s) => s.name);

    const strengths: string[] = [];
    if (matchedSkills.length > 0) {
      strengths.push(`Direct competency match in ${matchedSkills.slice(0, 3).join(', ')} from candidate profile`);
    }
    if (profile.university) {
      strengths.push(`Enrolled in ${profile.degree || 'Degree'} (${profile.major || 'Specialization'}) at ${profile.university} with ${profile.cgpa || 'strong'} CGPA`);
    }
    if (profile.projects && profile.projects.length > 0) {
      strengths.push(`Applied proof artifact in "${profile.projects[0].title}"`);
    }

    const gaps: string[] = [];
    if (missingSkills.length > 0) {
      missingSkills.slice(0, 3).forEach((gapName) => {
        gaps.push(`Missing verified artifact in resume for ${gapName}`);
      });
    } else {
      gaps.push('Refine quantified latency numbers and scale metrics in GitHub repositories');
    }

    const verdict = matchScore >= 80
      ? `High-probability hiring trajectory for ${profile.full_name.split(' ')[0]}. Closing the remaining ${100 - matchScore}% readiness delta bridges your profile into the top 10% of campus and off-campus applicants.`
      : `Promising transition path. Candidate demonstrates solid base, but requires dedicated lab projects in ${missingSkills.slice(0, 2).join(' & ')} before final application dispatch.`;

    const isTarget = profile.target_role
      ? role.title.toLowerCase().includes(profile.target_role.toLowerCase()) || profile.target_role.toLowerCase().includes(role.title.toLowerCase())
      : role.id === 'career_software_eng';

    return {
      id: role.id,
      title: role.title,
      slug: role.slug,
      category: role.category,
      short_description: role.short_description,
      full_description: role.full_description,
      avg_salary: role.avg_salary,
      market_demand: role.market_demand,
      growth_rate: role.growth_rate,
      openings_estimate: role.openings_estimate,
      match_score: matchScore,
      is_target: isTarget,
      top_hiring_companies: role.top_hiring_companies,
      required_skills: evaluatedSkills,
      why_match_rationale: {
        strengths,
        gaps,
        verdict,
      },
    };
  });

  return matches.sort((a, b) => b.match_score - a.match_score);
}
