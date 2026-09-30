import coursesData from '../data/courses.json';
import { StudentProfile } from './store';
import { computeSkillGaps } from './gapService';

export interface CourseRecommendation {
  id: string;
  title: string;
  provider: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  skills_covered: string[];
  rating: number;
  review_count: number;
  url: string;
  is_free: boolean;
  nep_credits: string;
  target_gap_skill?: string;
  match_relevance: number;
}

export function recommendCourses(profile: StudentProfile, targetRoleTitle?: string): CourseRecommendation[] {
  const gapReport = computeSkillGaps(profile, targetRoleTitle);
  const neededSkillNames = gapReport.gaps
    .filter((g) => g.status !== 'Mastered')
    .map((g) => g.skill_name.toLowerCase());

  const scoredCourses: CourseRecommendation[] = coursesData.map((c) => {
    let relevance = 60;
    let matchedGap: string | undefined = undefined;

    for (const sk of c.skills_covered) {
      if (neededSkillNames.includes(sk.toLowerCase())) {
        relevance += 20;
        if (!matchedGap) matchedGap = sk;
      }
    }

    return {
      id: c.id,
      title: c.title,
      provider: c.provider,
      category: c.category,
      level: c.level,
      duration: c.duration,
      description: c.description,
      skills_covered: c.skills_covered,
      rating: c.rating,
      review_count: c.review_count,
      url: c.url,
      is_free: c.is_free,
      nep_credits: c.nep_credits,
      target_gap_skill: matchedGap || c.skills_covered[0],
      match_relevance: Math.min(99, relevance),
    };
  });

  return scoredCourses.sort((a, b) => b.match_relevance - a.match_relevance);
}
