import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useApp } from '../../context/AppContext';
import { routes } from '../../lib/routes';
import { personas } from '../../lib/personas';
import {
  LayoutDashboard,
  Milestone,
  Zap,
  BookOpen,
  Briefcase,
  FileText,
  FolderGit2,
  Landmark,
  UserCheck,
  ChevronDown,
  FileCheck2,
  UploadCloud,
  Check,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavLinkItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
  description?: string;
}

// 6 Core high-frequency navigation tabs
const coreNavItems: NavLinkItem[] = [
  { label: 'Dashboard', href: routes.dashboard, icon: LayoutDashboard, exact: true },
  { label: 'Roadmap', href: routes.roadmap, icon: Milestone },
  { label: 'Skill Gap', href: routes.skillGap, icon: Zap },
  { label: 'Curriculum', href: routes.learning, icon: BookOpen },
  { label: 'Opportunities', href: routes.opportunities, icon: Briefcase },
  { label: 'Resume', href: routes.resumeWorkspace, icon: FileText },
];

// Additional high-value features in the sleek "More" dropdown
const secondaryNavItems: NavLinkItem[] = [
  {
    label: 'Projects',
    href: routes.projects,
    icon: FolderGit2,
    description: 'Portfolio builds & proof artifacts',
  },
  {
    label: 'Govt Schemes',
    href: routes.govtSchemes,
    icon: Landmark,
    badge: 'MMSKY / DBT',
    description: 'MP Seekho-Kamao & national subsidies',
  },
  {
    label: 'Mock Interview',
    href: routes.interview,
    icon: UserCheck,
    badge: 'AI',
    description: 'Real-time technical screening prep',
  },
];

