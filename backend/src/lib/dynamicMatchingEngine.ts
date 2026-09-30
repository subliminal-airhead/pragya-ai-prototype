import {
  UserProfile,
  CareerPath,
  SkillGap,
  Opportunity,
  RoadmapMilestone,
  SkillLevel,
} from '../types';
import {
  careerPaths as baseCareerPaths,
  skillsCatalogue as baseSkillsCatalogue,
  opportunities as baseOpportunities,
} from './data';

const LEVEL_WEIGHTS: Record<SkillLevel, number> = {
  Beginner: 40,
  Intermediate: 75,
  Advanced: 95,
  Expert: 100,
};

export function computeCareerPaths(user: UserProfile): CareerPath[] {
  if (!user.resumeUploaded || user.skills.length === 0) {
    return baseCareerPaths.map((career) => ({
      ...career,
      matchScore: 0,
      isTarget: career.id === user.targetCareerId,
      requiredSkills: career.requiredSkills.map((req) => ({
        ...req,
        userMatches: false,
      })),
      whyMatchRationale: {
        strengths: ['Upload your resume to parse and verify your technical competencies.'],
        gaps: career.requiredSkills.slice(0, 3).map((r) => `Requires verified evidence for ${r.name}`),
        verdict: `Awaiting resume upload for ${user.fullName}. Upload your resume to benchmark against ${career.title}.`,
      },
    }));
  }

  const userSkillMap = new Map<string, SkillLevel>();
  user.skills.forEach((s) => {
    userSkillMap.set(s.name.toLowerCase(), s.level);
  });

  return baseCareerPaths.map((career) => {
    let matchedWeight = 0;
    let totalWeight = 0;
    const evaluatedSkills = career.requiredSkills.map((req) => {
      const userLevel = userSkillMap.get(req.name.toLowerCase());
      const hasSkill = Boolean(userLevel);
      const reqWeight = LEVEL_WEIGHTS[req.level] || 80;
      totalWeight += reqWeight;
      let skillScore = 0;
      if (userLevel) {
        const userLevelScore = LEVEL_WEIGHTS[userLevel] || 50;
        skillScore = Math.min(reqWeight, userLevelScore);
        matchedWeight += skillScore;
      }
      return {
        ...req,
        userMatches: hasSkill && (LEVEL_WEIGHTS[userLevel || 'Beginner'] >= reqWeight * 0.75),
      };
    });

    const rawMatch = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
    const isMajorAligned =
      user.major.toLowerCase().includes('computer') ||
      user.major.toLowerCase().includes('ai') ||
      user.major.toLowerCase().includes('data') ||
      user.major.toLowerCase().includes('software');
    const educationBonus = isMajorAligned ? 4 : -2;
    const matchScore = Math.min(98, Math.max(25, Math.round(rawMatch * 0.95 + educationBonus)));

    const matchedSkillNames = evaluatedSkills.filter((s) => s.userMatches).map((s) => s.name);
    const missingSkillNames = evaluatedSkills.filter((s) => !s.userMatches).map((s) => s.name);

    const strengths: string[] = [];
    if (matchedSkillNames.length > 0) {
      strengths.push(
        `Direct competency match in ${matchedSkillNames.slice(0, 3).join(', ')} extracted from ${user.resumeFileName || 'your uploaded resume'}`
      );
    }
    if (user.university && user.university !== 'University / Institute') {
      strengths.push(
        `Academic credentials in ${user.degree} (${user.major}) at ${user.university} with ${user.cgpa} CGPA`
      );
    }
    if (user.projects && user.projects.length > 0) {
      strengths.push(
        `Portfolio deliverable from "${user.projects[0].title}" verified from resume`
      );
    }

    const gaps: string[] = [];
    if (missingSkillNames.length > 0) {
      missingSkillNames.slice(0, 2).forEach((gapName) => {
        gaps.push(`Missing verified artifact in uploaded resume for ${gapName}`);
      });
    } else {
      gaps.push('Refine quantified latency metrics and scale benchmarks in project repositories');
    }

    const verdict =
      matchScore >= 80
        ? `High-probability trajectory based on uploaded resume for ${user.fullName.split(' ')[0]}. Closing the remaining ${100 - matchScore}% readiness delta by completing recommended lab modules will position you in the top 10% of applicants.`
        : `Viable transition path. Resume indicates need for targeted bridge deliverables in ${missingSkillNames.slice(0, 2).join(' & ')} before final application dispatch.`;

    return {
      ...career,
      matchScore,
      isTarget: career.id === user.targetCareerId,
      requiredSkills: evaluatedSkills,
      whyMatchRationale: {
        strengths,
        gaps,
        verdict,
      },
    };
  });
}

