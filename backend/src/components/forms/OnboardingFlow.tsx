import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextField } from './TextField';
import { ChipSelect } from './ChipSelect';
import { StepIndicator } from './StepIndicator';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, label: 'Academic & Background', path: routes.onboarding.about },
  { id: 2, label: 'Technical Skills', path: routes.onboarding.skills },
  { id: 3, label: 'Career Targets', path: routes.onboarding.goals },
  { id: 4, label: 'Preferences', path: routes.onboarding.preferences },
];

const availableSkills = [
  'Python', 'Java', 'React', 'Git', 'SQL',
  'Problem Solving', 'REST APIs', 'DSA', 'System Design', 'Testing',
  'TypeScript', 'Docker', 'PostgreSQL', 'FastAPI', 'Linux', 'Excel / Spreadsheets'
];

const careerGoalOptions = [
  'Software Development Engineer',
  'Full-Stack Web Developer',
  'Data Analyst & Business Intelligence',
  'AI & Machine Learning Engineer',
  'Cloud Infrastructure & DevOps Engineer',
  'Digital e-Governance & Public Tech Associate',
];

const workStyleOptions = ['Remote', 'Hybrid', 'On-site'];
const locationOptions = ['Bhopal', 'Indore', 'Sagar', 'Jabalpur', 'Bengaluru', 'Delhi NCR', 'Pune', 'Remote'];

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser, setTargetCareerId, careers, showToast } = useApp();

  const getStepFromPath = () => {
    if (location.pathname.includes('/skills')) return 2;
    if (location.pathname.includes('/goals')) return 3;
    if (location.pathname.includes('/preferences')) return 4;
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(getStepFromPath);

  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('pragya_onboarding_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      fullName: user.fullName || '',
      university: user.university || 'RGPV / University',
      degree: user.degree || 'Bachelor of Technology (B.Tech)',
      major: user.major || 'Computer Science & Engineering',
      gradYear: user.gradYear || '2027',
      cgpa: user.cgpa || '8.4 / 10.0',
      skills: user.skills.map((s) => s.name),
      targetCareer: 'Software Development Engineer',
      targetTimeline: user.targetTimeline || 'Summer 2027',
      preferredWorkType: user.preferredWorkType || ['Remote', 'Hybrid'],
      preferredLocations: user.preferredLocations || ['Bhopal', 'Indore', 'Remote'],
    };
  });

  useEffect(() => {
    sessionStorage.setItem('pragya_onboarding_draft', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    setCurrentStep(getStepFromPath());
  }, [location.pathname]);

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      navigate(routes.onboarding.skills);
    } else if (currentStep === 2) {
      navigate(routes.onboarding.goals);
    } else if (currentStep === 3) {
      navigate(routes.onboarding.preferences);
    } else if (currentStep === 4) {
      updateUser({
        fullName: formData.fullName || user.fullName,
        university: formData.university,
        degree: formData.degree,
        major: formData.major,
        gradYear: formData.gradYear,
        cgpa: formData.cgpa,
        skills: formData.skills.map((s: string) => ({
          name: s,
          level: 'Intermediate',
          verified: true,
        })),
        targetTimeline: formData.targetTimeline,
        preferredWorkType: formData.preferredWorkType,
        preferredLocations: formData.preferredLocations,
      });

      const matched = careers.find((c) => c.title === formData.targetCareer);
      if (matched) {
        setTargetCareerId(matched.id);
      }

      showToast('Profile configured! Next step: Upload your resume for AI diagnostic analysis.');
      sessionStorage.removeItem('pragya_onboarding_draft');
      navigate(routes.resumeImport);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) navigate(routes.onboarding.about);
    if (currentStep === 3) navigate(routes.onboarding.skills);
    if (currentStep === 4) navigate(routes.onboarding.goals);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        steps={steps}
        onStepClick={(stepId) => {
          const stepObj = steps.find((s) => s.id === stepId);
          if (stepObj) navigate(stepObj.path);
        }}
      />
      <Card className="border border-[#E5E6DF] bg-white p-6 sm:p-8 space-y-6 shadow-md rounded-2xl">
        {/* Step 1: Academic & Background */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <CardHeader className="p-0">
              <div className="text-xs font-mono text-[#2D6A4F] uppercase tracking-wider mb-1 font-bold">
                Step 1 of 4 • Academic Baseline
              </div>
              <CardTitle className="text-2xl text-[#18201D]">Tell us about your educational foundation</CardTitle>
              <CardDescription className="text-[#717A75]">
                We calibrate benchmark standards, internship timelines, and NEP 2020 course credits.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4 pt-2">
              <TextField
                label="Full Legal Name"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="e.g. Divyansh Joshi"
              />
              <TextField
                label="College or University"
                value={formData.university}
                onChange={(e) => updateField('university', e.target.value)}
                placeholder="e.g. RGPV Bhopal"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Degree Program"
                  value={formData.degree}
                  onChange={(e) => updateField('degree', e.target.value)}
                  placeholder="e.g. Bachelor of Technology (B.Tech)"
                />
                <TextField
                  label="Major / Specialization"
                  value={formData.major}
                  onChange={(e) => updateField('major', e.target.value)}
                  placeholder="e.g. Computer Science / AI & DS"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Graduation Year"
                  value={formData.gradYear}
                  onChange={(e) => updateField('gradYear', e.target.value)}
                  placeholder="2027"
                />
                <TextField
                  label="Current GPA / CGPA"
                  value={formData.cgpa}
                  onChange={(e) => updateField('cgpa', e.target.value)}
                  placeholder="8.4 / 10.0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <CardHeader className="p-0">
              <div className="text-xs font-mono text-[#2D6A4F] uppercase tracking-wider mb-1 font-bold">
                Step 2 of 4 • Technical Baseline
              </div>
              <CardTitle className="text-2xl text-[#18201D]">Select your active capabilities</CardTitle>
              <CardDescription className="text-[#717A75]">
                Pick languages, databases, and tools you have written code or built projects in.
              </CardDescription>
            </CardHeader>
            <div className="pt-2">
              <ChipSelect
                label="Core Technologies & Skills (Click to toggle)"
                options={availableSkills}
                selected={formData.skills}
                onChange={(selected) => updateField('skills', selected)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Career Targets */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <CardHeader className="p-0">
              <div className="text-xs font-mono text-[#2D6A4F] uppercase tracking-wider mb-1 font-bold">
                Step 3 of 4 • Primary Career Objective
              </div>
              <CardTitle className="text-2xl text-[#18201D]">Which role do you want to break into?</CardTitle>
              <CardDescription className="text-[#717A75]">
                Our engine will benchmark every diagnostic test, course recommendation, and project against this target.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#18201D]">Target Role Title</label>
                <div className="grid grid-cols-1 gap-2">
                  {careerGoalOptions.map((goal) => (
                    <button
                      type="button"
                      key={goal}
                      onClick={() => updateField('targetCareer', goal)}
                      className={`p-3 rounded-lg border text-left text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        formData.targetCareer === goal
                          ? 'border-[#2D6A4F] bg-[#EBF3EE] text-[#2D6A4F]'
                          : 'border-[#E5E6DF] bg-[#F8F8F5] text-[#18201D] hover:border-[#D0D2C7]'
                      }`}
                    >
                      <span>{goal}</span>
                      {formData.targetCareer === goal && (
                        <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-[#18201D]">Target Readiness Timeline</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Within 1 Month', 'Within 3 Months', 'Summer 2027'].map((time) => (
                    <button
                      type="button"
                      key={time}
                      onClick={() => updateField('targetTimeline', time)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-colors cursor-pointer ${
                        formData.targetTimeline === time
                          ? 'border-[#2D6A4F] bg-[#EBF3EE] text-[#2D6A4F]'
                          : 'border-[#E5E6DF] bg-[#F8F8F5] text-[#717A75] hover:text-[#18201D]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <CardHeader className="p-0">
              <div className="text-xs font-mono text-[#2D6A4F] uppercase tracking-wider mb-1 font-bold">
                Step 4 of 4 • Search &amp; Work Preferences
              </div>
              <CardTitle className="text-2xl text-[#18201D]">Tailor your opportunity matching criteria</CardTitle>
              <CardDescription className="text-[#717A75]">
                Define acceptable workplace environments and locations for high-match filtering.
              </CardDescription>
            </CardHeader>
            <div className="space-y-6 pt-2">
              <ChipSelect
                label="Workplace Styles"
                options={workStyleOptions}
                selected={formData.preferredWorkType}
                onChange={(selected) => updateField('preferredWorkType', selected)}
              />
              <ChipSelect
                label="Preferred Hubs &amp; Relocation Locations"
                options={locationOptions}
                selected={formData.preferredLocations}
                onChange={(selected) => updateField('preferredLocations', selected)}
              />
            </div>
          </div>
        )}

        <CardFooter className="pt-6 border-t border-[#E8E8E1] flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNext}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {currentStep === 4 ? 'Complete & Upload Resume' : 'Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
