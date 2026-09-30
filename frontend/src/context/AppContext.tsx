import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  CareerPath,
  SkillGap,
  Course,
  Project,
  Opportunity,
  ApplicationStage,
  RoadmapMilestone,
  MockInterviewResult,
} from '../types';
import {
  courses as defaultCourses,
  projects as defaultProjects,
} from '../lib/data';
import { personas } from '../lib/personas';
import { ParsedResumeResult } from '../lib/resumeParser';
import {
  computeCareerPaths,
  computeSkillGaps,
  computeOpportunities,
  computeRoadmapMilestones,
} from '../lib/dynamicMatchingEngine';
import {
  UserAccount,
  getAccountByEmail,
  getAccountById,
  saveUserAccount,
  getActiveUserId,
  setActiveUserId,
  createNewUserAccount,
  createGuestAccount,
} from '../lib/userStore';
import { apiClient, resetClientSessionId } from '../lib/api';

interface AppContextType {
  // Auth state
  isAuthenticated: boolean;
  currentAccount: UserAccount | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (fullName: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Active user profile & actions
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  switchPersona: (personaKey: string) => void;
  ingestResume: (parsedData: ParsedResumeResult, fileName?: string) => void;
  resetToDefault: () => void;

  // Dynamic benchmark state
  careers: CareerPath[];
  targetCareer: CareerPath;
  setTargetCareerId: (id: string) => void;

  skillGaps: SkillGap[];
  updateSkillGapScore: (skillId: string, addedScore: number) => void;

  courses: Course[];
  updateCourseProgress: (courseId: string, moduleId: string) => void;

  projects: Project[];
  toggleProjectComplete: (projectId: string) => void;

  opportunities: Opportunity[];
  updateOpportunityStage: (oppId: string, stage: ApplicationStage, notes?: string) => void;
  saveOpportunity: (oppId: string) => void;

  milestones: RoadmapMilestone[];
  toggleTaskComplete: (milestoneId: string, taskId: string) => void;

  interviewResults: MockInterviewResult[];
  addInterviewResult: (res: MockInterviewResult) => void;

  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState<UserAccount>(() => {
    const activeId = getActiveUserId();
    if (activeId) {
      const existing = getAccountById(activeId);
      if (existing) return existing;
    }
    return createGuestAccount();
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const activeId = getActiveUserId();
    return Boolean(activeId && getAccountById(activeId));
  });

  const [user, setUser] = useState<UserProfile>(currentAccount.profile);
  const [opportunityOverrides, setOpportunityOverrides] = useState<
    Record<string, { stage?: ApplicationStage; notes?: string; appliedDate?: string }>
  >(currentAccount.opportunityOverrides || {});
  const [courses, setCourses] = useState<Course[]>(currentAccount.courses || defaultCourses);
  const [projects, setProjects] = useState<Project[]>(currentAccount.projects || defaultProjects);
  const [taskCompletedMap, setTaskCompletedMap] = useState<Record<string, boolean>>(currentAccount.tasks || {});
  const [skillGapBonusMap, setSkillGapBonusMap] = useState<Record<string, number>>(currentAccount.skillBonus || {});
  const [interviewResults, setInterviewResults] = useState<MockInterviewResult[]>(currentAccount.interviewResults || []);
  const [toast, setToast] = useState<string | null>(null);

  const persistCurrentAccount = useCallback(() => {
    if (!currentAccount || currentAccount.id === 'guest') return;
    const updatedAccount: UserAccount = {
      ...currentAccount,
      profile: user,
      opportunityOverrides,
      courses,
      projects,
      tasks: taskCompletedMap,
      skillBonus: skillGapBonusMap,
      interviewResults,
    };
    saveUserAccount(updatedAccount);
  }, [currentAccount, user, opportunityOverrides, courses, projects, taskCompletedMap, skillGapBonusMap, interviewResults]);

  useEffect(() => {
    persistCurrentAccount();
  }, [persistCurrentAccount]);

  // Auth Functions
  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const account = getAccountByEmail(cleanEmail);
    if (!account) {
      return { success: false, error: 'No account found with this email. Please check your spelling or sign up.' };
    }
    if (account.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setCurrentAccount(account);
    setUser(account.profile);
    setOpportunityOverrides(account.opportunityOverrides || {});
    setCourses(account.courses || defaultCourses);
    setProjects(account.projects || defaultProjects);
    setTaskCompletedMap(account.tasks || {});
    setSkillGapBonusMap(account.skillBonus || {});
    setInterviewResults(account.interviewResults || []);
    setIsAuthenticated(true);
    setActiveUserId(account.id);
    showToast(`Welcome back, ${account.profile.fullName.split(' ')[0]}!`);
    return { success: true };
  };

  const signup = (fullName: string, email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = getAccountByEmail(cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
    }
    const newAcc = createNewUserAccount(fullName, cleanEmail, password);
    setCurrentAccount(newAcc);
    setUser(newAcc.profile);
    setOpportunityOverrides({});
    setCourses(newAcc.courses);
    setProjects(newAcc.projects);
    setTaskCompletedMap({});
    setSkillGapBonusMap({});
    setInterviewResults([]);
    setIsAuthenticated(true);
    setActiveUserId(newAcc.id);
    showToast(`Account created for ${fullName}! Let's set up your profile.`);
    return { success: true };
  };

  const logout = () => {
    persistCurrentAccount();
    setActiveUserId(null);
    setIsAuthenticated(false);
    resetClientSessionId();
    const guest = createGuestAccount();
    setCurrentAccount(guest);
    setUser(guest.profile);
    setOpportunityOverrides({});
    setCourses(guest.courses);
    setProjects(guest.projects);
    setTaskCompletedMap({});
    setSkillGapBonusMap({});
    setInterviewResults([]);
    showToast('You have been logged out.');
  };

  // 1. Dynamically compute Career Paths from candidate's profile
  const careers = useMemo(() => {
    return computeCareerPaths(user);
  }, [user]);

  const targetCareer = useMemo(() => {
    return careers.find((c) => c.id === user.targetCareerId) || careers[0];
  }, [careers, user.targetCareerId]);

  // 2. Dynamically compute Skill Gaps
  const skillGaps: SkillGap[] = useMemo(() => {
    const baseGaps = computeSkillGaps(user, targetCareer);
    return baseGaps.map((gap): SkillGap => {
      const bonus = skillGapBonusMap[gap.skill.id] || 0;
      if (bonus > 0) {
        const newCurrent = Math.min(100, gap.currentScore + bonus);
        const newGap = Math.max(0, gap.requiredScore - newCurrent);
        const status: 'Mastered' | 'In Progress' | 'Action Needed' =
          newGap === 0 ? 'Mastered' : newGap <= 20 ? 'In Progress' : 'Action Needed';
        return {
          ...gap,
          currentScore: newCurrent,
          gapScore: newGap,
          status,
        };
      }
      return gap;
    });
  }, [user, targetCareer, skillGapBonusMap]);

  // 3. Dynamically compute Opportunities
  const opportunities = useMemo(() => {
    const baseOpps = computeOpportunities(user, targetCareer);
    return baseOpps.map((opp) => {
      const override = opportunityOverrides[opp.id];
      if (override) {
        return {
          ...opp,
          stage: override.stage !== undefined ? override.stage : opp.stage,
          notes: override.notes !== undefined ? override.notes : opp.notes,
          appliedDate: override.appliedDate !== undefined ? override.appliedDate : opp.appliedDate,
        };
      }
      return opp;
    });
  }, [user, targetCareer, opportunityOverrides]);

  // 4. Dynamically compute Roadmap Milestones
  const milestones = useMemo(() => {
    const base = computeRoadmapMilestones(user, targetCareer, skillGaps);
    return base.map((m) => ({
      ...m,
      tasks: m.tasks.map((t) => ({
        ...t,
        completed: taskCompletedMap[t.id] !== undefined ? taskCompletedMap[t.id] : t.completed,
      })),
    }));
  }, [user, targetCareer, skillGaps, taskCompletedMap]);

  // Actions
  const updateUser = (fields: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
      // Also sync to backend if profile has an id
      if (updated.id) {
        apiClient.updateProfile(updated.id, updated).catch(() => {});
      }
      return updated;
    });
  };

  const switchPersona = (personaKey: string) => {
    const p = personas[personaKey];
    if (p) {
      const existingAccount = getAccountByEmail(p.email);
      if (existingAccount) {
        setCurrentAccount(existingAccount);
        setUser(existingAccount.profile);
        setOpportunityOverrides(existingAccount.opportunityOverrides || {});
        setCourses(existingAccount.courses || defaultCourses);
        setProjects(existingAccount.projects || defaultProjects);
        setTaskCompletedMap(existingAccount.tasks || {});
        setSkillGapBonusMap(existingAccount.skillBonus || {});
        setInterviewResults(existingAccount.interviewResults || []);
        setActiveUserId(existingAccount.id);
      } else {
        setUser(p);
      }
      // Also register profile with backend
      apiClient.updateProfile(p.id, p).catch(() => {});
      showToast(`Switched account to: ${p.fullName} (${p.degree})`);
    }
  };

  const ingestResume = (parsedData: ParsedResumeResult, fileName?: string) => {
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        fullName: parsedData.fullName,
        email: parsedData.email,
        phone: parsedData.phone || prev.phone,
        university: parsedData.university,
        degree: parsedData.degree,
        major: parsedData.major,
        gradYear: parsedData.gradYear,
        cgpa: parsedData.cgpa,
        location: parsedData.location,
        headline: parsedData.headline,
        bio: parsedData.bio,
        skills: parsedData.skills,
        projects: parsedData.projects.length > 0 ? parsedData.projects : prev.projects,
        resumeUploaded: true,
        resumeFileName: fileName || prev.resumeFileName || `${parsedData.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        resumeAtsScore: parsedData.atsScore,
        resumeLastAnalyzed: 'Just now',
        resumeRawText: parsedData.rawText,
        personaId: 'custom',
      };
      // Sync with backend
      apiClient.updateProfile(updated.id, updated).catch(() => {});
      return updated;
    });
    showToast(`Resume parsed for ${parsedData.fullName}! Calibrated Career OS.`);
  };

  const resetToDefault = () => {
    const divyansh = personas.divyansh;
    setUser(divyansh);
    setOpportunityOverrides({});
    setTaskCompletedMap({});
    setSkillGapBonusMap({});
    showToast('Reset account to standard template.');
  };

  const setTargetCareerId = (id: string) => {
    setUser((prev) => ({ ...prev, targetCareerId: id }));
    showToast(`Target career path updated to: ${careers.find((c) => c.id === id)?.title || id}`);
  };

  const updateSkillGapScore = (skillId: string, addedScore: number) => {
    setSkillGapBonusMap((prev) => ({
      ...prev,
      [skillId]: (prev[skillId] || 0) + addedScore,
    }));
    showToast('Skill score updated! Re-evaluating readiness...');
  };

  const updateCourseProgress = (courseId: string, moduleId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map((m) =>
            m.id === moduleId ? { ...m, completed: !m.completed } : m
          );
          const completedCount = updatedModules.filter((m) => m.completed).length;
          const progressPercent = Math.round((completedCount / updatedModules.length) * 100);
          return {
            ...c,
            enrolled: true,
            modules: updatedModules,
            progressPercent,
          };
        }
        return c;
      })
    );
    showToast('Course module progress updated.');
  };

  const toggleProjectComplete = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const next = !p.completed;
          if (next) {
            showToast(`Project "${p.title}" marked as verified!`);
          }
          return { ...p, completed: next };
        }
        return p;
      })
    );
  };

  const updateOpportunityStage = (oppId: string, stage: ApplicationStage, notes?: string) => {
    setOpportunityOverrides((prev) => ({
      ...prev,
      [oppId]: {
        ...prev[oppId],
        stage,
        notes: notes !== undefined ? notes : prev[oppId]?.notes,
        appliedDate:
          stage === 'Applied' && !prev[oppId]?.appliedDate
            ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : prev[oppId]?.appliedDate,
      },
    }));
    showToast(`Application moved to: ${stage}`);
  };

  const saveOpportunity = (oppId: string) => {
    setOpportunityOverrides((prev) => {
      const current = prev[oppId];
      const isSaved = current?.stage === 'Saved';
      return {
        ...prev,
        [oppId]: {
          ...current,
          stage: isSaved ? undefined : 'Saved',
        },
      };
    });
  };

  const toggleTaskComplete = (milestoneId: string, taskId: string) => {
    setTaskCompletedMap((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const addInterviewResult = (res: MockInterviewResult) => {
    setInterviewResults((prev) => [res, ...prev]);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentAccount,
        login,
        signup,
        logout,
        user,
        updateUser,
        switchPersona,
        ingestResume,
        resetToDefault,
        careers,
        targetCareer,
        setTargetCareerId,
        skillGaps,
        updateSkillGapScore,
        courses,
        updateCourseProgress,
        projects,
        toggleProjectComplete,
        opportunities,
        updateOpportunityStage,
        saveOpportunity,
        milestones,
        toggleTaskComplete,
        interviewResults,
        addInterviewResult,
        toast,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#18201D] border border-[#2D6A4F]/40 text-white text-sm px-4 py-3 rounded-xl shadow-xl shadow-black/15 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
