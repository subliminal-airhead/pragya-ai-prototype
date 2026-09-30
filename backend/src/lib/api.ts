// Client-side API connector adhering to Section 7 of the Blueprint
const SESSION_STORAGE_KEY = 'pragya_client_session_id';

export function getClientSessionId(): string {
  let sid = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sid);
  }
  return sid;
}

export function resetClientSessionId(): string {
  const sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem(SESSION_STORAGE_KEY, sid);
  return sid;
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const sessionId = getClientSessionId();
  const headers = new Headers(options.headers || {});
  headers.set('X-Session-ID', sessionId);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errBody: any;
    try {
      errBody = await response.json();
    } catch {
      errBody = { error: { message: `Request failed with status ${response.status}`, code: 'HTTP_ERROR' } };
    }
    const err = new Error(errBody?.error?.message || `Request failed with status ${response.status}`);
    (err as any).code = errBody?.error?.code || 'ERROR';
    (err as any).details = errBody?.error?.details;
    (err as any).status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiClient = {
  // Health
  checkHealth: () => request('/health'),

  // Personas
  getPersonas: () => request('/api/personas'),

  // Profile
  parseResume: async (file?: File | null, text?: string) => {
    const sessionId = getClientSessionId();
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/profile/parse', {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId,
        },
        body: formData,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || 'Resume upload failed');
      }
      return res.json();
    } else {
      return request('/api/profile/parse', {
        method: 'POST',
        body: JSON.stringify({ text: text || '' }),
      });
    }
  },

  updateProfile: (profileId: string, data: any) =>
    request(`/api/profile/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getProfile: (profileId: string) => request(`/api/profile/${profileId}`),

  // Careers
  recommendCareers: (profileId: string, interests: string[] = []) =>
    request('/api/careers/recommend', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, interests }),
    }),

  // Skill Gaps
  computeSkillGaps: (profileId: string, targetRole?: string) =>
    request('/api/skills/gap', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, target_role: targetRole }),
    }),

  // Courses
  recommendCourses: (profileId: string, targetRole?: string) =>
    request('/api/courses/recommend', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, target_role: targetRole }),
    }),

  // Opportunities
  matchOpportunities: (profileId: string, targetRole?: string) =>
    request('/api/opportunities/match', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, target_role: targetRole }),
    }),

  // Govt Schemes
  matchGovtSchemes: (profileId: string) =>
    request('/api/govt/match', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId }),
    }),

  // Resume
  reviewResume: (profileId: string, targetRole?: string) =>
    request('/api/resume/review', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, target_role: targetRole }),
    }),

  rewriteResume: (profileId: string, targetRole?: string) =>
    request('/api/resume/rewrite', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, target_role: targetRole }),
    }),

  exportResume: async (resumeId: string, format: 'pdf' | 'docx' | 'txt' = 'txt') => {
    const sessionId = getClientSessionId();
    const res = await fetch(`/api/resume/export/${resumeId}?format=${format}`, {
      headers: { 'X-Session-ID': sessionId },
    });
    if (!res.ok) throw new Error('Failed to export resume');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATS_Optimized_Resume_${resumeId}.${format === 'pdf' ? 'txt' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Mock Interview
  startInterview: (profileId: string, role?: string, difficulty?: string) =>
    request('/api/interview/start', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, role, difficulty }),
    }),

  submitInterviewAnswer: (interviewId: string, answer: string) =>
    request('/api/interview/answer', {
      method: 'POST',
      body: JSON.stringify({ interview_id: interviewId, answer }),
    }),

  finishInterview: (interviewId: string) =>
    request('/api/interview/finish', {
      method: 'POST',
      body: JSON.stringify({ interview_id: interviewId }),
    }),

  // Roadmap
  getStoredRoadmap: (roadmapId: string) => request(`/api/roadmap/${roadmapId}`),

  // SSE Stream for roadmap generation (Section 7.4)
  streamRoadmap: async (
    params: { profileId: string; interests?: string[]; targetRole?: string },
    callbacks: {
      onStep: (data: { step: string; status: string; progress: number; data?: any }) => void;
      onDone: (roadmapId: string) => void;
      onError: (err: any) => void;
    },
    signal?: AbortSignal
  ) => {
    const sessionId = getClientSessionId();
    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          profile_id: params.profileId,
          interests: params.interests || [],
          target_role: params.targetRole,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`SSE stream failed: HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const rawMessage of lines) {
          if (!rawMessage.trim() || rawMessage.startsWith(':keepalive')) continue;

          let currentEvent = 'message';
          let currentData = '';

          for (const line of rawMessage.split('\n')) {
            if (line.startsWith('event: ')) {
              currentEvent = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              currentData = line.replace('data: ', '').trim();
            }
          }

          if (currentData) {
            try {
              const parsed = JSON.parse(currentData);
              if (currentEvent === 'step') {
                callbacks.onStep(parsed);
              } else if (currentEvent === 'done') {
                callbacks.onDone(parsed.roadmap_id);
              } else if (currentEvent === 'error') {
                callbacks.onError(parsed);
              }
            } catch (jsonErr) {
              console.warn('Failed to parse SSE line:', currentData);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        callbacks.onError(err);
      }
    }
  },

  // Session
  deleteSession: () =>
    request('/api/session', {
      method: 'DELETE',
    }),
};
