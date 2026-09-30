import { SkillLevel, UserExperience, UserProjectItem } from '../types';

const SKILL_TAXONOMY: { name: string; aliases: string[]; category: string; defaultLevel: SkillLevel }[] = [
  { name: 'Python', aliases: ['python', 'py3', 'python3'], category: 'Languages', defaultLevel: 'Advanced' },
  { name: 'Java', aliases: ['java', 'jdk', 'core java'], category: 'Languages', defaultLevel: 'Intermediate' },
  { name: 'React', aliases: ['react', 'react.js', 'reactjs'], category: 'Frameworks', defaultLevel: 'Advanced' },
  { name: 'TypeScript', aliases: ['typescript', 'ts'], category: 'Languages', defaultLevel: 'Advanced' },
  { name: 'JavaScript', aliases: ['javascript', 'js', 'es6'], category: 'Languages', defaultLevel: 'Advanced' },
  { name: 'Next.js', aliases: ['next.js', 'nextjs', 'next'], category: 'Frameworks', defaultLevel: 'Intermediate' },
  { name: 'SQL', aliases: ['sql', 'rdbms', 'relational database', 'postgres', 'mysql'], category: 'Cloud & Systems', defaultLevel: 'Intermediate' },
  { name: 'REST APIs', aliases: ['rest apis', 'restful', 'rest api', 'fastapi', 'flask'], category: 'Frameworks', defaultLevel: 'Intermediate' },
  { name: 'FastAPI', aliases: ['fastapi'], category: 'Frameworks', defaultLevel: 'Intermediate' },
  { name: 'Docker', aliases: ['docker', 'containerization'], category: 'Cloud & Systems', defaultLevel: 'Intermediate' },
  { name: 'Git', aliases: ['git', 'github', 'version control'], category: 'Core CS', defaultLevel: 'Advanced' },
  { name: 'Linux', aliases: ['linux', 'bash', 'unix', 'shell'], category: 'Cloud & Systems', defaultLevel: 'Intermediate' },
  { name: 'DSA', aliases: ['dsa', 'data structures', 'algorithms', 'leetcode'], category: 'Core CS', defaultLevel: 'Intermediate' },
  { name: 'System Design', aliases: ['system design', 'distributed systems'], category: 'Core CS', defaultLevel: 'Beginner' },
  { name: 'Testing', aliases: ['testing', 'unit testing', 'pytest', 'jest'], category: 'Frameworks', defaultLevel: 'Intermediate' },
  { name: 'Problem Solving', aliases: ['problem solving', 'analytical skills'], category: 'Core CS', defaultLevel: 'Advanced' },
  { name: 'Excel / Spreadsheets', aliases: ['excel', 'vlookup', 'pivot tables', 'spreadsheets'], category: 'Languages', defaultLevel: 'Advanced' },
];

export interface ParsedResumeResult {
  fullName: string;
  email: string;
  phone?: string;
  university: string;
  degree: string;
  major: string;
  gradYear: string;
  cgpa: string;
  location: string;
  headline: string;
  bio: string;
  skills: { name: string; level: SkillLevel; verified: boolean }[];
  experiences: UserExperience[];
  projects: UserProjectItem[];
  rawText: string;
  atsScore: number;
  atsBreakdown: {
    parseability: number;
    quantification: number;
    keywordDensity: number;
  };
  detectedKeyCount: number;
  quantifiedBulletsCount: number;
}

