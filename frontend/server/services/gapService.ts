import rolesData from '../data/roles.json';
import { StudentProfile } from './store';

export interface SkillGapItem {
  skill_name: string;
  category: string;
  importance: 'Critical' | 'Important' | 'Nice-to-have';
  current_level: string;
  required_level: string;
  current_score: number;
  required_score: number;
  gap_score: number;
  status: 'Mastered' | 'In Progress' | 'Action Needed';
  recommended_action: string;
  estimated_hours_to_close: number;
  in_demand_score: number;
}

export interface SkillGapReport {
  target_role: string;
  overall_match_score: number;
  total_gaps_count: number;
  critical_gaps_count: number;
  total_estimated_hours: number;
  gaps: SkillGapItem[];
  summary: string;
}

const LEVEL_SCORES: Record<string, number> = {
  None: 0,
  Beginner: 40,
  Intermediate: 70,
  Advanced: 90,
  Expert: 98,
};

export function computeSkillGaps(profile: StudentProfile, targetRoleTitle?: string): SkillGapReport {
  const roleName = targetRoleTitle || profile.target_role || 'Software Development Engineer';
  const role = rolesData.find(
    (r) => r.title.toLowerCase().includes(roleName.toLowerCase()) || roleName.toLowerCase().includes(r.title.toLowerCase())
  ) || rolesData[0];

  const userSkillMap = new Map<string, { level: string; verified: boolean }>();
  for (const s of profile.skills || []) {
    userSkillMap.set(s.name.toLowerCase(), { level: s.level, verified: s.verified });
  }

  let totalMatched = 0;
  let totalPossible = 0;

  const gaps: SkillGapItem[] = role.required_skills.map((req, idx) => {
    const userEntry = userSkillMap.get(req.name.toLowerCase());
    const userLevel = userEntry ? userEntry.level : 'None';
    const reqScore = LEVEL_SCORES[req.level] || 85;
    let currentScore = LEVEL_SCORES[userLevel] || 0;
    if (userEntry?.verified && currentScore > 0) {
      currentScore = Math.min(100, currentScore + 8);
    }

    totalMatched += Math.min(reqScore, currentScore);
    totalPossible += reqScore;

    const gapScore = Math.max(0, reqScore - currentScore);
    const status: 'Mastered' | 'In Progress' | 'Action Needed' =
      gapScore === 0 ? 'Mastered' : gapScore <= 20 ? 'In Progress' : 'Action Needed';

    const importance = idx < 2 ? 'Critical' : idx < 4 ? 'Important' : 'Nice-to-have';
    const estimatedHours = gapScore === 0 ? 0 : Math.round(gapScore * 0.4);

    let recommendedAction = '';
    if (gapScore === 0) {
      recommendedAction = `Verified in candidate resume. Strengthen bullet points with quantified latency & scale benchmarks.`;
    } else if (userEntry) {
      recommendedAction = `Elevate ${req.name} from ${userLevel} to ${req.level} by building a practical production module.`;
    } else {
      recommendedAction = `Missing proof artifact in resume. Complete foundational NPTEL/SWAYAM module and deploy verified GitHub feature.`;
    }

    return {
      skill_name: req.name,
      category: role.category,
      importance,
      current_level: userLevel,
      required_level: req.level,
      current_score: currentScore,
      required_score: reqScore,
      gap_score: gapScore,
      status,
      recommended_action: recommendedAction,
      estimated_hours_to_close: estimatedHours,
      in_demand_score: Math.max(75, 95 - idx * 3),
    };
  });

  const overallMatch = totalPossible > 0 ? Math.round((totalMatched / totalPossible) * 100) : 50;
  const criticalGapsCount = gaps.filter((g) => g.status === 'Action Needed').length;
  const totalHours = gaps.reduce((acc, g) => acc + g.estimated_hours_to_close, 0);

  return {
    target_role: role.title,
    overall_match_score: overallMatch,
    total_gaps_count: gaps.length,
    critical_gaps_count: criticalGapsCount,
    total_estimated_hours: totalHours,
    gaps,
    summary: `Profile demonstrates ${overallMatch}% readiness for ${role.title}. ${criticalGapsCount} critical benchmarks require bridging before high-probability application submission.`,
  };
}
