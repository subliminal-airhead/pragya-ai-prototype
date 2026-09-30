import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ResumeUpload } from '../../components/resume/ResumeUpload';

export const ResumeImportPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="AI Profile Ingestion"
        title="Upload Resume for Diagnostic Benchmarking"
        description="Our backend parser extracts your engineering competencies, projects, and coursework to generate an instant baseline match score against industry target roles."
      />
      <ResumeUpload />
    </div>
  );
};
