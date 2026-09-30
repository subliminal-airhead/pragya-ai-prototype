import React from 'react';
import { LoginForm } from '../../components/forms/LoginForm';
import { Logo } from '../../components/layout/Logo';
import { Link } from 'react-router-dom';
import { routes } from '../../lib/routes';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#18201D] flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo linkToApp={false} size="lg" />
      </div>
      <LoginForm />
      <div className="mt-8 text-center text-xs text-[#717A75]">
        <Link to={routes.home} className="hover:text-[#18201D]">
          ← Return to Campus to Corporate Home
        </Link>
      </div>
    </div>
  );
};
