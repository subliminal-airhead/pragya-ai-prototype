import React, { useState } from 'react';
import { Button } from '../ui/Button';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  UserCheck,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';
import { parseResumeText, ParsedResumeResult } from '../../lib/resumeParser';
import { personas } from '../../lib/personas';
import { apiClient } from '../../lib/api';

export const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const { ingestResume, switchPersona, user, showToast } = useApp();
  const [tab, setTab] = useState<'upload' | 'paste' | 'personas'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedResumeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>(user.personaId || 'divyansh');

  const processFileText = (text: string, fileName: string) => {
    const parsed = parseResumeText(text, fileName);
    setParsedPreview(parsed);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        processFileText(text || file.name, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        processFileText(text || file.name, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handlePasteChange = (text: string) => {
    setPastedText(text);
    if (text.length > 30) {
      const parsed = parseResumeText(text, 'Pasted_Resume.txt');
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);

    if (tab === 'personas') {
      switchPersona(selectedPersonaKey);
      setTimeout(() => {
        navigate(routes.resumeAnalyzing);
      }, 500);
      return;
    }

    try {
      // Call optimized backend endpoint POST /api/profile/parse
      const apiRes = await apiClient.parseResume(selectedFile, pastedText);
      if (apiRes && apiRes.profile) {
        const prof = apiRes.profile;
        ingestResume({
          fullName: prof.full_name,
          email: prof.email,
          phone: prof.phone,
          university: prof.university || 'University',
          degree: prof.degree || 'B.Tech',
          major: prof.major || 'Computer Science',
          gradYear: prof.grad_year || '2027',
          cgpa: prof.cgpa || '8.4 / 10.0',
          location: prof.location || 'India',
          headline: prof.headline || '',
          bio: prof.summary || '',
          skills: prof.skills || [],
          experiences: prof.experiences || [],
          projects: prof.projects || [],
          rawText: prof.raw_resume_text || '',
          atsScore: prof.ats_score || 82,
          atsBreakdown: prof.ats_breakdown || { parseability: 94, quantification: 82, keywordDensity: 88 },
          detectedKeyCount: prof.skills?.length || 5,
          quantifiedBulletsCount: 3,
        }, prof.resume_file_name);
      }
    } catch (err: any) {
      console.warn('Backend parse error, using client fallback:', err);
      if (parsedPreview) {
        const fileName = selectedFile ? selectedFile.name : `${parsedPreview.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
        ingestResume(parsedPreview, fileName);
      } else if (selectedFile) {
        const defaultParsed = parseResumeText(selectedFile.name, selectedFile.name);
        ingestResume(defaultParsed, selectedFile.name);
      } else {
        switchPersona('divyansh');
      }
    } finally {
      setTimeout(() => {
        navigate(routes.resumeAnalyzing);
      }, 600);
    }
  };

  const selectPersona = (key: string) => {
    setSelectedPersonaKey(key);
    const p = personas[key];
    if (p) {
      setParsedPreview({
        fullName: p.fullName,
        email: p.email,
        university: p.university,
        degree: p.degree,
        major: p.major,
        gradYear: p.gradYear,
        cgpa: p.cgpa,
        location: p.location,
        headline: p.headline,
        bio: p.bio,
        skills: p.skills,
        experiences: p.experiences,
        projects: p.projects,
        rawText: '',
        atsScore: p.resumeAtsScore || 85,
        atsBreakdown: { parseability: 94, quantification: 82, keywordDensity: 88 },
        detectedKeyCount: p.skills.length,
        quantifiedBulletsCount: 4,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-[#F0F1EA] border border-[#E5E6DF] rounded-xl">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'upload'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload File (PDF/DOCX/TXT)</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('paste')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'paste'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Paste Resume Text</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('personas');
            selectPersona(selectedPersonaKey);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'personas'
              ? 'bg-white text-[#18201D] shadow-xs border border-[#E5E6DF]'
              : 'text-[#717A75] hover:text-[#18201D]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Demo Personas</span>
        </button>
      </div>

      {/* Tab 1: Upload File */}
      {tab === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all shadow-xs ${
            dragActive
              ? 'border-[#2D6A4F] bg-[#EBF3EE]'
              : 'border-[#D8D9D1] hover:border-[#2D6A4F] bg-white'
          }`}
        >
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF3EE] border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F]">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#18201D]">
                Drag &amp; Drop your Resume (PDF, DOCX, TXT)
              </h3>
              <p className="text-xs text-[#717A75]">
                Extracts engineering competencies, projects, and benchmarks against target career roles
              </p>
            </div>
            {selectedFile ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F0F1EA] border border-[#E5E6DF] text-xs text-[#18201D]">
                <FileText className="w-4 h-4 text-[#2D6A4F]" />
                <span className="font-mono font-medium">{selectedFile.name}</span>
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#717A75]">Supports PDF, DOCX, TXT up to 5MB</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Paste Resume Text */}
      {tab === 'paste' && (
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E6DF] shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18201D] uppercase font-mono">
              Paste Complete Resume Content
            </label>
            <span className="text-[11px] text-[#717A75]">
              Include Education, Skills, and Project bullets
            </span>
          </div>
          <textarea
            rows={8}
            value={pastedText}
            onChange={(e) => handlePasteChange(e.target.value)}
            placeholder={`Divyansh Joshi | divyansh@example.com | Bhopal, MP\nEDUCATION\nB.Tech in CSE AI & Data Science (2027) | CGPA: 8.4 / 10.0\nTECHNICAL SKILLS\nPython, SQL, Java, React, Git, REST APIs, Problem Solving\nPROJECTS\nStudent Expense API: Built JWT authenticated REST service handling budget tracking in FastAPI.`}
            className="w-full rounded-xl border border-[#E5E6DF] bg-[#F8F8F5] p-3.5 text-xs font-mono text-[#18201D] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25 focus:border-[#2D6A4F] leading-relaxed"
          />
        </div>
      )}

      {/* Tab 3: Pre-loaded Personas */}
      {tab === 'personas' && (
        <div className="space-y-3">
          <div className="text-xs text-[#717A75]">
            Choose a realistic student profile to instantly test how the entire Career OS recalibrates:
          </div>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(personas).map(([key, p]) => (
              <div
                key={key}
                onClick={() => selectPersona(key)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPersonaKey === key
                    ? 'border-[#2D6A4F] bg-[#EBF3EE] shadow-sm'
                    : 'border-[#E5E6DF] bg-white hover:border-[#D0D2C7]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#18201D]">{p.fullName}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-[#E5E6DF] text-[#2D6A4F] font-semibold">
                        CGPA {p.cgpa.split(' ')[0]}
                      </span>
                      <span className="text-[11px] text-[#717A75]">Grad {p.gradYear}</span>
                    </div>
                    <div className="text-xs text-[#717A75]">{p.university} • {p.major}</div>
                    <div className="text-xs text-[#18201D] font-medium pt-1">
                      {p.headline}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {p.skills.slice(0, 5).map((s) => (
                        <span
                          key={s.name}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#717A75] border border-[#E5E6DF]"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedPersonaKey === key && (
                    <div className="w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Extracted Preview Banner */}
      {parsedPreview && (
        <div className="p-4 rounded-xl border border-[#2D6A4F]/30 bg-[#EBF3EE] space-y-2 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[#2D6A4F] uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A347]" />
              Extracted Profile Preview
            </span>
            <span className="font-mono text-[#2D6A4F] font-bold">
              ATS Score: {parsedPreview.atsScore}/100
            </span>
          </div>
          <div className="text-[#18201D] font-semibold text-sm">
            {parsedPreview.fullName} • {parsedPreview.degree} ({parsedPreview.major})
          </div>
          <div className="text-[#717A75]">
            {parsedPreview.university} • CGPA: {parsedPreview.cgpa} • Grad: {parsedPreview.gradYear}
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {parsedPreview.skills.slice(0, 6).map((sk) => (
              <span
                key={sk.name}
                className="text-[11px] px-2 py-0.5 rounded bg-white text-[#2D6A4F] font-medium border border-[#2D6A4F]/30"
              >
                {sk.name}
              </span>
            ))}
            {parsedPreview.skills.length > 6 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-white text-[#717A75] border border-[#E5E6DF]">
                +{parsedPreview.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            setTab('personas');
            selectPersona('divyansh');
          }}
          className="text-xs text-[#2D6A4F] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4A347]" />
          Quick Load B.Tech Persona (Divyansh)
        </button>
        <Button
          variant="primary"
          size="md"
          isLoading={loading}
          onClick={handleAnalyze}
          iconRight={<ArrowRight className="w-4 h-4" />}
        >
          Start AI Career Analysis
        </Button>
      </div>

      <div className="p-4 rounded-xl border border-[#E5E6DF] bg-white flex items-start gap-3 text-xs text-[#717A75] shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
        <p>
          Your resume is analyzed dynamically by the backend to calibrate skill gaps, match percentages for career paths,
          and pre-flight checks for job opportunities. Never shared with third parties.
        </p>
      </div>
    </div>
  );
};
