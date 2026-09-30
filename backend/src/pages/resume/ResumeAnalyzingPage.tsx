import React from 'react';
import { AnalysisProgress } from '../../components/resume/AnalysisProgress';

export const ResumeAnalyzingPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in duration-200">
      <AnalysisProgress />
    </div>
  );
};
