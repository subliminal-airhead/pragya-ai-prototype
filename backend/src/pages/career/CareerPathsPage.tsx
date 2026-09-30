import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { CareerCard } from '../../components/sections/CareerCard';
import { useApp } from '../../context/AppContext';

export const CareerPathsPage: React.FC = () => {
  const { careers } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        phaseKicker="Target Setting"
        title="Engineering Career Paths"
        description="Benchmark your current verified competencies against modern high-growth software engineering specializations."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careers.map((career) => (
          <CareerCard key={career.id} career={career} />
        ))}
      </div>
    </div>
  );
};
