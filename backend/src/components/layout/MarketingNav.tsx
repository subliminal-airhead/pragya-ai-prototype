import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';
import { ArrowRight, LogOut, Landmark, Menu, X, Compass, Award, BookCheck } from 'lucide-react';

export const MarketingNav: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate(routes.home);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8E1] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Logo linkToApp={false} />

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm text-[#717A75] font-medium">
            <a href="#how-it-works" className="hover:text-[#18201D] transition-colors whitespace-nowrap">
              Core Loop
            </a>
            <a href="#personas" className="hover:text-[#18201D] transition-colors whitespace-nowrap">
              Demo Personas
            </a>
            <Link to={routes.careerPaths} className="hover:text-[#18201D] transition-colors whitespace-nowrap">
              Target Careers
            </Link>
            <Link
              to={routes.govtSchemes}
              className="hover:text-[#18201D] transition-colors flex items-center gap-1.5 text-[#2D6A4F] font-semibold whitespace-nowrap"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Govt Schemes</span>
            </Link>
            <Link to={routes.about} className="hover:text-[#18201D] transition-colors whitespace-nowrap">
              NEP &amp; Skill India
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <Link to={routes.dashboard}>
                  <Button
                    variant="primary"
                    size="sm"
                    iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    <span className="hidden sm:inline">Go to Dashboard ({user.fullName.split(' ')[0]})</span>
                    <span className="sm:hidden">Dashboard</span>
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E6DF] hover:border-[#D0D2C7] bg-[#F0F1EA] hover:bg-[#E8E9E2] text-xs font-semibold text-[#18201D] transition-colors cursor-pointer"
                  title="Log out of your account"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#717A75]" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to={routes.login} className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to={routes.signup}>
                  <Button
                    variant="primary"
                    size="sm"
                    iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Burger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#717A75] hover:text-[#18201D] hover:bg-[#F0F1EA] border border-[#E5E6DF] transition-colors cursor-pointer"
              aria-label="Toggle marketing menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-white border-b border-[#E8E8E1] px-4 py-4 space-y-3 shadow-2xl z-50 lg:hidden animate-in slide-in-from-top-2 duration-150">
          <nav className="space-y-1">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-[#18201D] hover:bg-[#F8F8F5]"
            >
              <Compass className="w-4 h-4 text-[#2D6A4F]" />
              <span>Core Loop &amp; Diagnostic</span>
            </a>
            <a
              href="#personas"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-[#18201D] hover:bg-[#F8F8F5]"
            >
              <Award className="w-4 h-4 text-[#2D6A4F]" />
              <span>Demo Personas</span>
            </a>
            <Link
              to={routes.careerPaths}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-[#18201D] hover:bg-[#F8F8F5]"
            >
              <Compass className="w-4 h-4 text-[#2D6A4F]" />
              <span>Target Careers</span>
            </Link>
            <Link
              to={routes.govtSchemes}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-semibold text-[#2D6A4F] bg-[#EBF3EE]"
            >
              <Landmark className="w-4 h-4 text-[#2D6A4F]" />
              <span>Govt Schemes (MP MMSKY / DBT)</span>
            </Link>
            <Link
              to={routes.about}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-[#18201D] hover:bg-[#F8F8F5]"
            >
              <BookCheck className="w-4 h-4 text-[#717A75]" />
              <span>NEP 2020 &amp; Skill India Mission</span>
            </Link>
          </nav>

          <div className="pt-2 border-t border-[#E8E8E1] space-y-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={routes.login}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold text-[#18201D] bg-[#F8F8F5] border border-[#E5E6DF]"
                >
                  Sign In
                </Link>
                <Link
                  to={routes.signup}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold text-white bg-[#2D6A4F]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