export function computeSkillGaps(user: UserProfile, targetCareer: CareerPath): SkillGap[] {
  if (!user.resumeUploaded || user.skills.length === 0) {
    return targetCareer.requiredSkills.map((reqSkill, idx) => ({
      skill: {
        id: `skill_${reqSkill.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: reqSkill.name,
        category: 'Core CS' as const,
        requiredLevel: reqSkill.level,
        importance: (idx < 2 ? 'Critical' : 'Important') as 'Critical' | 'Important',
        inDemandScore: 90 - idx * 4,
        description: `Target standard for ${targetCareer.title}`,
      },
      currentScore: 0,
      requiredScore: LEVEL_WEIGHTS[reqSkill.level] || 85,
      gapScore: LEVEL_WEIGHTS[reqSkill.level] || 85,
      status: 'Action Needed',
      recommendedAction: 'Upload your resume to extract and verify this competency.',
      estimatedHoursToClose: 20,
    }));
  }

  const userSkillMap = new Map<string, { level: SkillLevel; verified: boolean }>();
  user.skills.forEach((s) => {
    userSkillMap.set(s.name.toLowerCase(), { level: s.level, verified: s.verified });
  });

  return targetCareer.requiredSkills.map((reqSkill, idx) => {
    const userEntry = userSkillMap.get(reqSkill.name.toLowerCase());
    const catalogueItem = baseSkillsCatalogue.find(
      (s) => s.name.toLowerCase() === reqSkill.name.toLowerCase()
    ) || {
      id: `skill_${reqSkill.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: reqSkill.name,
      category: 'Core CS' as const,
      userLevel: userEntry?.level,
      requiredLevel: reqSkill.level,
      importance: (idx < 2 ? 'Critical' : 'Important') as 'Critical' | 'Important',
      inDemandScore: 90 - idx * 4,
      description: `Target benchmark for ${targetCareer.title}`,
    };

    let currentScore = 0;
    if (userEntry) {
      currentScore = LEVEL_WEIGHTS[userEntry.level] || 60;
      if (userEntry.verified) currentScore = Math.min(100, currentScore + 10);
    }
    const requiredScore = LEVEL_WEIGHTS[reqSkill.level] || 85;
    const gapScore = Math.max(0, requiredScore - currentScore);
    const status: 'Mastered' | 'In Progress' | 'Action Needed' =
      gapScore === 0 ? 'Mastered' : gapScore <= 20 ? 'In Progress' : 'Action Needed';
    const estimatedHoursToClose = gapScore === 0 ? 0 : Math.round(gapScore * 0.45);
    const recommendedAction =
      gapScore === 0
        ? `Verified in ${user.resumeFileName || 'uploaded resume'}. Highlight quantified metrics in your bullet points.`
        : userEntry
        ? `Elevate ${reqSkill.name} from ${userEntry.level} to ${reqSkill.level} with dedicated practice.`
        : `Missing in uploaded resume. Complete foundational module and build one verifiable feature.`;

    return {
      skill: catalogueItem,
      currentScore,
      requiredScore,
      gapScore,
      status,
      recommendedAction,
      estimatedHoursToClose,
    };
  });
}

export function computeOpportunities(user: UserProfile, targetCareer: CareerPath): Opportunity[] {
  if (!user.resumeUploaded || user.skills.length === 0) {
    return baseOpportunities.map((opp) => ({
      ...opp,
      matchScore: 0,
      readinessLabel: 'Bridge Needed',
      matchedSkills: [],
      missingSkills: Array.from(new Set([...opp.matchedSkills, ...opp.missingSkills])),
      requirements: opp.requirements.map((r) => ({ ...r, satisfied: false })),
      whyMatchDetails: {
        overallFit: 0,
        skillOverlapScore: 0,
        experienceScore: 0,
        educationScore: 0,
        summary: 'Upload your resume to benchmark your compatibility with this position.',
        advantages: ['Upload your resume to unlock candidate matching signals.'],
        riskFactors: ['Resume required to pass pre-flight hiring gates.'],
      },
    }));
  }

  const userSkillNames = new Set(user.skills.map((s) => s.name.toLowerCase()));
  const userCgpaNum = parseFloat(user.cgpa) || 8.0;

  return baseOpportunities.map((opp) => {
    const evaluatedReqs = opp.requirements.map((req) => {
      const lower = req.requirement.toLowerCase();
      let satisfied = false;
      const matchedSkill = Array.from(userSkillNames).find((s) => lower.includes(s));
      if (matchedSkill) {
        satisfied = true;
      } else if (lower.includes('degree') || lower.includes('b.tech') || lower.includes('education')) {
        satisfied = user.degree.length > 0;
      } else if (lower.includes('gpa') || lower.includes('cgpa')) {
        satisfied = userCgpaNum >= 7.5;
      } else if (lower.includes('git') && userSkillNames.has('git')) {
        satisfied = true;
      } else if (lower.includes('python') && userSkillNames.has('python')) {
        satisfied = true;
      } else if (lower.includes('sql') && userSkillNames.has('sql')) {
        satisfied = true;
      } else if (lower.includes('react') && userSkillNames.has('react')) {
        satisfied = true;
      }

      return {
        ...req,
        satisfied,
      };
    });

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const allRoleSkills = Array.from(new Set([...opp.matchedSkills, ...opp.missingSkills]));
    allRoleSkills.forEach((sk) => {
      if (userSkillNames.has(sk.toLowerCase())) {
        matchedSkills.push(sk);
      } else {
        missingSkills.push(sk);
      }
    });

    const skillRatio = allRoleSkills.length > 0 ? matchedSkills.length / allRoleSkills.length : 0.4;
    const reqRatio = evaluatedReqs.filter((r) => r.satisfied).length / Math.max(1, evaluatedReqs.length);

    const gpaScore = Math.min(100, Math.round((userCgpaNum / 10.0) * 100));
    const skillOverlapScore = Math.min(98, Math.max(25, Math.round(skillRatio * 100)));
    const experienceScore = Math.min(95, Math.max(30, Math.round(reqRatio * 85 + (user.projects?.length || 0) * 5)));
    const educationScore = Math.min(96, Math.max(50, gpaScore > 75 ? gpaScore : 75));
    const overallFit = Math.min(
      97,
      Math.max(25, Math.round(skillOverlapScore * 0.5 + experienceScore * 0.25 + educationScore * 0.25))
    );

    const readinessLabel: 'Ready to Apply' | 'Minor Gap' | 'Bridge Needed' =
      overallFit >= 85 ? 'Ready to Apply' : overallFit >= 70 ? 'Minor Gap' : 'Bridge Needed';

    const advantages: string[] = [
      `Extracted from ${user.resumeFileName || 'your resume'}: Verified capabilities in ${matchedSkills.slice(0, 3).join(', ')}`,
    ];
    if (user.university && user.university !== 'University / Institute') {
      advantages.push(`Academic credentials in ${user.degree} (${user.major}) at ${user.university} with ${user.cgpa} CGPA`);
    }
    if (user.projects && user.projects.length > 0) {
      advantages.push(`Practical proof demonstrated via "${user.projects[0].title}"`);
    }

    const riskFactors: string[] = [];
    if (missingSkills.length > 0) {
      riskFactors.push(`Strengthening ${missingSkills.slice(0, 2).join(' & ')} would eliminate candidate auto-screening risk.`);
    } else {
      riskFactors.push(`High competition for ${opp.type} roles; include GitHub commit activity in application note.`);
    }

    const summary = `Resume analysis matches ${user.fullName.split(' ')[0]} with ${matchedSkills.length} core competencies in ${matchedSkills.slice(0, 2).join(' & ') || 'software'}.`;

    return {
      ...opp,
      matchScore: overallFit,
      readinessLabel,
      requirements: evaluatedReqs,
      matchedSkills,
      missingSkills,
      whyMatchDetails: {
        overallFit,
        skillOverlapScore,
        experienceScore,
        educationScore,
        summary,
        advantages,
        riskFactors,
      },
    };
  });
}

export function computeRoadmapMilestones(user: UserProfile, targetCareer: CareerPath, gaps: SkillGap[]): RoadmapMilestone[] {
  const criticalGap = gaps.find((g) => g.status === 'Action Needed') || gaps[0];
  const criticalGapName = criticalGap?.skill?.name || 'Technical Foundations';

  return [
    {
      id: 'm_foundation',
      phase: 'Learn',
      title: `01 Foundation: ${criticalGapName} & Core CS`,
      description: `Bridge primary diagnostic gap in ${criticalGapName} benchmarked for ${targetCareer.title}.`,
      timeframe: user.targetTimeline || 'Target: 4 weeks',
      status: 'Current',
      tasks: [
        {
          id: 't1',
          text: `Learn ${criticalGapName} core fundamentals and syntax patterns`,
          completed: criticalGap?.status === 'Mastered',
          type: 'course',
        },
        {
          id: 't2',
          text: `Practice 25 ${criticalGapName} benchmark problems from target syllabus`,
          completed: false,
          type: 'assessment',
        },
        {
          id: 't3',
          text: `Verify solutions in candidate GitHub repository`,
          completed: false,
          type: 'project',
        },
      ],
    },
    {
      id: 'm_build',
      phase: 'Build',
      title: '02 Build: 2 Verified Portfolio Projects',
      description: `Engineer full-stack backend services aligned with ${user.major} specialization.`,
      timeframe: 'Target: 4 weeks',
      status: 'Upcoming',
      tasks: [
        {
          id: 't4',
          text: 'Architect RESTful services with automated schema validation',
          completed: user.skills.some((s) => s.name === 'REST APIs' && s.verified),
          linkTo: '/learning/skill-india-fastapi',
          type: 'course',
        },
        {
          id: 't5',
          text: `Complete "${user.projects?.[0]?.title || 'Portfolio API Project'}" repository deliverable`,
          completed: false,
          linkTo: '/projects/student-expense-api',
          type: 'project',
        },
      ],
    },
    {
      id: 'm_prove',
      phase: 'Prove',
      title: '03 Prove: ATS Resume & Mock Screener',
      description: `Calibrate ${user.resumeFileName || 'uploaded resume'} with quantified metrics and clear ${targetCareer.title} mock interviews.`,
      timeframe: 'Target: 2 weeks',
      status: 'Upcoming',
      tasks: [
        {
          id: 't6',
          text: `Achieve >=85% ATS score against ${targetCareer.title} keyword dictionary`,
          completed: (user.resumeAtsScore || 0) >= 85,
          linkTo: '/resume/review',
          type: 'resume',
        },
        {
          id: 't7',
          text: 'Pass technical interview screen on System Design architecture',
          completed: false,
          linkTo: '/interview',
          type: 'assessment',
        },
      ],
    },
    {
      id: 'm_apply',
      phase: 'Apply',
      title: '04 Apply: Pipeline Dispatch & Tracking',
      description: 'Dispatch high-match applications with verified eligibility pre-checks.',
      timeframe: 'Target: Rolling',
      status: 'Upcoming',
      tasks: [
        {
          id: 't8',
          text: 'Pass Pre-Flight Eligibility Checklist for top 3 matching roles',
          completed: false,
          linkTo: '/opportunities',
        },
        {
          id: 't9',
          text: 'Submit and track 5 targeted applications in Kanban Pipeline',
          completed: false,
          linkTo: '/opportunities/tracker',
        },
      ],
    },
  ];
}
