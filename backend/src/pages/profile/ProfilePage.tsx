import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/forms/TextField';
import { useApp } from '../../context/AppContext';
import { routes } from '../../lib/routes';
import { Link, useNavigate } from 'react-router-dom';
import { personas } from '../../lib/personas';
import {
  FileText,
  CheckCircle2,
  Save,
  Plus,
  Sparkles,
  UploadCloud,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, targetCareer, switchPersona, logout, showToast } = useApp();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [location, setLocation] = useState(user.location || '');
  const [headline, setHeadline] = useState(user.headline);
  const [university, setUniversity] = useState(user.university);
  const [degree, setDegree] = useState(user.degree);
  const [major, setMajor] = useState(user.major);
  const [gradYear, setGradYear] = useState(user.gradYear);
  const [cgpa, setCgpa] = useState(user.cgpa);
  const [bio, setBio] = useState(user.bio);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone || '');
    setLocation(user.location || '');
    setHeadline(user.headline);
    setUniversity(user.university);
    setDegree(user.degree);
    setMajor(user.major);
    setGradYear(user.gradYear);
    setCgpa(user.cgpa);
    setBio(user.bio);
  }, [user]);

  const handleSave = () => {
    updateUser({
      fullName,
      email,
      phone,
      location,
      headline,
      university,
      degree,
      major,
      gradYear,
      cgpa,
      bio,
    });
    showToast('Profile and credentials updated! Saved to your account.');
  };

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const skillName = newSkill.trim();
    if (user.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      showToast(`${skillName} is already in your skills.`);
      return;
    }
    updateUser({
      skills: [...user.skills, { name: skillName, level: 'Intermediate', verified: true }],
    });
    setNewSkill('');
    showToast(`Added ${skillName} to verified skills! Match scores recalculated.`);
  };

  const handleRemoveSkill = (skillNameToRemove: string) => {
    updateUser({
      skills: user.skills.filter((s) => s.name !== skillNameToRemove),
    });
    showToast(`Removed ${skillNameToRemove}. Match scores recalculated.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <PageHeader
        phaseKicker="Student Profile &amp; Account Credentials"
        title="Candidate Profile &amp; Settings"
        description="All career path matches, skill gap diagnostics, and job eligibility across Campus to Corporate update dynamically from your entered information and resume."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4 text-[#717A75]" />}
            >
              Log Out
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        }
      />

      {/* Quick Persona Switcher Strip */}
      <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#18201D]">
          <Sparkles className="w-4 h-4 text-[#D4A347]" />
          <span>Switch Demo Account (1-Click):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(personas).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchPersona(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                user.email === p.email
                  ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40 shadow-xs'
                  : 'bg-[#F8F8F5] text-[#717A75] border-[#E5E6DF] hover:text-[#18201D]'
              }`}
            >
              {p.fullName} ({p.degree.split(' ')[0]})
            </button>
          ))}
          <Link to={routes.resumeImport}>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E5E6DF] text-[#18201D] hover:bg-[#F0F1EA] flex items-center gap-1 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Upload Resume
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="p-6 text-center space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
            <div className="w-20 h-20 rounded-full bg-[#2D6A4F] mx-auto flex items-center justify-center text-2xl font-bold text-white shadow-md">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#18201D]">{user.fullName}</h3>
              <p className="text-xs text-[#717A75] mt-0.5">{user.headline}</p>
              <p className="text-[11px] text-[#717A75] font-mono mt-0.5">{user.email}</p>
            </div>
            <div className="pt-3 border-t border-[#E8E8E1] text-left space-y-2 text-xs">
              <span className="text-[#717A75] font-mono uppercase block font-semibold">Target Objective</span>
              <div className="font-bold text-[#18201D]">{targetCareer.title}</div>
              <div className="text-[#2D6A4F] font-mono font-bold">
                {targetCareer.matchScore}% Dynamic Fit
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3 bg-white border border-[#E5E6DF] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#717A75] font-bold">
              <FileText className="w-4 h-4 text-[#2D6A4F]" />
              <span>ATS Ingestion Status</span>
            </div>
            <div className="text-xs text-[#717A75]">
              Active resume: <br />
              <strong className="text-[#18201D] font-mono text-[11px]">{user.resumeFileName || 'Resume_2026.pdf'}</strong>
            </div>
            <div className="text-xs text-[#2D6A4F] font-mono font-bold">
              ATS Score: {user.resumeAtsScore || 78} / 100
            </div>
            <Link to={routes.resumeWorkspace} className="block pt-2">
              <Button variant="secondary" size="sm" className="w-full">
                Open Resume Studio
              </Button>
            </Link>
          </Card>

          <Card className="p-5 space-y-3 bg-[#F8F8F5] border border-[#E5E6DF] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#717A75] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Session &amp; Security</span>
            </div>
            <p className="text-xs text-[#717A75] leading-relaxed">
              Signed in as <strong className="text-[#18201D] font-mono">{user.email}</strong>. All data and resumes are saved specifically to this account.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut className="w-3.5 h-3.5 text-rose-600" />}
              className="w-full text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              Sign Out &amp; Return Home
            </Button>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 border border-[#E5E6DF] bg-white shadow-xs">
            <h3 className="text-base font-bold text-[#18201D] pb-3 border-b border-[#E8E8E1]">
              Personal &amp; Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Full Legal Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              <TextField
                label="Location / Base"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bhopal / Remote"
              />
            </div>
            <TextField
              label="Professional Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-[#18201D]">Professional Bio &amp; Summary</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[#E5E6DF] bg-[#F8F8F5] p-3 text-sm text-[#18201D] placeholder-[#717A75] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25 focus:border-[#2D6A4F]"
              />
            </div>
            <div className="pt-4 border-t border-[#E8E8E1] space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#2D6A4F] font-bold">
                University Foundation &amp; Degree
              </h4>
              <TextField
                label="Institution / College"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Degree Program"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
                <TextField
                  label="Major / Specialization"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Graduation Year"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                />
                <TextField
                  label="Cumulative GPA / CGPA"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Verified Skills Management */}
          <Card className="p-6 space-y-4 bg-white border border-[#E5E6DF] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div>
                <h3 className="text-base font-bold text-[#18201D]">Verified Technical Skills</h3>
                <p className="text-xs text-[#717A75]">Adding or removing skills dynamically updates your Career Path &amp; Opportunity match scores.</p>
              </div>
              <span className="text-xs font-mono text-[#717A75] font-medium">{user.skills.length} Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#EBF3EE] border border-[#2D6A4F]/30 text-[#2D6A4F]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>{s.name}</span>
                  <span className="text-[10px] font-mono text-[#717A75]">({s.level})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.name)}
                    className="ml-1 text-[#717A75] hover:text-rose-600 transition-colors cursor-pointer"
                    title={`Remove ${s.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddSkill} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add verified skill (e.g. Redis, Kafka, Rust, Docker, FastAPI)..."
                className="flex-1 rounded-lg border border-[#E5E6DF] bg-[#F8F8F5] px-3 py-1.5 text-xs text-[#18201D] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
              />
              <Button type="submit" variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                Add Skill
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