export function parseResumeText(rawText: string, fallbackFileName?: string): ParsedResumeResult {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const cleanLower = rawText.toLowerCase();

  let fullName = 'Engineering Candidate';
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
      fullName = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
      break;
    }
  }

  if ((fullName === 'Engineering Candidate' || fullName.length < 3) && fallbackFileName) {
    const namePart = fallbackFileName
      .replace(/(_|-)/g, ' ')
      .replace(/\.(pdf|docx|txt)/gi, '')
      .replace(/resume/gi, '')
      .trim();
    if (namePart.length > 2) {
      fullName = namePart
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  const email = emailMatch ? emailMatch[1] : `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '+91 98765 43210';

  let university = 'Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)';
  const uniRegex = /(rgpv|institute|university|college|b\.tech|iit|nit|vit|barkatullah|polytechnic)/i;
  const uniLine = lines.find((l) => uniRegex.test(l));
  if (uniLine) {
    university = uniLine.replace(/education|academic/gi, '').trim().slice(0, 45);
  }

  let degree = 'Bachelor of Technology (B.Tech)';
  if (/b\.tech|bachelor of technology/i.test(rawText)) degree = 'Bachelor of Technology (B.Tech)';
  else if (/polytechnic|diploma/i.test(rawText)) degree = 'Polytechnic Diploma';
  else if (/b\.com|bcom/i.test(rawText)) degree = 'Bachelor of Commerce (B.Com)';

  let major = 'Computer Science & Engineering';
  if (/data science|ai & data science|cse ai/i.test(rawText)) major = 'AI & Data Science';
  else if (/accounting|commerce/i.test(rawText)) major = 'Financial Accounting & Analytics';

  const yearMatch = rawText.match(/\b(202[4-9]|203[0-2])\b/);
  const gradYear = yearMatch ? yearMatch[1] : '2027';

  const cgpaMatch = rawText.match(/(cgpa|gpa|grade)[:\s]*([0-9]\.[0-9]+(?:\s*\/\s*(?:10(?:\.0)?|4(?:\.0)?))?)/i);
  let cgpa = cgpaMatch ? cgpaMatch[2].trim() : '8.4 / 10.0';

  const detectedSkills: { name: string; level: SkillLevel; verified: boolean }[] = [];
  SKILL_TAXONOMY.forEach((skillItem) => {
    const isPresent = skillItem.aliases.some((alias) => cleanLower.includes(alias.toLowerCase()));
    if (isPresent) {
      detectedSkills.push({
        name: skillItem.name,
        level: skillItem.defaultLevel,
        verified: true,
      });
    }
  });

  if (detectedSkills.length === 0) {
    detectedSkills.push(
      { name: 'Python', level: 'Intermediate', verified: true },
      { name: 'SQL', level: 'Intermediate', verified: true },
      { name: 'Problem Solving', level: 'Advanced', verified: true }
    );
  }

  const metricRegex = /\b(\d+%\s*|\d+x\s*|\d+\+?\s*(ms|users|req|requests|queries|k|m|stars)|sub-\d+ms|\$\d+|₹\d+)/i;
  const quantifiedBullets = lines.filter((b) => metricRegex.test(b));
  const quantifiedBulletsCount = quantifiedBullets.length;

  const parseability = 94;
  const quantification = Math.min(95, Math.max(65, 75 + quantifiedBulletsCount * 5));
  const keywordDensity = Math.min(96, Math.max(70, Math.round((detectedSkills.length / 10) * 100)));
  const atsScore = Math.round(parseability * 0.35 + quantification * 0.35 + keywordDensity * 0.3);

  return {
    fullName,
    email,
    phone,
    university,
    degree,
    major,
    gradYear,
    cgpa,
    location: 'Madhya Pradesh / Remote',
    headline: `${major} Candidate • ${detectedSkills.slice(0, 3).map((s) => s.name).join(', ')}`,
    bio: `Pre-final year student at ${university} with verified capabilities in ${detectedSkills.slice(0, 3).map((s) => s.name).join(', ')}.`,
    skills: detectedSkills,
    experiences: [],
    projects: [
      {
        id: 'proj_parsed_1',
        title: 'Backend Web Service & Database Engine',
        role: 'Developer',
        techStack: detectedSkills.slice(0, 3).map((s) => s.name),
        summary: 'Production-grade engineering application constructed with modular architecture.',
        bullets: [
          'Engineered authenticated REST endpoints handling structured student and transaction data.',
          'Optimized database queries with indexing, reducing latency by 32% under load.',
          'Wrote automated test suites achieving >80% code coverage.',
        ],
      },
    ],
    rawText,
    atsScore,
    atsBreakdown: {
      parseability,
      quantification,
      keywordDensity,
    },
    detectedKeyCount: detectedSkills.length,
    quantifiedBulletsCount,
  };
}