export const AppNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, targetCareer, careers, setTargetCareerId, switchPersona, logout } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [careerMenuOpen, setCareerMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const careerRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (careerRef.current && !careerRef.current.contains(target)) {
        setCareerMenuOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(target)) {
        setPersonaMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(target)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCareerMenuOpen(false);
    setPersonaMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  const isRouteActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isMoreActive = secondaryNavItems.some((item) => isRouteActive(item.href, item.exact));

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  const shortRoleTitle = targetCareer.title
    .replace(' Development Engineer', '')
    .replace(' Infrastructure &', '')
    .replace(' Specialist', '');

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8E1] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1520px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 lg:gap-4">
          {/* Left: Brand Logo + Compact Role Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Logo size="md" />

            {/* Compact Role Selector Pill */}
            <div className="relative hidden sm:block" ref={careerRef}>
              <button
                type="button"
                onClick={() => {
                  setCareerMenuOpen(!careerMenuOpen);
                  setPersonaMenuOpen(false);
                  setMoreMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 cursor-pointer select-none',
                  careerMenuOpen
                    ? 'border-[#2D6A4F] bg-[#EBF3EE] text-[#2D6A4F] ring-1 ring-[#2D6A4F]/20'
                    : 'border-[#E5E6DF] hover:border-[#D0D2C7] bg-[#F8F8F5] text-[#18201D]'
                )}
                title="Change target specialization"
                aria-expanded={careerMenuOpen}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] shrink-0" />
                <span className="text-[#717A75] text-[11px] hidden md:inline">Target:</span>
                <span className="font-semibold text-[#18201D] truncate max-w-[110px] md:max-w-[140px]">
                  {shortRoleTitle}
                </span>
                <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold">
                  {targetCareer.matchScore}%
                </span>
                <ChevronDown className={cn('w-3 h-3 text-[#717A75] transition-transform duration-150', careerMenuOpen && 'rotate-180')} />
              </button>

              {/* Role Dropdown Menu */}
              {careerMenuOpen && (
                <div className="absolute left-0 mt-2 w-76 rounded-xl border border-[#E5E6DF] bg-white shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#F0F1EA] mb-1">
                    <span className="text-[10px] font-mono text-[#717A75] uppercase tracking-wider font-semibold">
                      Target Specializations
                    </span>
                    <span className="text-[10px] font-mono text-[#2D6A4F]">Grounded Fit</span>
                  </div>
                  <div className="space-y-1">
                    {careers.map((c) => {
                      const isSelected = c.id === targetCareer.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setTargetCareerId(c.id);
                            setCareerMenuOpen(false);
                          }}
                          className={cn(
                            'w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-[#EBF3EE] text-[#2D6A4F] font-semibold border border-[#2D6A4F]/20'
                              : 'text-[#18201D] hover:bg-[#F8F8F5]'
                          )}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate font-medium">{c.title}</div>
                            <div className="text-[10px] text-[#717A75] truncate">{c.category}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-mono font-bold text-[#2D6A4F]">
                              {c.matchScore}%
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Core Nav Items + Sleek "More" Dropdown (Clean, Zero Overlap) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {coreNavItems.map((item) => {
              const active = isRouteActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150',
                    active
                      ? 'text-[#2D6A4F] bg-[#EBF3EE] border border-[#2D6A4F]/25 font-semibold shadow-2xs'
                      : 'text-[#616B66] hover:text-[#18201D] hover:bg-[#F0F1EA]/80 border border-transparent'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5 shrink-0', active ? 'text-[#2D6A4F]' : 'text-[#717A75]')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* "More" Dropdown Menu */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(!moreMenuOpen);
                  setCareerMenuOpen(false);
                  setPersonaMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none',
                  isMoreActive
                    ? 'text-[#2D6A4F] bg-[#EBF3EE] border border-[#2D6A4F]/25 font-semibold shadow-2xs'
                    : 'text-[#616B66] hover:text-[#18201D] hover:bg-[#F0F1EA]/80 border border-transparent'
                )}
                aria-expanded={moreMenuOpen}
              >
                <span>More</span>
                <ChevronDown className={cn('w-3 h-3 text-[#717A75] transition-transform duration-150', moreMenuOpen && 'rotate-180')} />
                {isMoreActive && <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />}
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#E5E6DF] bg-white shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[10px] font-mono text-[#717A75] uppercase tracking-wider font-semibold border-b border-[#F0F1EA] mb-1">
                    Specialized Modules
                  </div>
                  <div className="space-y-1">
                    {secondaryNavItems.map((item) => {
                      const active = isRouteActive(item.href, item.exact);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className={cn(
                            'flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors',
                            active
                              ? 'bg-[#EBF3EE] text-[#2D6A4F] font-semibold border border-[#2D6A4F]/20'
                              : 'text-[#18201D] hover:bg-[#F8F8F5]'
                          )}
                        >
                          <div className={cn(
                            'p-1.5 rounded-md shrink-0 mt-0.5',
                            active ? 'bg-[#2D6A4F] text-white' : 'bg-[#F0F1EA] text-[#2D6A4F]'
                          )}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs truncate">{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-[#717A75] truncate mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right: ATS Resume Badge + Persona Account Menu + Mobile Burger */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* ATS Score Indicator */}
            {user.resumeUploaded && user.resumeAtsScore ? (
              <Link
                to={routes.resumeWorkspace}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2D6A4F]/25 hover:border-[#2D6A4F] bg-[#EBF3EE]/80 hover:bg-[#EBF3EE] text-xs text-[#2D6A4F] font-medium transition-all whitespace-nowrap shadow-2xs"
                title="ATS-Ready Resume Workspace"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span className="font-mono font-bold text-[11px] sm:text-xs">
                  ATS {user.resumeAtsScore}%
                </span>
              </Link>
            ) : (
              <Link
                to={routes.resumeImport}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#D4A347]/30 hover:border-[#D4A347] bg-[#FEF9EE] text-xs text-[#B45309] font-medium transition-all whitespace-nowrap shadow-2xs"
                title="Upload resume to calibrate readiness"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#D4A347] shrink-0" />
                <span className="font-mono font-semibold text-[11px] sm:text-xs hidden sm:inline">
                  Upload Resume
                </span>
                <span className="font-mono font-semibold text-[11px] sm:hidden">
                  Upload
                </span>
              </Link>
            )}

            {/* Persona & User Account Menu */}
            <div className="relative" ref={personaRef}>
              <button
                type="button"
                onClick={() => {
                  setPersonaMenuOpen(!personaMenuOpen);
                  setCareerMenuOpen(false);
                  setMoreMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer select-none',
                  personaMenuOpen
                    ? 'border-[#2D6A4F] bg-[#EBF3EE] ring-1 ring-[#2D6A4F]/20'
                    : 'border-[#E5E6DF] hover:border-[#D0D2C7] bg-[#F8F8F5]'
                )}
                aria-label="User account and persona switch menu"
                aria-expanded={personaMenuOpen}
              >
                <span className="hidden sm:inline text-xs font-semibold text-[#18201D] max-w-[95px] md:max-w-[120px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
                <div className="w-7 h-7 rounded-full bg-[#2D6A4F] flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0">
                  {user.fullName.charAt(0) || 'U'}
                </div>
                <ChevronDown className={cn('w-3 h-3 text-[#717A75] shrink-0 transition-transform duration-150', personaMenuOpen && 'rotate-180')} />
              </button>

              {personaMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#E5E6DF] bg-white shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  {/* Active Candidate Info Card */}
                  <div className="pb-3 border-b border-[#E8E8E1] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#18201D] truncate">{user.fullName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF3EE] text-[#2D6A4F] font-bold">
                        {user.cgpa ? `CGPA ${user.cgpa.split(' ')[0]}` : 'Active'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#717A75] truncate">{user.university}</div>
                    <div className="text-[10px] text-[#717A75] font-mono truncate">{user.email || 'No email registered'}</div>
                  </div>

                  {/* 1-Click Demo Personas Switcher */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-[#717A75] uppercase tracking-wider font-semibold">
                        1-Click Demo Profiles
                      </span>
                      <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
                    </div>
                    <div className="space-y-1">
                      {Object.entries(personas).map(([key, p]) => {
                        const isCurrent = user.email === p.email;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              switchPersona(key);
                              setPersonaMenuOpen(false);
                            }}
                            className={cn(
                              'w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer',
                              isCurrent
                                ? 'bg-[#EBF3EE] text-[#2D6A4F] font-semibold border border-[#2D6A4F]/30'
                                : 'text-[#18201D] hover:bg-[#F8F8F5]'
                            )}
                          >
                            <div className="truncate pr-2">
                              <div className="font-semibold truncate">{p.fullName}</div>
                              <div className="text-[10px] text-[#717A75] truncate">
                                {p.degree} • {p.location.split(',')[0]}
                              </div>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-[#2D6A4F] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings & Navigation Links */}
                  <div className="pt-2 border-t border-[#E8E8E1] space-y-1">
                    <Link
                      to={routes.profile}
                      onClick={() => setPersonaMenuOpen(false)}
                      className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-[#18201D] hover:bg-[#F8F8F5] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#717A75]" />
                      <span>Candidate Profile &amp; Settings</span>
                    </Link>

                    <Link
                      to={routes.govtSchemes}
                      onClick={() => setPersonaMenuOpen(false)}
                      className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-[#2D6A4F] hover:bg-[#EBF3EE] transition-colors"
                    >
                      <Landmark className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>MP MMSKY &amp; Govt Schemes</span>
                    </Link>

                    <Link
                      to={routes.resumeImport}
                      onClick={() => setPersonaMenuOpen(false)}
                      className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-[#18201D] hover:bg-[#F8F8F5] transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#717A75]" />
                      <span>Upload Custom Resume</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setPersonaMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Log Out of Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#717A75] hover:text-[#18201D] hover:bg-[#F0F1EA] border border-[#E5E6DF] transition-colors cursor-pointer"
              aria-label="Toggle navigation drawer"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay (Guarantees zero bleed-through or overlap with page body) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white border-b border-[#E8E8E1] px-4 py-4 space-y-3.5 shadow-2xl z-50 lg:hidden animate-in slide-in-from-top-2 duration-150">
          {/* Candidate Card */}
          <div className="p-3 rounded-xl border border-[#E5E6DF] bg-[#F8F8F5] flex items-center justify-between text-xs">
            <div>
              <div className="text-[#717A75] font-mono text-[10px]">Active Candidate Profile</div>
              <div className="font-bold text-[#18201D] text-sm">{user.fullName}</div>
              <div className="text-[11px] text-[#717A75]">{user.university}</div>
            </div>
            <Link
              to={routes.profile}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#2D6A4F] font-semibold text-xs hover:underline flex items-center gap-1"
            >
              <span>Profile</span>
              <span>→</span>
            </Link>
          </div>

          {/* Quick Target Career Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono text-[#717A75] uppercase font-semibold">
                Target Specialization
              </span>
              <span className="text-[10px] font-mono text-[#2D6A4F]">Grounded Fit</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {careers.slice(0, 4).map((c) => {
                const isSelected = c.id === targetCareer.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setTargetCareerId(c.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'p-2 rounded-lg text-xs text-left transition-colors cursor-pointer truncate',
                      isSelected
                        ? 'bg-[#EBF3EE] text-[#2D6A4F] font-bold border border-[#2D6A4F]/30'
                        : 'bg-[#F8F8F5] text-[#18201D] border border-[#E5E6DF]'
                    )}
                  >
                    <div className="truncate font-semibold">{c.title.replace(' Development Engineer', '')}</div>
                    <div className="text-[10px] text-[#717A75] font-mono">{c.matchScore}% Match</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All 9 Navigation Links */}
          <div className="space-y-1 pt-1 border-t border-[#E8E8E1]">
            <div className="text-[10px] font-mono text-[#717A75] uppercase px-1 pb-1 font-semibold">
              Platform Navigation
            </div>
            {[...coreNavItems, ...secondaryNavItems].map((item) => {
              const active = isRouteActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors',
                    active
                      ? 'bg-[#EBF3EE] text-[#2D6A4F] font-bold'
                      : 'text-[#18201D] hover:bg-[#F8F8F5]'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4', active ? 'text-[#2D6A4F]' : 'text-[#717A75]')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold">
                      {item.badge}
                    </span>
                  ) : active ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                  ) : null}
                </Link>
              );
            })}
          </div>

          {/* Drawer Actions */}
          <div className="pt-2 border-t border-[#E8E8E1] space-y-2">
            <Link
              to={routes.resumeImport}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold text-[#18201D] bg-[#F8F8F5] border border-[#E5E6DF]"
            >
              <UploadCloud className="w-4 h-4 text-[#2D6A4F]" />
              <span>Upload Custom Resume</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out &amp; Return to Home</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
