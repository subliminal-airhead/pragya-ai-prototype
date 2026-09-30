import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { store, StudentProfile } from '../services/store';
import { parseResumeContent } from '../services/profileService';
import { recommendCareers } from '../services/careerService';
import { computeSkillGaps } from '../services/gapService';
import { recommendCourses } from '../services/courseService';
import { matchOpportunities } from '../services/opportunityService';
import { matchGovtSchemes } from '../services/govtService';
import { reviewResume, rewriteResume, getResumeExport } from '../services/resumeService';
import { startInterview, submitInterviewAnswer, finishInterview } from '../services/interviewService';
import { streamRoadmapGeneration } from '../services/roadmapService';
import personasData from '../data/personas.json';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt', '.doc'];
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('text') || file.mimetype.includes('document')) {
      cb(null, true);
    } else {
      cb(new Error('FILE_UNSUPPORTED'));
    }
  },
});

export const apiRouter = express.Router();

// Helper to extract session id
function getSessionId(req: Request): string {
  const header = req.headers['x-session-id'];
  if (typeof header === 'string' && header.trim()) {
    return header.trim();
  }
  return 'default-session';
}

// Helper to resolve profile by profile_id or active session
function resolveProfile(profileId?: string, sessionId?: string): StudentProfile | null {
  if (profileId) {
    const byId = store.getProfile(profileId);
    if (byId) return byId;
  }
  if (sessionId) {
    const bySession = store.getProfileForSession(sessionId);
    if (bySession) return bySession;
  }
  // Default fallback to first persona (Divyansh)
  return store.getProfile('persona_divyansh') || null;
}

// GET /health
apiRouter.get('/health', (req: Request, res: Response) => {
  const isMock = process.env.MOCK_LLM === '1' || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'campus-to-corporate-backend',
    llm: {
      provider: isMock ? 'grounded-dataset' : 'gemini',
      configured: !isMock,
      model: 'gemini-3.8-flash',
    },
    mock: isMock,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/personas - List pre-seeded personas
apiRouter.get('/api/personas', (req: Request, res: Response) => {
  res.json(personasData);
});

// POST /api/profile/parse (multipart file or JSON { text })
apiRouter.post('/api/profile/parse', (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.message === 'FILE_UNSUPPORTED') {
        return res.status(415).json({
          error: {
            code: 'FILE_UNSUPPORTED',
            message: 'Resume must be a PDF, DOCX, or plain text file, or paste text.',
            details: {},
          },
        });
      }
      return res.status(413).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Resume file must be under 5 MB.',
          details: {},
        },
      });
    }

    try {
      const sessionId = getSessionId(req);
      let resumeText = '';
      let fileName: string | undefined = undefined;

      if (req.file) {
        fileName = req.file.originalname;
        // Text decoding for utf-8 or ascii buffers
        resumeText = req.file.buffer.toString('utf-8');
      } else if (req.body && req.body.text) {
        resumeText = String(req.body.text);
        fileName = 'Pasted_Resume.txt';
      }

      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(422).json({
          error: {
            code: 'PARSE_FAILED',
            message: 'Could not extract readable text from resume. Please upload or paste text.',
            details: {},
          },
        });
      }

      const result = await parseResumeContent(resumeText, fileName, sessionId);
      return res.json(result);
    } catch (parseError) {
      next(parseError);
    }
  });
});

// PUT /api/profile/:profile_id
apiRouter.put('/api/profile/:profile_id', (req: Request, res: Response) => {
  const profileId = req.params.profile_id;
  const existing = store.getProfile(profileId);
  const updatedData: StudentProfile = {
    ...(existing || {}),
    ...req.body,
    id: profileId,
  };

  store.saveProfile(updatedData, getSessionId(req));
  return res.json(updatedData);
});

// GET /api/profile/:profile_id
apiRouter.get('/api/profile/:profile_id', (req: Request, res: Response) => {
  const profile = store.getProfile(req.params.profile_id);
  if (!profile) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Profile not found. Please re-upload resume or choose a persona.',
        details: {},
      },
    });
  }
  return res.json(profile);
});

// POST /api/careers/recommend
apiRouter.post('/api/careers/recommend', (req: Request, res: Response) => {
  const { profile_id, interests } = req.body || {};
  const profile = resolveProfile(profile_id, getSessionId(req));
  if (!profile) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Candidate profile required', details: {} },
    });
  }

  const matches = recommendCareers(profile, interests || profile.interests);
  return res.json(matches);
});

// POST /api/skills/gap
apiRouter.post('/api/skills/gap', (req: Request, res: Response) => {
  const { profile_id, target_role } = req.body || {};
  const profile = resolveProfile(profile_id, getSessionId(req));
  if (!profile) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Candidate profile required', details: {} },
    });
  }

  const report = computeSkillGaps(profile, target_role);
  return res.json(report);
});

