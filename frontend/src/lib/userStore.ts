import {
  UserProfile,
  ApplicationStage,
  Course,
  Project,
  MockInterviewResult,
} from '../types';
import { personas } from './personas';
import {
  courses as defaultCourses,
  projects as defaultProjects,
} from './data';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  profile: UserProfile;
  opportunityOverrides: Record<string, { stage?: ApplicationStage; notes?: string; appliedDate?: string }>;
  courses: Course[];
  projects: Project[];
  tasks: Record<string, boolean>;
  skillBonus: Record<string, number>;
  interviewResults: MockInterviewResult[];
  createdAt: string;
}

const ACCOUNTS_STORAGE_KEY = 'pragya_accounts_db';
const ACTIVE_USER_ID_KEY = 'pragya_active_user_id';

export function createGuestAccount(): UserAccount {
  return {
    id: 'guest',
    email: '',
    password: '',
    profile: {
      id: 'guest',
      fullName: 'New Candidate',
      email: '',
      phone: '',
      headline: 'Engineering Candidate • Awaiting Resume Upload',
      university: 'University / Institute',
      degree: 'B.Tech / B.S. in Computer Science',
      major: 'Computer Science',
      gradYear: '2027',
      cgpa: '',
      location: 'Madhya Pradesh / Remote',
      bio: 'Upload your resume to calibrate verified engineering skills, calculate ATS readiness scores, and discover personalized opportunities.',
      targetCareerId: 'career_software_eng',
      targetTimeline: 'Summer 2027',
      preferredWorkType: ['Remote', 'Hybrid'],
      preferredLocations: ['Bhopal', 'Indore', 'Remote'],
      skills: [],
      experiences: [],
      projects: [],
      resumeUploaded: false,
      resumeFileName: undefined,
      resumeAtsScore: undefined,
      resumeLastAnalyzed: undefined,
      resumeSummary: undefined,
      personaId: 'custom',
    },
    opportunityOverrides: {},
    courses: defaultCourses.map((c) => ({ ...c, enrolled: false, progressPercent: 0 })),
    projects: defaultProjects.map((p) => ({ ...p, completed: false })),
    tasks: {},
    skillBonus: {},
    interviewResults: [],
    createdAt: new Date().toISOString(),
  };
}

function createDefaultAccounts(): Record<string, UserAccount> {
  const accounts: Record<string, UserAccount> = {};

  // 1. Divyansh Joshi
  const divyanshProfile = personas.divyansh;
  accounts[divyanshProfile.email.toLowerCase()] = {
    id: divyanshProfile.id,
    email: divyanshProfile.email.toLowerCase(),
    password: 'password123',
    profile: divyanshProfile,
    opportunityOverrides: {
      opp_abc_tech_software: { stage: 'Saved' },
      opp_persistent_cloud_trainee: { stage: 'Applied', appliedDate: 'Sep 28, 2026' },
    },
    courses: defaultCourses,
    projects: defaultProjects,
    tasks: { t1: true, t2: true, t3: true, t4: true },
    skillBonus: {},
    interviewResults: [],
    createdAt: '2026-09-01T00:00:00Z',
  };

  // 2. Pooja Sharma
  const poojaProfile = personas.pooja;
  accounts[poojaProfile.email.toLowerCase()] = {
    id: poojaProfile.id,
    email: poojaProfile.email.toLowerCase(),
    password: 'password123',
    profile: poojaProfile,
    opportunityOverrides: {},
    courses: defaultCourses,
    projects: defaultProjects,
    tasks: { t1: true },
    skillBonus: {},
    interviewResults: [],
    createdAt: '2026-09-10T00:00:00Z',
  };

  // 3. Rahul Verma
  const rahulProfile = personas.rahul;
  accounts[rahulProfile.email.toLowerCase()] = {
    id: rahulProfile.id,
    email: rahulProfile.email.toLowerCase(),
    password: 'password123',
    profile: rahulProfile,
    opportunityOverrides: {},
    courses: defaultCourses,
    projects: defaultProjects,
    tasks: { t1: true },
    skillBonus: {},
    interviewResults: [],
    createdAt: '2026-09-15T00:00:00Z',
  };

  return accounts;
}

export function getAllAccounts(): Record<string, UserAccount> {
  const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }

  const defaults = createDefaultAccounts();
  saveAllAccounts(defaults);
  return defaults;
}

export function saveAllAccounts(accounts: Record<string, UserAccount>): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to localStorage', e);
  }
}

export function getAccountByEmail(email: string): UserAccount | undefined {
  const accounts = getAllAccounts();
  return accounts[email.trim().toLowerCase()];
}

export function getAccountById(id: string): UserAccount | undefined {
  const accounts = getAllAccounts();
  return Object.values(accounts).find((acc) => acc.id === id);
}

export function saveUserAccount(account: UserAccount): void {
  const accounts = getAllAccounts();
  const cleanEmail = account.email.trim().toLowerCase();
  // Remove any stale keys for this same account id if email changed
  for (const [key, acc] of Object.entries(accounts)) {
    if (acc.id === account.id && key !== cleanEmail) {
      delete accounts[key];
    }
  }
  accounts[cleanEmail] = account;
  saveAllAccounts(accounts);
}

export function getActiveUserId(): string | null {
  return localStorage.getItem(ACTIVE_USER_ID_KEY);
}

export function setActiveUserId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_USER_ID_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
  }
}

export function createNewUserAccount(
  fullName: string,
  email: string,
  password: string
): UserAccount {
  const accounts = getAllAccounts();
  const cleanEmail = email.trim().toLowerCase();
  const newId = `usr_${Date.now()}`;

  const newProfile: UserProfile = {
    id: newId,
    fullName: fullName.trim(),
    email: cleanEmail,
    phone: '',
    headline: 'Engineering Candidate • Awaiting Resume Upload',
    university: 'University / Institute',
    degree: 'Bachelor of Technology (B.Tech)',
    major: 'Computer Science',
    gradYear: '2027',
    cgpa: '',
    location: 'Madhya Pradesh / Remote',
    bio: 'Upload your resume to extract your verified engineering competencies, calculate role match scores, and unlock personalized opportunities.',
    targetCareerId: 'career_software_eng',
    targetTimeline: 'Summer 2027',
    preferredWorkType: ['Remote', 'Hybrid'],
    preferredLocations: ['Bhopal', 'Indore', 'Remote'],
    skills: [],
    experiences: [],
    projects: [],
    resumeUploaded: false,
    resumeFileName: undefined,
    resumeAtsScore: undefined,
    resumeLastAnalyzed: undefined,
    resumeSummary: undefined,
    personaId: 'custom',
  };

  const newAccount: UserAccount = {
    id: newId,
    email: cleanEmail,
    password,
    profile: newProfile,
    opportunityOverrides: {},
    courses: defaultCourses.map((c) => ({ ...c, enrolled: false, progressPercent: 0 })),
    projects: defaultProjects.map((p) => ({ ...p, completed: false })),
    tasks: {},
    skillBonus: {},
    interviewResults: [],
    createdAt: new Date().toISOString(),
  };

  accounts[cleanEmail] = newAccount;
  saveAllAccounts(accounts);
  return newAccount;
}
