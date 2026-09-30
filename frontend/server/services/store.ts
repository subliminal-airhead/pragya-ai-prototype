import personasData from '../data/personas.json';

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  headline?: string;
  university?: string;
  degree?: string;
  major?: string;
  grad_year?: string;
  cgpa?: string;
  location?: string;
  target_role?: string;
  interests: string[];
  skills: Array<{ name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; verified: boolean }>;
  projects: Array<{ title: string; tech_stack: string[]; bullets: string[]; link?: string }>;
  experiences?: Array<{ role: string; company: string; location?: string; start_date?: string; end_date?: string; bullets?: string[] }>;
  summary?: string;
  raw_resume_text?: string;
  resume_file_name?: string;
  ats_score?: number;
  ats_breakdown?: {
    parseability: number;
    quantification: number;
    keyword_density: number;
    impact: number;
  };
}

export interface StoredRoadmap {
  id: string;
  profile_id: string;
  target_role: string;
  created_at: string;
  employability_score: {
    score: number;
    score_after_improvements: number;
    breakdown: {
      technical_skills: number;
      project_proof: number;
      academic_alignment: number;
      resume_ats: number;
    };
  };
  careers: any[];
  gaps: any;
  courses: any[];
  opportunities: any[];
  govt_schemes: any[];
}

export interface InterviewSession {
  id: string;
  profile_id: string;
  role: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: Array<{
    id: number;
    question: string;
    scenario: string;
    key_points: string[];
  }>;
  answers: Array<{
    question_number: number;
    question: string;
    answer: string;
    feedback: {
      score: number;
      strengths: string[];
      improvements: string[];
      technical_depth: number;
      communication: number;
    };
  }>;
  current_step: number;
  completed: boolean;
  final_summary?: any;
}

// In-memory persistent state stores keyed by session ID or entity ID
class MemoryStore {
  private profiles = new Map<string, StudentProfile>();
  private roadmaps = new Map<string, StoredRoadmap>();
  private interviews = new Map<string, InterviewSession>();
  private sessionToProfile = new Map<string, string>();

  constructor() {
    // Seed default demo personas
    for (const p of personasData) {
      const profile: StudentProfile = {
        id: p.id,
        full_name: p.name,
        email: p.email,
        phone: p.phone,
        headline: p.headline,
        university: p.university,
        degree: p.degree,
        major: p.major,
        grad_year: p.grad_year,
        cgpa: p.cgpa,
        location: p.location,
        target_role: p.target_role,
        interests: p.interests || [],
        skills: p.skills as any,
        projects: p.projects || [],
        raw_resume_text: p.raw_resume_text,
        ats_score: 82,
        ats_breakdown: {
          parseability: 94,
          quantification: 78,
          keyword_density: 85,
          impact: 80,
        },
      };
      this.profiles.set(p.id, profile);
      this.profiles.set(p.email.toLowerCase(), profile);
    }
  }

  getProfile(idOrEmail: string): StudentProfile | undefined {
    if (!idOrEmail) return undefined;
    const direct = this.profiles.get(idOrEmail);
    if (direct) return direct;

    const lower = idOrEmail.toLowerCase().trim();
    const byLower = this.profiles.get(lower);
    if (byLower) return byLower;

    // Support lookup by short persona slug e.g. 'divyansh', 'pooja', 'rahul'
    const personaPrefixed = this.profiles.get(`persona_${lower}`);
    if (personaPrefixed) return personaPrefixed;

    // Support lookup without 'persona_' prefix
    const stripped = lower.replace(/^persona_/, '');
    for (const [key, p] of this.profiles.entries()) {
      if (key.toLowerCase().includes(stripped) || p.id.toLowerCase().includes(stripped) || p.full_name.toLowerCase().includes(stripped)) {
        return p;
      }
    }

    return undefined;
  }

  saveProfile(profile: StudentProfile, sessionId?: string): void {
    this.profiles.set(profile.id, profile);
    if (profile.email) {
      this.profiles.set(profile.email.toLowerCase(), profile);
    }
    if (sessionId) {
      this.sessionToProfile.set(sessionId, profile.id);
    }
  }

  getProfileForSession(sessionId: string): StudentProfile | undefined {
    const profileId = this.sessionToProfile.get(sessionId);
    if (profileId) {
      return this.profiles.get(profileId);
    }
    return undefined;
  }

  saveRoadmap(roadmap: StoredRoadmap): void {
    this.roadmaps.set(roadmap.id, roadmap);
  }

  getRoadmap(id: string): StoredRoadmap | undefined {
    return this.roadmaps.get(id);
  }

  saveInterview(interview: InterviewSession): void {
    this.interviews.set(interview.id, interview);
  }

  getInterview(id: string): InterviewSession | undefined {
    return this.interviews.get(id);
  }

  clearSession(sessionId: string): void {
    const profileId = this.sessionToProfile.get(sessionId);
    if (profileId) {
      this.profiles.delete(profileId);
      this.sessionToProfile.delete(sessionId);
    }
    // Also remove any roadmaps associated
    for (const [id, r] of this.roadmaps.entries()) {
      if (r.profile_id === profileId) {
        this.roadmaps.delete(id);
      }
    }
  }
}

export const store = new MemoryStore();
