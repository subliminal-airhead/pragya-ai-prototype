import React from 'react';
import { OnboardingFlow } from '../../components/forms/OnboardingFlow';
import { Logo } from '../../components/layout/Logo';

export const OnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#18201D] flex flex-col p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Logo linkToApp={false} />
        <span className="text-xs font-mono text-[#717A75] font-semibold">Student Profile Calibration</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <OnboardingFlow />
      </div>
    </div>
  );
};
