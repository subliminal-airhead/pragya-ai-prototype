/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { AboutPage } from './pages/about/AboutPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { CareerPathsPage } from './pages/career/CareerPathsPage';
import { CareerDetailPage } from './pages/career/CareerDetailPage';
import { SkillGapPage } from './pages/skillgap/SkillGapPage';
import { SkillDetailPage } from './pages/skillgap/SkillDetailPage';
import { RoadmapPage } from './pages/roadmap/RoadmapPage';
import { LearningPage } from './pages/learning/LearningPage';
import { CourseDetailPage } from './pages/learning/CourseDetailPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage';
import { ProjectBuilderPage } from './pages/projects/ProjectBuilderPage';
import { OpportunitiesPage } from './pages/opportunities/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/opportunities/OpportunityDetailPage';
import { WhyMatchedPage } from './pages/opportunities/WhyMatchedPage';
import { EligibilityPage } from './pages/opportunities/EligibilityPage';
import { ApplicationTrackerPage } from './pages/opportunities/ApplicationTrackerPage';
import { MarketInsightsPage } from './pages/opportunities/MarketInsightsPage';
import { GovtSchemesPage } from './pages/opportunities/GovtSchemesPage';
import { ResumeImportPage } from './pages/resume/ResumeImportPage';
import { ResumeAnalyzingPage } from './pages/resume/ResumeAnalyzingPage';
import { ResumeReviewPage } from './pages/resume/ResumeReviewPage';
import { ResumeWorkspacePage } from './pages/resume/ResumeWorkspacePage';
import { ResumeBuilderPage } from './pages/resume/ResumeBuilderPage';
import { InterviewPage } from './pages/interview/InterviewPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Marketing / Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={<Navigate to="/onboarding/about" replace />} />
          <Route path="/onboarding/about" element={<OnboardingPage />} />
          <Route path="/onboarding/skills" element={<OnboardingPage />} />
          <Route path="/onboarding/goals" element={<OnboardingPage />} />
          <Route path="/onboarding/preferences" element={<OnboardingPage />} />

          {/* In-App Authenticated Shell */}
          <Route
            path="/dashboard"
            element={
              <AppShell>
                <DashboardPage />
              </AppShell>
            }
          />
          <Route
            path="/profile"
            element={
              <AppShell>
                <ProfilePage />
              </AppShell>
            }
          />

          {/* Career Paths */}
          <Route
            path="/career-paths"
            element={
              <AppShell>
                <CareerPathsPage />
              </AppShell>
            }
          />
          <Route
            path="/career-paths/:career"
            element={
              <AppShell>
                <CareerDetailPage />
              </AppShell>
            }
          />

          {/* Skill Gap */}
          <Route
            path="/skill-gap"
            element={
              <AppShell>
                <SkillGapPage />
              </AppShell>
            }
          />
          <Route
            path="/skill-gap/:skill"
            element={
              <AppShell>
                <SkillDetailPage />
              </AppShell>
            }
          />

          {/* Roadmap */}
          <Route
            path="/roadmap"
            element={
              <AppShell>
                <RoadmapPage />
              </AppShell>
            }
          />

          {/* Learning */}
          <Route
            path="/learning"
            element={
              <AppShell>
                <LearningPage />
              </AppShell>
            }
          />
          <Route
            path="/learning/:course"
            element={
              <AppShell>
                <CourseDetailPage />
              </AppShell>
            }
          />

          {/* Projects */}
          <Route
            path="/projects"
            element={
              <AppShell>
                <ProjectsPage />
              </AppShell>
            }
          />
          <Route
            path="/projects/builder"
            element={
              <AppShell>
                <ProjectBuilderPage />
              </AppShell>
            }
          />
          <Route
            path="/projects/:project"
            element={
              <AppShell>
                <ProjectDetailPage />
              </AppShell>
            }
          />

          {/* Opportunities */}
          <Route
            path="/opportunities"
            element={
              <AppShell>
                <OpportunitiesPage />
              </AppShell>
            }
          />
          <Route
            path="/opportunities/public"
            element={
              <AppShell>
                <OpportunitiesPage />
              </AppShell>
            }
          />
          <Route
            path="/opportunities/tracker"
            element={
              <AppShell>
                <ApplicationTrackerPage />
              </AppShell>
            }
          />
          <Route
            path="/opportunities/insights"
            element={
              <AppShell>
                <MarketInsightsPage />
              </AppShell>
            }
          />
          <Route
            path="/opportunities/govt"
            element={
              <AppShell>
                <GovtSchemesPage />
              </AppShell>
            }
          />
          <Route
            path="/opportunities/:opportunity"
            element={
              <AppShell>
                <OpportunityDetailPage />
              </AppShell>
            }
          />
          <Route
            path="/opportunities/:opportunity/why-matched"
            element={
              <AppShell>
                <WhyMatchedPage />
              </AppShell>
            }
          />
          <Route
            path="/opportunities/:opportunity/eligibility"
            element={
              <AppShell>
                <EligibilityPage />
              </AppShell>
            }
          />

          {/* Resume */}
          <Route path="/resume" element={<Navigate to="/resume/workspace" replace />} />
          <Route
            path="/resume/import"
            element={
              <AppShell>
                <ResumeImportPage />
              </AppShell>
            }
          />
          <Route
            path="/resume/analyzing"
            element={
              <AppShell>
                <ResumeAnalyzingPage />
              </AppShell>
            }
          />
          <Route
            path="/resume/review"
            element={
              <AppShell>
                <ResumeReviewPage />
              </AppShell>
            }
          />
          <Route
            path="/resume/workspace"
            element={
              <AppShell>
                <ResumeWorkspacePage />
              </AppShell>
            }
          />
          <Route
            path="/resume/builder"
            element={
              <AppShell>
                <ResumeBuilderPage />
              </AppShell>
            }
          />

          {/* Interview */}
          <Route
            path="/interview"
            element={
              <AppShell>
                <InterviewPage />
              </AppShell>
            }
          />

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
