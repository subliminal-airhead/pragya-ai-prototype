import React from 'react';
import { AppNavbar } from './AppNavbar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#18201D] flex flex-col font-sans selection:bg-[#2D6A4F]/15 selection:text-[#18201D]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-[#2D6A4F] text-white px-4 py-2 rounded-md font-medium shadow-md"
      >
        Skip to main content
      </a>
      <AppNavbar />
      <main id="main-content" className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
};
