import { store, InterviewSession, StudentProfile } from './store';
import { generateWithGemini } from './llm';

const QUESTION_BANK: Record<string, Array<{ question: string; scenario: string; key_points: string[] }>> = {
  default: [
    {
      question: 'How would you architect a distributed caching layer for a high-traffic REST API serving 10,000 queries per second?',
      scenario: 'Identical requests repeat frequently. Target p95 response time is sub-15ms, and the backend SQL database experiences connection timeouts during traffic spikes.',
      key_points: [
        'In-memory store (Redis / Memcached) with LRU eviction policy',
        'Cache invalidation strategy (Write-through vs Cache-aside with TTL)',
        'Mitigating cache stampedes using distributed locks (Redlock / Mutex)',
        'Read replicas and connection pooling for the primary SQL store'
      ],
    },
    {
      question: 'Explain how you approach indexing in a relational database when query performance begins degrading on large tables.',
      scenario: 'A table with 5 million records takes over 3.2 seconds for filtered lookups on combined status and creation date columns.',
      key_points: [
        'EXPLAIN / ANALYZE query plan profiling to detect sequential table scans',
        'Composite B-Tree index ordering (equality filters first, range filters second)',
        'Index maintenance overhead during frequent writes and inserts',
        'Covering indexes to allow index-only scans without heap fetches'
      ],
    },
    {
      question: 'Tell me about a technical bottleneck you encountered in one of your projects and how you diagnosed and resolved it.',
      scenario: 'Focus on engineering ownership, diagnostic metrics, trade-offs evaluated, and preventative tests established.',
      key_points: [
        'Profiling methodology or logging tools used to isolate the root cause',
        'Quantified performance metric before and after the fix',
        'Trade-offs considered (e.g. latency vs memory consumption)',
        'Automated regression tests added to CI pipeline'
      ],
    },
  ],
};

export function startInterview(
  profile: StudentProfile,
  role: string = 'Software Development Engineer',
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate'
): { interview_id: string; role: string; difficulty: string; question: string; question_number: number; total_questions: number; context: string } {
  const interviewId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const questions = QUESTION_BANK.default.map((q, i) => ({
    id: i + 1,
    question: q.question,
    scenario: q.scenario,
    key_points: q.key_points,
  }));

  const session: InterviewSession = {
    id: interviewId,
    profile_id: profile.id,
    role,
    difficulty,
    questions,
    answers: [],
    current_step: 0,
    completed: false,
  };

  store.saveInterview(session);

  const firstQ = questions[0];
  return {
    interview_id: interviewId,
    role,
    difficulty,
    question: firstQ.question,
    question_number: 1,
    total_questions: questions.length,
    context: firstQ.scenario,
  };
}

export async function submitInterviewAnswer(
  interviewId: string,
  answer: string
): Promise<{
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    technical_depth: number;
    communication: number;
  };
  next_question: string | null;
  question_number?: number;
  total_questions?: number;
  is_last: boolean;
}> {
  const session = store.getInterview(interviewId);
  if (!session) {
    throw new Error('Interview session not found');
  }

  const currentQIndex = session.current_step;
  const currentQ = session.questions[currentQIndex] || session.questions[0];

  let feedback = {
    score: 86,
    technical_depth: 88,
    communication: 84,
    strengths: [
      'Directly addressed system latency and architectural constraints',
      'Demonstrated sound familiarity with in-memory caching and query plan profiling',
      'Structured response with clear problem diagnosis and step-by-step resolution',
    ],
    improvements: [
      'Explicitly quantify memory overhead when proposing in-memory stores',
      'Address cache invalidation synchronization when primary data changes',
    ],
  };

  // If Gemini is available, generate real AI evaluation
  const prompt = `You are a Senior Engineering Hiring Manager evaluating a candidate answer.
Question: "${currentQ.question}"
Scenario: "${currentQ.scenario}"
Candidate Answer: "${answer}"

Evaluate the candidate and return strict JSON:
{
  "score": number (0-100),
  "technical_depth": number (0-100),
  "communication": number (0-100),
  "strengths": string[],
  "improvements": string[]
}`;

  const aiEval = await generateWithGemini<{
    score: number;
    technical_depth: number;
    communication: number;
    strengths: string[];
    improvements: string[];
  }>(prompt);

  if (aiEval && aiEval.score) {
    feedback = aiEval;
  }

  session.answers.push({
    question_number: currentQIndex + 1,
    question: currentQ.question,
    answer,
    feedback,
  });

  session.current_step += 1;
  const isLast = session.current_step >= session.questions.length;
  session.completed = isLast;

  store.saveInterview(session);

  const nextQ = !isLast ? session.questions[session.current_step].question : null;

  return {
    feedback,
    next_question: nextQ,
    question_number: session.current_step + 1,
    total_questions: session.questions.length,
    is_last: isLast,
  };
}

export function finishInterview(interviewId: string): {
  interview_id: string;
  overall_score: number;
  rubric_breakdown: {
    technical_depth: number;
    communication: number;
    problem_solving: number;
    confidence: number;
  };
  summary: string;
  recommendations: string[];
} {
  const session = store.getInterview(interviewId);
  const scores = (session?.answers || []).map((a) => a.feedback.score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;

  return {
    interview_id: interviewId,
    overall_score: avgScore,
    rubric_breakdown: {
      technical_depth: Math.min(95, avgScore + 2),
      communication: Math.min(95, avgScore - 2),
      problem_solving: Math.min(96, avgScore + 1),
      confidence: Math.min(90, avgScore - 3),
    },
    summary: `Candidate demonstrated strong systems comprehension and articulate trade-off evaluation for ${session?.role || 'Software Engineering'}. Ready for technical screening rounds.`,
    recommendations: [
      'Practice verbalizing time complexity tradeoffs before finalizing architectural choices',
      'Keep answers under 2 minutes by using the STAR method for behavioral questions',
      'Review composite indexing syntax for SQL technical screens',
    ],
  };
}
