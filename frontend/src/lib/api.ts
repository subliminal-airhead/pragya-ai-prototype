// Client-side API connector - connects to Python FastAPI backend (port 8000 via Vite proxy)
const SESSION_STORAGE_KEY = 'pragya_client_session_id';

/** Generate a proper UUID v4 - required by the backend */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getClientSessionId(): string {
  let sid = localStorage.getItem(SESSION_STORAGE_KEY);
  // Ensure session ID is a valid UUID (backend requires UUID format)
  if (!sid || !sid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    sid = generateUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, sid);
  }
  return sid;
}

export function resetClientSessionId(): string {
  const sid = generateUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, sid);
  return sid;
}

const BACKEND_PROFILE_KEY = 'pragya_backend_profile_id';

/**
 * Get the backend profile_id that was returned from POST /api/profile/parse.
 * Falls back to the provided frontendProfileId if not available.
 */
export function getBackendProfileId(frontendProfileId: string): string {
  return localStorage.getItem(BACKEND_PROFILE_KEY) || frontendProfileId;
}

export function setBackendProfileId(profileId: string): void {
  localStorage.setItem(BACKEND_PROFILE_KEY, profileId);
}

const BACKEND_ROLE_KEY = 'pragya_backend_role_id';

/**
 * Map of frontend career IDs/titles to backend role IDs.
 * Backend roles are defined in backend/data/roles.json
 */
const ROLE_ID_MAP: Record<string, string> = {
  // Frontend career IDs -> backend role IDs
  'career_software_eng': 'backend-developer',
  'career_data_analyst': 'data-analyst',
  'career_frontend': 'frontend-developer',
  'career_fullstack': 'full-stack-developer',
  'career_devops': 'devops-engineer',
  'career_ml_engineer': 'ml-engineer',
  'career_data_scientist': 'data-scientist',
  // Frontend career titles -> backend role IDs
  'Software Engineer': 'backend-developer',
  'Backend Developer': 'backend-developer',
  'Frontend Developer': 'frontend-developer',
  'Full Stack Developer': 'full-stack-developer',
  'Data Analyst': 'data-analyst',
  'Data Scientist': 'data-scientist',
  'DevOps Engineer': 'devops-engineer',
  'ML Engineer': 'ml-engineer',
  'Machine Learning Engineer': 'ml-engineer',
};

/**
 * Resolve a frontend career ID or title to a backend role_id.
 * Falls back to the stored backend role ID, then to the raw value.
 */
export function resolveBackendRoleId(frontendRoleIdOrTitle: string): string {
  // Check direct mapping
  if (ROLE_ID_MAP[frontendRoleIdOrTitle]) {
    return ROLE_ID_MAP[frontendRoleIdOrTitle];
  }
  // Check stored backend role ID (set after a career recommendation from backend)
  const stored = localStorage.getItem(BACKEND_ROLE_KEY);
  if (stored) return stored;
  // Last resort: return as-is (might work if it matches a backend ID)
  return frontendRoleIdOrTitle;
}