// POST /api/courses/recommend
apiRouter.post('/api/courses/recommend', (req: Request, res: Response) => {
  const { profile_id, target_role } = req.body || {};
  const profile = resolveProfile(profile_id, getSessionId(req));
  if (!profile) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Candidate profile required', details: {} },
    });
  }

  const courses = recommendCourses(profile, target_role);
  return res.json(courses);
});

// POST /api/opportunities/match
apiRouter.post('/api/opportunities/match', (req: Request, res: Response) => {
  const { profile_id, target_role } = req.body || {};
  const profile = resolveProfile(profile_id, getSessionId(req));
  if (!profile) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Candidate profile required', details: {} },
    });
  }

  const opportunities = matchOpportunities(profile, target_role);
  return res.json(opportunities);
});

// POST /api/govt/match
apiRouter.post('/api/govt/match', (req: Request, res: Response) => {
  const { profile_id } = req.body || {};
  const profile = resolveProfile(profile_id, getSessionId(req));
  if (!profile) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Candidate profile required', details: {} },
    });
  }

  const schemes = matchGovtSchemes(profile);
  return res.json(schemes);
});

// POST /api/resume/review
apiRouter.post('/api/resume/review', (req: Request, res: Response) => {
  const { profile_id, target_role } = req.body || {};
  const profile = resolveProfile(profile_id, getSessionId(req));
  if (!profile) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Candidate profile required', details: {} },
    });
  }

  const review = reviewResume(profile, target_role);
  return res.json(review);
});

// POST /api/resume/rewrite
apiRouter.post('/api/resume/rewrite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profile_id, target_role } = req.body || {};
    const profile = resolveProfile(profile_id, getSessionId(req));
    if (!profile) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Candidate profile required', details: {} },
      });
    }

    const rewritten = await rewriteResume(profile, target_role);
    return res.json(rewritten);
  } catch (err) {
    next(err);
  }
});

// GET /api/resume/export/:resume_id
apiRouter.get('/api/resume/export/:resume_id', (req: Request, res: Response) => {
  const resumeId = req.params.resume_id;
  const format = (req.query.format as any) || 'txt';
  const fileData = getResumeExport(resumeId, format);

  if (!fileData) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Resume export not found', details: {} },
    });
  }

  res.setHeader('Content-Type', fileData.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
  return res.send(fileData.content);
});

// POST /api/interview/start
apiRouter.post('/api/interview/start', (req: Request, res: Response) => {
  const { profile_id, role, difficulty } = req.body || {};
  const profile = resolveProfile(profile_id, getSessionId(req));
  if (!profile) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Candidate profile required', details: {} },
    });
  }

  const started = startInterview(profile, role, difficulty);
  return res.json(started);
});

// POST /api/interview/answer
apiRouter.post('/api/interview/answer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { interview_id, answer } = req.body || {};
    if (!interview_id || !answer) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'interview_id and answer are required',
          details: {},
        },
      });
    }

    const result = await submitInterviewAnswer(interview_id, answer);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/interview/finish
apiRouter.post('/api/interview/finish', (req: Request, res: Response) => {
  const { interview_id } = req.body || {};
  if (!interview_id) {
    return res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'interview_id is required', details: {} },
    });
  }

  const summary = finishInterview(interview_id);
  return res.json(summary);
});

// POST /api/roadmap/generate (SSE stream)
apiRouter.post('/api/roadmap/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profile_id, interests, target_role } = req.body || {};
    const sessionId = getSessionId(req);
    const profile = resolveProfile(profile_id, sessionId);

    if (!profile) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Profile not found to generate roadmap',
          details: {},
        },
      });
    }

    // Set SSE headers per section 7.4
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Stream keepalive every 10 seconds
    const keepaliveTimer = setInterval(() => {
      res.write(':keepalive\n\n');
    }, 10000);

    req.on('close', () => {
      clearInterval(keepaliveTimer);
    });

    await streamRoadmapGeneration(res, profile, interests || profile.interests, target_role);
    clearInterval(keepaliveTimer);
  } catch (err) {
    next(err);
  }
});

// GET /api/roadmap/:roadmap_id
apiRouter.get('/api/roadmap/:roadmap_id', (req: Request, res: Response) => {
  const roadmapId = req.params.roadmap_id;
  const roadmap = store.getRoadmap(roadmapId);
  if (!roadmap) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Roadmap not found', details: {} },
    });
  }
  return res.json(roadmap);
});

// DELETE /api/session
apiRouter.delete('/api/session', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  store.clearSession(sessionId);
  return res.status(204).send();
});

// Standard Error Envelope Middleware (Section 7.5)
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[API Error]', err);
  const status = err.status || 500;
  const code = err.code || 'INTERNAL';
  const message = err.message || 'An unexpected internal server error occurred';

  res.status(status).json({
    error: {
      code,
      message,
      details: err.details || {},
    },
  });
}
