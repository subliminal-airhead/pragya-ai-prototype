import React from 'react';
import { MarketingNav } from '../components/layout/MarketingNav';
import { MarketingFooter } from '../components/layout/MarketingFooter';
import { Hero } from '../components/sections/Hero';
import { HowItWorks } from '../components/sections/HowItWorks';
import { ForStudents } from '../components/sections/ForStudents';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#18201D] flex flex-col font-sans">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ForStudents />
      </main>
      <MarketingFooter />
    </div>
  );
};