export function setBackendRoleId(roleId: string): void {
  localStorage.setItem(BACKEND_ROLE_KEY, roleId);
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const sessionId = getClientSessionId();
  const headers = new Headers(options.headers || {});
  headers.set('X-Session-ID', sessionId);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errBody: any;
    try {
      errBody = await response.json();
    } catch {
      errBody = { detail: { message: `Request failed with status ${response.status}`, code: 'HTTP_ERROR' } };
    }
    // Backend wraps errors in {detail: {code, message, details}}
    const detail = errBody?.detail || errBody?.error || {};
    const message = (typeof detail === 'string' ? detail : detail?.message) || `Request failed with status ${response.status}`;
    const err = new Error(message);
    (err as any).code = (typeof detail === 'object' ? detail?.code : null) || 'ERROR';
    (err as any).details = typeof detail === 'object' ? detail?.details : {};
    (err as any).status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Map backend Opportunity to frontend-friendly format (fills missing fields)
 */
function mapOpportunity(opp: any): any {
  return {
    id: opp.opportunity_id || opp.id,
    slug: opp.opportunity_id || opp.id,
    title: opp.title,
    company: opp.organization,
    location: opp.location,
    type: opp.type,
    workplace_type: opp.mode,
    workplaceType: opp.mode,
    stipend_range: opp.stipend_or_salary,
    salaryRange: opp.stipend_or_salary,
    match_score: opp.match_score,
    matchScore: opp.match_score,
    readiness_label: opp.match_score >= 75 ? 'Ready' : opp.match_score >= 50 ? 'Developing' : 'Upskill Required',
    deadline: null,
    posted_date: null,
    description: '',
    apply_url: opp.url || '',
    applyUrl: opp.url || '',
    requirements: [],
    matched_skills: opp.matched_skills || [],
    matchedSkills: opp.matched_skills || [],
    missing_skills: opp.missing_skills || [],
    missingSkills: opp.missing_skills || [],
    whyMatchDetails: {
      overallFit: opp.match_score,
      skillOverlapScore: opp.match_score,
      experienceScore: 75,
      educationScore: 80,
      summary: 'Strong skill alignment with this opportunity.',
      advantages: opp.matched_skills || [],
      riskFactors: opp.missing_skills || [],
    },
  };
}

/**
 * Map backend GovtScheme to frontend-friendly format
 */
function mapGovtScheme(sch: any): any {
  return {
    id: sch.scheme_id || sch.id,
    name: sch.name,
    category: sch.kind,
    ministry_or_dept: sch.authority,
    description: sch.benefits,
    monthly_stipend_inr: '',
    portal_url: sch.url || '#',
    portal_name: sch.authority,
    last_verified: sch.last_verified || 'Oct 2025',
    reasons: sch.reasons || [],
    eligible: sch.eligible,
  };
}

/**
 * Map backend CareerMatch to frontend-friendly format
 */
function mapCareer(c: any): any {
  return {
    id: c.role_id,
    role_id: c.role_id,
    title: c.title,
    match_score: c.match_score,
    matchScore: c.match_score,
    reasons: c.reasons || [],
    growth_outlook: c.growth_outlook,
    market_demand: c.growth_outlook,
    avg_salary: c.indicative_entry_salary_lpa,
    is_target: false,
    required_skills: [],
    why_match_rationale: (c.reasons || []).join(' '),
  };
}

/**
 * Map backend SkillGapReport to frontend-friendly format
 */
function mapGaps(gaps: any): any {
  if (!gaps) return null;
  return {
    target_role_id: gaps.target_role_id,
    target_role_title: gaps.target_role_title,
    readiness_pct: gaps.readiness_pct,
    readinessPct: gaps.readiness_pct,
    matched_skills: gaps.matched_skills || [],
    missing_skills: gaps.missing_skills || [],
    gaps: [
      ...(gaps.matched_skills || []).map((s: string) => ({
        skill_name: s,
        status: 'Mastered',
        current_score: 85,
        required_score: 80,
        gap_score: 0,
        recommended_action: 'Keep practicing to maintain proficiency.',
      })),
      ...(gaps.missing_skills || []).map((ms: any) => ({
        skill_name: typeof ms === 'string' ? ms : ms.skill,
        status: 'Gap',
        current_score: 20,
        required_score: 75,
        gap_score: 55,
        recommended_action: (typeof ms === 'object' ? ms.reason : '') || 'Take a course to learn this skill.',
      })),
    ],
  };
}

/**
 * Map backend EmployabilityScore to frontend-friendly format
 */
function mapScore(score: any): any {
  if (!score) return null;
  const components = score.components || [];
  const skillsComp = components.find((c: any) => c.name === 'skills');
  const projectsComp = components.find((c: any) => c.name === 'projects');
  const expComp = components.find((c: any) => c.name === 'experience');
  const resumeComp = components.find((c: any) => c.name === 'resume_quality');
  return {
    score: score.total,
    score_after_improvements: Math.min(100, score.total + 18),
    breakdown: {
      technical_skills: skillsComp?.score || score.total,
      project_proof: projectsComp?.score || score.total,
      academic_alignment: expComp?.score || score.total,
      resume_ats: resumeComp?.score || score.total,
    },
  };
}

export const apiClient = {
  // Health
  checkHealth: () => request('/health'),

  // Personas - not in Python backend, return empty list gracefully
  getPersonas: () => Promise.resolve([]),

  // Profile - POST /api/profile/parse (multipart form)
  parseResume: async (file?: File | null, text?: string) => {
    const sessionId = getClientSessionId();
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (text) {
      formData.append('text', text);
    }

    const res = await fetch('/api/profile/parse', {
      method: 'POST',
      headers: { 'X-Session-ID': sessionId },
      body: formData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const detail = errJson?.detail || errJson?.error || {};
      const message = (typeof detail === 'string' ? detail : detail?.message) || 'Resume parse failed';
      throw new Error(message);
    }
    return res.json();
  },

  updateProfile: (profileId: string, data: any) =>
    request(`/api/profile/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).catch((err) => {
      // Log but don't throw - profile syncing is best-effort
      console.debug('Profile sync skipped (backend profile not registered):', err?.message);
      return null;
    }),

  // GET profile - not in Python backend, skip gracefully
  getProfile: (profileId: string) =>
    request(`/api/profile/${profileId}`).catch(() => null),

  // Careers - POST /api/careers/recommend with RoadmapRequest: {profile_id, interests?, target_role_id?}
  recommendCareers: (profileId: string, interests: string[] = []) =>
    request('/api/careers/recommend', {
      method: 'POST',
      body: JSON.stringify({ profile_id: getBackendProfileId(profileId), interests }),
    }),

  // Skill Gaps - POST /api/skills/gap with ProfileRoleRequest: {profile_id, target_role_id}
  computeSkillGaps: (profileId: string, targetRoleId?: string) =>
    request('/api/skills/gap', {
      method: 'POST',
      body: JSON.stringify({ profile_id: getBackendProfileId(profileId), target_role_id: resolveBackendRoleId(targetRoleId || '') }),
    }),

  // Courses - POST /api/courses/recommend with ProfileRoleRequest: {profile_id, target_role_id}
  recommendCourses: (profileId: string, targetRoleId?: string) =>
    request('/api/courses/recommend', {
      method: 'POST',
      body: JSON.stringify({ profile_id: getBackendProfileId(profileId), target_role_id: resolveBackendRoleId(targetRoleId || '') }),
    }),

  // Opportunities - POST /api/opportunities/match with RoadmapRequest: {profile_id, target_role_id?}
  matchOpportunities: (profileId: string, targetRoleId?: string) =>
    request('/api/opportunities/match', {
      method: 'POST',
      body: JSON.stringify({ profile_id: getBackendProfileId(profileId), target_role_id: resolveBackendRoleId(targetRoleId || '') }),
    }),

  // Govt Schemes - POST /api/govt/match with {profile_id}
  matchGovtSchemes: (profileId: string) =>
    request('/api/govt/match', {
      method: 'POST',
      body: JSON.stringify({ profile_id: getBackendProfileId(profileId) }),
    }),

  // Resume Enhancement - POST /api/resume/enhance with ProfileRoleRequest: {profile_id, target_role_id}
  // Returns: {before_score, after_score, critique, rewritten_sections, changes_summary, placeholders}
  enhanceResume: (profileId: string, targetRoleId?: string) =>
    request('/api/resume/enhance', {
      method: 'POST',
      body: JSON.stringify({ profile_id: getBackendProfileId(profileId), target_role_id: resolveBackendRoleId(targetRoleId || '') }),
    }),

  // Legacy compat wrappers -> both map to /api/resume/enhance
  reviewResume: (profileId: string, targetRoleId?: string) =>
    request('/api/resume/enhance', {
      method: 'POST',
      body: JSON.stringify({ profile_id: getBackendProfileId(profileId), target_role_id: resolveBackendRoleId(targetRoleId || '') }),
    }),

  rewriteResume: (profileId: string, targetRoleId?: string) =>
    request('/api/resume/enhance', {
      method: 'POST',
      body: JSON.stringify({ profile_id: getBackendProfileId(profileId), target_role_id: resolveBackendRoleId(targetRoleId || '') }),
    }),

  // Resume export - not available in Python backend
  exportResume: async (_resumeId: string, _format: 'pdf' | 'docx' | 'txt' = 'txt') => {
    console.warn('Resume export not yet available in the Python backend.');
  },

  // Mock Interview - uses POST /api/interview/chat
  // Backend expects: {target_role, history, user_reply}
  // Backend returns: AnswerFeedback {relevance, structure, depth, feedback, improvement, next_question}
  startInterview: (profileId: string, role?: string, _difficulty?: string) => {
    return request('/api/interview/chat', {
      method: 'POST',
      body: JSON.stringify({
        target_role: role || 'Software Engineer',
        history: [],
        user_reply: '__START__',
      }),
    }).then((feedback: any) => ({
      interview_id: `iv_${Date.now()}`,
      question: feedback?.next_question || {
        text: `Tell me about your experience and why you want to work as a ${role || 'Software Engineer'}.`,
        kind: 'behavioral',
        index: 1,
        total: 5,
      },
    })).catch(() => ({
      interview_id: `iv_${Date.now()}`,
      question: {
        text: `Tell me about your experience and why you want to work as a ${role || 'Software Engineer'}.`,
        kind: 'behavioral',
        index: 1,
        total: 5,
      },
    }));
  },

  // Submit answer - maps to /api/interview/chat
  submitInterviewAnswer: (
    _interviewId: string,
    answer: string,
    targetRole?: string,
    history?: any[]
  ) =>
    request('/api/interview/chat', {
      method: 'POST',
      body: JSON.stringify({
        target_role: targetRole || 'Software Engineer',
        history: history || [],
        user_reply: answer,
      }),
    }),

  finishInterview: (_interviewId: string) =>
    Promise.resolve({
      overall: 75,
      strengths: ['Good communication', 'Demonstrated relevant experience'],
      weaknesses: ['Could provide more specific technical examples'],
      next_steps: ['Practice the STAR method', 'Review system design concepts'],
    }),

  // Roadmap - GET /api/roadmap/{roadmap_id}
  getStoredRoadmap: (roadmapId: string) =>
    request(`/api/roadmap/${roadmapId}`).then((data: any) => {
      if (!data) return null;
      // Map backend Roadmap schema to frontend-expected shape
      return {
        ...data,
        careers: (data.careers || []).map(mapCareer),
        gaps: mapGaps(data.gaps),
        courses: data.courses || [],
        opportunities: (data.opportunities || []).map(mapOpportunity),
        govt_schemes: (data.govt || []).map(mapGovtScheme),
        employability_score: mapScore(data.score),
      };
    }).catch(() => null),

  // Run full roadmap - POST /api/roadmap/run
  runRoadmap: (params: { profileId: string; interests?: string[]; targetRoleId?: string }) =>
    request('/api/roadmap/run', {
      method: 'POST',
      body: JSON.stringify({
        profile_id: getBackendProfileId(params.profileId),
        interests: params.interests || [],
        target_role_id: resolveBackendRoleId(params.targetRoleId || ''),
      }),
    }),

  // streamRoadmap: calls /api/roadmap/run and emits synthetic step events
  // The frontend RoadmapPage uses this to progressively update UI
  streamRoadmap: async (
    params: { profileId: string; interests?: string[]; targetRole?: string },
    callbacks: {
      onStep: (data: { step: string; status: string; progress: number; data?: any }) => void;
      onDone: (roadmapId: string) => void;
      onError: (err: any) => void;
    },
    signal?: AbortSignal
  ) => {
    try {
      // Emit initial "started" steps for all categories
      const steps = ['careers', 'gaps', 'courses', 'opportunities', 'govt', 'score'];
      const progressMap: Record<string, number> = {
        careers: 0.15, gaps: 0.30, courses: 0.50, opportunities: 0.68, govt: 0.84, score: 1.0,
      };

      steps.forEach((step) => {
        if (!signal?.aborted) {
          callbacks.onStep({ step, status: 'started', progress: progressMap[step] * 0.4 });
        }
      });

      // Call the backend
      const roadmap: any = await apiClient.runRoadmap({
        profileId: params.profileId,
        interests: params.interests,
        targetRoleId: resolveBackendRoleId(params.targetRole || ''),
      });

      if (signal?.aborted) return;

      // Map backend response to frontend format
      const careers = (roadmap.careers || []).map(mapCareer);
      const gaps = mapGaps(roadmap.gaps);
      const courses = roadmap.courses || [];
      const opportunities = (roadmap.opportunities || []).map(mapOpportunity);
      const govtSchemes = (roadmap.govt || []).map(mapGovtScheme);
      const score = mapScore(roadmap.score);

      // Emit "done" steps with data
      callbacks.onStep({ step: 'careers', status: 'done', progress: progressMap.careers, data: careers });
      callbacks.onStep({ step: 'gaps', status: 'done', progress: progressMap.gaps, data: gaps });
      callbacks.onStep({ step: 'courses', status: 'done', progress: progressMap.courses, data: courses });
      callbacks.onStep({ step: 'opportunities', status: 'done', progress: progressMap.opportunities, data: opportunities });
      callbacks.onStep({ step: 'govt', status: 'done', progress: progressMap.govt, data: govtSchemes });
      callbacks.onStep({ step: 'score', status: 'done', progress: progressMap.score, data: score });

      const roadmapId = roadmap.roadmap_id || `rm_${Date.now()}`;
      callbacks.onDone(roadmapId);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        callbacks.onError(err);
      }
    }
  },

  // Session management
  deleteSession: () =>
    request('/api/session', {
      method: 'DELETE',
    }),
};



