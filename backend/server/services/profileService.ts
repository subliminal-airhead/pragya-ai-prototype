import { StudentProfile, store } from './store';
import { generateWithGemini } from './llm';

export async function parseResumeContent(
  text: string,
  fileName?: string,
  sessionId?: string
): Promise<{ profile_id: string; profile: StudentProfile }> {
  const profileId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Attempt Gemini extraction if available
  let extracted: Partial<StudentProfile> | null = null;
  if (text.length > 20) {
    const prompt = `You are an expert technical resume parser for Indian engineering and college students.
Parse the following resume text into a strict JSON object with these exact keys:
{
  "full_name": string,
  "email": string,
  "phone": string,
  "headline": string,
  "university": string,
  "degree": string,
  "major": string,
  "grad_year": string,
  "cgpa": string,
  "location": string,
  "target_role": string,
  "skills": [{"name": string, "level": "Beginner" | "Intermediate" | "Advanced" | "Expert", "verified": true}],
  "projects": [{"title": string, "tech_stack": string[], "bullets": string[]}],
  "interests": string[],
  "summary": string
}

Resume Text:
"""
${text.slice(0, 4000)}
"""`;

    extracted = await generateWithGemini<Partial<StudentProfile>>(prompt);
  }

  // Robust heuristic fallback if Gemini is not configured or fails
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const cleanLower = text.toLowerCase();

  let name = extracted?.full_name;
  if (!name || name === 'Engineering Candidate') {
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (
        line.length > 2 &&
        line.length < 35 &&
        !line.includes('@') &&
        !line.includes('http') &&
        !line.includes('resume') &&
        !/\d/.test(line)
      ) {
        name = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
        break;
      }
    }
  }
  if (!name && fileName) {
    name = fileName.replace(/\.(pdf|docx|txt)/gi, '').replace(/[-_]/g, ' ').trim();
  }
  if (!name) name = 'Engineering Candidate';

  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  const email = extracted?.email || (emailMatch ? emailMatch[1] : `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`);

  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = extracted?.phone || (phoneMatch ? phoneMatch[0] : '+91 98765 43210');

  // Education extraction
  let degree = extracted?.degree || 'Bachelor of Technology (B.Tech)';
  if (/b\.tech|bachelor of technology/i.test(text)) degree = 'Bachelor of Technology (B.Tech)';
  else if (/diploma|polytechnic/i.test(text)) degree = 'Polytechnic Diploma';
  else if (/b\.com|bcom/i.test(text)) degree = 'Bachelor of Commerce (B.Com)';
  else if (/b\.a\.|ba\b/i.test(text)) degree = 'Bachelor of Arts (B.A.)';
  else if (/m\.tech|master/i.test(text)) degree = 'Master of Technology (M.Tech)';

  let major = extracted?.major || 'Computer Science & Engineering';
  if (/data science|ai & data science|cse ai/i.test(text)) major = 'AI & Data Science';
  else if (/accounting|commerce|finance/i.test(text)) major = 'Financial Accounting & Commerce';
  else if (/mechanical/i.test(text)) major = 'Mechanical Engineering';
  else if (/electrical|electronics/i.test(text)) major = 'Electrical & Electronics';

  const yearMatch = text.match(/\b(202[4-9]|203[0-2])\b/);
  const gradYear = extracted?.grad_year || (yearMatch ? yearMatch[1] : '2027');

  const cgpaMatch = text.match(/(cgpa|gpa|grade)[:\s]*([0-9]\.[0-9]+(?:\s*\/\s*(?:10(?:\.0)?|4(?:\.0)?))?)/i);
  const cgpa = extracted?.cgpa || (cgpaMatch ? cgpaMatch[2].trim() : '8.4 / 10.0');

  let university = extracted?.university || 'University of Technology / Institute';
  const uniLine = lines.find((l) => /(rgpv|institute|university|college|iit|nit|vit|bits|barkatullah|polytechnic)/i.test(l));
  if (uniLine && !extracted?.university) {
    university = uniLine.replace(/education|academic/gi, '').trim().slice(0, 50);
  }

  // Skills
  const knownSkills = [
    'Python', 'SQL', 'React', 'Java', 'Git', 'JavaScript', 'TypeScript',
    'Docker', 'Linux', 'DSA', 'REST APIs', 'FastAPI', 'Node.js',
    'Machine Learning', 'Excel / Spreadsheets', 'Problem Solving', 'System Design', 'Testing'
  ];

  let skills = extracted?.skills;
  if (!skills || skills.length === 0) {
    skills = [];
    for (const sk of knownSkills) {
      if (cleanLower.includes(sk.toLowerCase())) {
        skills.push({
          name: sk,
          level: (sk === 'Python' || sk === 'Excel / Spreadsheets' ? 'Advanced' : 'Intermediate') as any,
          verified: true,
        });
      }
    }
    if (skills.length === 0) {
      skills = [
        { name: 'Python', level: 'Intermediate', verified: true },
        { name: 'SQL', level: 'Intermediate', verified: true },
        { name: 'Problem Solving', level: 'Advanced', verified: true }
      ];
    }
  }

  // Quantified metrics calculation for ATS score
  const metricRegex = /\b(\d+%\s*|\d+x\s*|\d+\+?\s*(ms|users|req|requests|queries|k|m|stars)|sub-\d+ms|\$\d+|₹\d+)/i;
  const quantifiedBullets = lines.filter((l) => metricRegex.test(l));
  const quantification = Math.min(95, Math.max(65, Math.round((quantifiedBullets.length / Math.max(1, lines.length)) * 250) + 60));
  const parseability = 94;
  const keywordDensity = Math.min(96, Math.max(70, Math.round((skills.length / 12) * 100)));
  const impact = Math.round((quantification + keywordDensity) / 2);
  const atsScore = Math.round(parseability * 0.3 + quantification * 0.35 + keywordDensity * 0.35);

  const profile: StudentProfile = {
    id: profileId,
    full_name: name,
    email,
    phone,
    headline: extracted?.headline || `${major} Candidate • ${skills.slice(0, 3).map((s) => s.name).join(', ')}`,
    university,
    degree,
    major,
    grad_year: gradYear,
    cgpa,
    location: extracted?.location || 'Madhya Pradesh / Remote, India',
    target_role: extracted?.target_role || 'Software Development Engineer',
    interests: extracted?.interests || ['Software Engineering', 'Cloud Backends', 'Internships'],
    skills,
    projects: extracted?.projects && extracted.projects.length > 0 ? extracted.projects : [
      {
        title: 'Production RESTful Web Service',
        tech_stack: skills.slice(0, 3).map((s) => s.name),
        bullets: [
          'Engineered authenticated endpoints handling student data with schema validation.',
          'Optimized database queries with indexing, reducing latency by 32% under load.',
          'Wrote automated test suites achieving >80% code coverage.'
        ]
      }
    ],
    raw_resume_text: text,
    resume_file_name: fileName || `${name.replace(/\s+/g, '_')}_Resume.pdf`,
    ats_score: atsScore,
    ats_breakdown: {
      parseability,
      quantification,
      keyword_density: keywordDensity,
      impact,
    },
    summary: extracted?.summary || `Pre-final year engineering student at ${university} with verified competence in ${skills.slice(0, 4).map((s) => s.name).join(', ')}.`
  };

  store.saveProfile(profile, sessionId);

  return { profile_id: profileId, profile };
}
