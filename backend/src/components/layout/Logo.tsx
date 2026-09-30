import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; linkToApp?: boolean }> = ({
  size = 'md',
  linkToApp = true,
}) => {
  const sizes = {
    sm: 'text-sm gap-2',
    md: 'text-base gap-2.5',
    lg: 'text-xl gap-3',
  };

  const iconSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-9 h-9 text-base',
  };

  const content = (
    <div className={`inline-flex items-center font-bold tracking-tight select-none shrink-0 whitespace-nowrap ${sizes[size]}`}>
      <div
        className={`relative flex items-center justify-center rounded-lg bg-[#2D6A4F] text-white font-mono font-bold shadow-sm shrink-0 ${iconSizes[size]}`}
      >
        <span className="leading-none">C</span>
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D4A347] border border-white" />
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold tracking-wider text-[#18201D] leading-none">
          CAMPUS TO CORP
        </span>
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#717A75] mt-0.5 font-semibold">
          AI Career Readiness
        </span>
      </div>
    </div>
  );

  return <Link to={linkToApp ? routes.dashboard : routes.home}>{content}</Link>;
};
