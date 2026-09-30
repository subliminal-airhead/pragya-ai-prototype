# Campus to Corporate: Implementation Plan for Claude Code

AI-Powered Career Readiness & Employability Platform · Hackathon Challenge 1
Backend: FastAPI (Python 3.11+) · Frontend: Next.js + TypeScript + Tailwind CSS

## How to use this document

1. Create the repo (Section 3), then copy **Part A (Ground Rules)** into `CLAUDE.md` at the repo root. Claude Code reads it on every session.
2. Copy the backend-specific and frontend-specific rules (A.6, A.7) into `backend/CLAUDE.md` and `frontend/CLAUDE.md`.
3. Save this whole file as `docs/IMPLEMENTATION_PLAN.md`.
4. Work **one phase at a time** (Part D). For each phase: start Claude Code in **plan mode**, paste that phase's prompt, review the plan, approve, let it build, run the acceptance checks, **commit**, then move on.
5. Use separate Claude Code sessions for backend and frontend (ideally separate git branches or worktrees) so context stays small. They meet only through the contract in Part C.

---

# PART A: GROUND RULES (copy into CLAUDE.md)

## A.1 Mission
Build a working prototype where a student uploads a resume and gets a personalised, India-specific career roadmap: profile, career matches, skill gaps, learning path, internships, government schemes, an improved resume, and a mock interview. Judging lens: **"Does this make a student more employable?"**

## A.2 Non-negotiables
1. **The LLM never invents courses, jobs, schemes, or URLs.** The LLM returns **IDs** that exist in `backend/data/*.json`. The server validates every ID and hydrates full records from the dataset. Unknown IDs are dropped.
2. **Deterministic first, LLM second.** Skill normalisation, gap analysis, eligibility filtering, and score arithmetic are plain code. The LLM handles extraction, ranking rationale, critique, rewriting, and interviewing.
3. **Every endpoint has a Pydantic `response_model`.** No untyped dict responses.
4. **snake_case JSON end to end.** No camelCase conversion anywhere.
5. **One error envelope** for every non-2xx response (Section C.5).
6. **Never invent URLs or scheme facts in datasets.** If unknown, set `"url": null` and `"verified": false`. A human verifies before demo.
7. **No secrets in git.** Keys live in `.env` (git-ignored) and deploy env vars. Ship `.env.example`.
8. **Never log resume contents or PII.** Log only IDs, timings, and error codes.
9. **`MOCK_LLM=1` must always work**, fully offline, returning fixture data. The whole demo path must run on it.
10. **Do not add libraries outside the approved stack** without asking.

## A.3 Approved stack

| Layer | Choice |
|---|---|
| Backend | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLModel (SQLite), `sse-starlette`, `python-multipart`, `httpx`, `python-dotenv` |
| LLM | Groq (Llama 3.3 70B) primary, Gemini fallback, Ollama for local dev, Mock provider |
| Parsing | PyMuPDF (`pymupdf`), `python-docx` |
| Retrieval | ChromaDB (persistent) + multilingual MiniLM embeddings (`paraphrase-multilingual-MiniLM-L12-v2`) |
| Export | WeasyPrint (HTML to PDF), `python-docx` (DOCX) |
| Frontend | Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, `lucide-react` |
| Frontend data | TanStack Query, Zustand (persisted), `openapi-typescript` + `openapi-fetch`, `@microsoft/fetch-event-source` |
| Frontend forms/UI | `react-hook-form` + `zod`, `react-dropzone`, `recharts`, `framer-motion` (sparingly), `sonner` |
| Testing | `pytest` + FastAPI `TestClient`; `tsc --noEmit` + `eslint` on the frontend |
| Deploy | Backend on Hugging Face Spaces (Docker) or Render; frontend on Vercel |

## A.4 Conventions
- **Python:** type hints everywhere, `ruff` for lint/format, small pure functions in `services/`, thin routers.
- **Route functions have meaningful names** (`parse_profile`, `generate_roadmap`). The name becomes the generated TS client function via `generate_unique_id_function`.
- **Prompts live in files** under `backend/app/prompts/`, never inline strings.
- **TypeScript:** strict mode, no `any`, all API types come from the generated `schema.d.ts`.
- **Commits:** one commit per completed task, message format `phaseN: what changed`.
- **After any backend schema change:** run `make gen-api` and fix frontend type errors in the same PR.

## A.5 Common commands (Makefile)

```makefile
dev-api:      cd backend && uvicorn app.main:app --reload --port 8000
dev-web:      cd frontend && npm run dev
gen-api:      cd frontend && npm run gen:api
test:         cd backend && pytest -q && cd ../frontend && npx tsc --noEmit && npm run lint
index:        cd backend && python scripts/build_index.py
check-links:  cd backend && python scripts/check_links.py
smoke:        python scripts/smoke.py $(API_URL)
mock:         cd backend && MOCK_LLM=1 uvicorn app.main:app --port 8000
```

## A.6 Backend rules (copy into `backend/CLAUDE.md`)
- All LLM calls go through `app/llm.py::generate(prompt_name, variables, schema)`. No direct provider SDK calls elsewhere.
- `generate()` must: render the prompt file, request JSON, validate against the Pydantic schema, retry **once** feeding back the validation error, cache by `sha256(provider+model+prompt+schema)` in SQLite, and honour `MOCK_LLM`.
- Provider fallback order: Groq, then Gemini, then Ollama. Raise `LLMUnavailable` (mapped to 503) if all fail.
- Every DB row carries `session_id`. Every read checks the `X-Session-ID` header matches. `DELETE /api/session` wipes everything for that session.
- SSE responses set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `X-Accel-Buffering: no`, and emit a `: keepalive` comment about every 10 s.

## A.7 Frontend rules (copy into `frontend/CLAUDE.md`)
- All server calls go through `src/lib/api/client.ts` (typed) or the two hand-written wrappers (`uploadResume`, `streamRoadmap`). No raw `fetch` in components except the export download helper.
- Every data area has a skeleton loading state, an error state, and an empty state.
- Every recommendation card links out (`target="_blank" rel="noopener noreferrer"`); if `url` is null, hide the button instead of showing a dead link.
- Mobile-first: test at 375 px. Wide content scrolls inside its own `overflow-x-auto` container.
- Errors are shown via `errors.ts` code-to-message mapping, never raw server text.
- Accessibility: labels on inputs, visible focus rings, sufficient contrast, keyboard-operable tabs.

---

# PART B: PROJECT BLUEPRINT SUMMARY

## B.1 Feature map

| # | Capability | Screen | Endpoint | Depth |
|---|---|---|---|---|
| 1 | Profile analysis | Start, Profile | `POST /api/profile/parse` | Full |
| 2 | Career paths | Roadmap, Careers tab | `POST /api/careers/recommend` | Full |
| 3 | Skill gaps | Roadmap, Skill Gaps tab | `POST /api/skills/gap` | Full |
| 4 | Courses/certs | Roadmap, Learning Path tab | `POST /api/courses/recommend` | Full |
| 5 | Internships/jobs | Roadmap, Opportunities tab | `POST /api/opportunities/match` | Medium |
| 6 | Resume improvement | Resume page | `POST /api/resume/review`, `/rewrite`, export | Full |
| 7 | Mock interview | Interview page | `POST /api/interview/*` | Medium |
| 8 | Govt opportunities | Roadmap, Govt tab | `POST /api/govt/match` | Medium |
| All | Chained roadmap | Roadmap (streamed) | `POST /api/roadmap/generate` (SSE) | The demo path |

## B.2 Architecture

```
Browser ── Next.js + Tailwind ──(REST + SSE, X-Session-ID)──> FastAPI
                                                               │
                        ┌──────────────────────────────────────┤
                        ▼                ▼               ▼     ▼
                    services/        llm.py           SQLite  ChromaDB
              (parser, normalizer,  (Groq/Gemini/    (sessions, (courses, roles,
               gap, scoring,         Ollama/Mock)     cache)    jobs, schemes)
               retrieval, export)                              + data/*.json
```

## B.3 Demo personas (also used as test fixtures)
1. Final-year B.Tech CS with projects and a weak resume. Shows the score jump.
2. BCom/BA student with no tech background. Shows career path recommender and govt schemes.
3. Diploma holder from a smaller MP town. Shows apprenticeships, PMKVY, state schemes.

## B.4 Pitch alignment
NEP 2020 (skill-linked pathways, NPTEL/SWAYAM), Skill India (Digital Hub, PMKVY, NAPS), Digital India (AI counselling at scale), Viksit Bharat 2047 (closing the degree-vs-employable gap). Delivered as an `/about` page and a slide.

---

# PART C: THE CONTRACT

## C.1 Conventions
| Rule | Value |
|---|---|
| Base URL | `NEXT_PUBLIC_API_URL` (frontend), served by FastAPI |
| Prefix | `/api` |
| Session | Frontend creates a UUID once, sends `X-Session-ID` on every request |
| IDs | UUID strings for runtime objects; stable slugs for dataset records |
| Dates | ISO 8601 |
| Lists | `[]`, never `null` |
| Casing | snake_case |

## C.2 Schemas (`backend/app/schemas.py`, freeze on Day 1)

```python
from pydantic import BaseModel, Field
from typing import Literal

# ---------- Profile ----------
class Education(BaseModel):
    degree: str
    field: str | None = None
    institution: str | None = None
    year: int | None = None
    score: str | None = None            # "8.1 CGPA" / "72%"

class Project(BaseModel):
    title: str
    description: str = ""
    skills: list[str] = []

class Experience(BaseModel):
    role: str
    organization: str | None = None
    duration: str | None = None
    description: str = ""

class Eligibility(BaseModel):           # OPTIONAL, opt-in, used only for govt matching
    age: int | None = None
    highest_qualification: str | None = None
    domicile_state: str | None = None
    category: str | None = None         # sensitive: user-provided, optional, never inferred

class StudentProfile(BaseModel):
    name: str | None = None
    location: str | None = None
    summary: str = ""
    education: list[Education] = []
    skills: list[str] = []
    projects: list[Project] = []
    experience: list[Experience] = []
    certifications: list[str] = []
    interests: list[str] = []
    languages: list[str] = []
    eligibility: Eligibility = Eligibility()

class ProfileParseResponse(BaseModel):
    profile_id: str
    profile: StudentProfile

# ---------- Recommendations ----------
class CareerMatch(BaseModel):
    role_id: str
    title: str
    match_score: int = Field(ge=0, le=100)
    reasons: list[str]
    growth_outlook: str = ""
    indicative_entry_salary_lpa: str | None = None   # from dataset, labelled "indicative"

class MissingSkill(BaseModel):
    skill: str
    importance: Literal["critical", "important", "nice_to_have"]
    reason: str = ""

class SkillGapReport(BaseModel):
    target_role_id: str
    target_role_title: str
    matched_skills: list[str]
    missing_skills: list[MissingSkill]
    readiness_pct: int = Field(ge=0, le=100)

class CourseRec(BaseModel):
    course_id: str
    title: str
    provider: str
    url: str | None
    skills_covered: list[str]
    level: Literal["beginner", "intermediate", "advanced"]
    duration_weeks: int | None = None
    cost_inr: int = 0
    certificate: bool = False
    order: int                            # position in the learning path
    rationale: str

class Opportunity(BaseModel):
    opportunity_id: str
    title: str
    organization: str
    type: Literal["internship", "job", "apprenticeship"]
    location: str
    mode: Literal["remote", "onsite", "hybrid"]
    stipend_or_salary: str | None = None
    url: str | None
    match_score: int = Field(ge=0, le=100)
    matched_skills: list[str]
    missing_skills: list[str]

class GovtScheme(BaseModel):
    scheme_id: str
    name: str
    kind: Literal["scheme", "exam", "apprenticeship", "training", "portal"]
    authority: str
    benefits: str
    url: str | None
    eligible: Literal["yes", "no", "unknown"]
    reasons: list[str]                    # why eligible / what is missing
    last_verified: str | None = None

# ---------- Score ----------
class ScoreComponent(BaseModel):
    name: Literal["skills", "projects", "experience", "resume_quality", "certifications"]
    score: int = Field(ge=0, le=100)
    weight: float
    note: str = ""

class EmployabilityScore(BaseModel):
    total: int = Field(ge=0, le=100)
    components: list[ScoreComponent]

# ---------- Resume ----------
class ResumeIssue(BaseModel):
    severity: Literal["high", "medium", "low"]
    section: str
    message: str
    suggestion: str

class ResumeReview(BaseModel):
    score: EmployabilityScore
    strengths: list[str]
    issues: list[ResumeIssue]

class ResumeSection(BaseModel):
    title: str
    items: list[str]                      # bullets or lines

class ResumeRewrite(BaseModel):
    resume_id: str
    sections: list[ResumeSection]
    changes_summary: list[str]
    score_after: EmployabilityScore
    placeholders: list[str] = []          # things the student must fill in

# ---------- Interview ----------
class InterviewQuestion(BaseModel):
    text: str
    kind: Literal["technical", "behavioral", "situational"]
    index: int
    total: int

class InterviewStartResponse(BaseModel):
    interview_id: str
    question: InterviewQuestion

class AnswerFeedback(BaseModel):
    relevance: int = Field(ge=0, le=10)
    structure: int = Field(ge=0, le=10)
    depth: int = Field(ge=0, le=10)
    feedback: str
    improvement: str
    next_question: InterviewQuestion | None = None

class InterviewSummary(BaseModel):
    overall: int = Field(ge=0, le=100)
    strengths: list[str]
    weaknesses: list[str]
    next_steps: list[str]

# ---------- Roadmap ----------
class Roadmap(BaseModel):
    roadmap_id: str
    profile_id: str
    target_role_id: str | None
    careers: list[CareerMatch]
    gaps: SkillGapReport | None
    courses: list[CourseRec]
    opportunities: list[Opportunity]
    govt: list[GovtScheme]
    score: EmployabilityScore | None

class StepEvent(BaseModel):
    step: Literal["careers", "gaps", "courses", "opportunities", "govt", "score"]
    status: Literal["started", "done", "failed"]
    progress: float
    data: dict | list | None = None

# ---------- Requests ----------
class ParseTextRequest(BaseModel):
    text: str = Field(min_length=50)

class RoadmapRequest(BaseModel):
    profile_id: str
    interests: list[str] = []
    target_role_id: str | None = None

class ProfileRoleRequest(BaseModel):
    profile_id: str
    target_role_id: str

class ErrorBody(BaseModel):
    code: str
    message: str
    details: dict = {}

class ErrorEnvelope(BaseModel):
    error: ErrorBody
```

> The schemas above are the starting contract. Claude Code may add optional fields, but must not rename or remove any without asking. Any change triggers `make gen-api`.

## C.3 Endpoints

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/health` | none | `{status, llm, mock}` |
| POST | `/api/profile/parse` | multipart `file` **or** `ParseTextRequest` | `ProfileParseResponse` |
| PUT | `/api/profile/{profile_id}` | `StudentProfile` | `StudentProfile` |
| POST | `/api/roadmap/generate` | `RoadmapRequest` | SSE stream |
| GET | `/api/roadmap/{roadmap_id}` | none | `Roadmap` |
| POST | `/api/careers/recommend` | `RoadmapRequest` | `list[CareerMatch]` |
| POST | `/api/skills/gap` | `ProfileRoleRequest` | `SkillGapReport` |
| POST | `/api/courses/recommend` | `ProfileRoleRequest` | `list[CourseRec]` |
| POST | `/api/opportunities/match` | `RoadmapRequest` | `list[Opportunity]` |
| POST | `/api/govt/match` | `{profile_id}` | `list[GovtScheme]` |
| POST | `/api/resume/review` | `ProfileRoleRequest` | `ResumeReview` |
| POST | `/api/resume/rewrite` | `ProfileRoleRequest` | `ResumeRewrite` |
| GET | `/api/resume/export/{resume_id}?format=pdf\|docx` | none | file |
| POST | `/api/interview/start` | `{profile_id, role_id, difficulty}` | `InterviewStartResponse` |
| POST | `/api/interview/answer` | `{interview_id, answer}` | `AnswerFeedback` |
| POST | `/api/interview/finish` | `{interview_id}` | `InterviewSummary` |
| DELETE | `/api/session` | none | `204` |

Standalone feature endpoints exist for testing and independent calls. The SSE endpoint calls the **same service functions**.

## C.4 SSE spec (`POST /api/roadmap/generate`)
Fixed step order: `careers → gaps → courses → opportunities → govt → score`.

```
event: step
data: {"step":"careers","status":"started","progress":0.05}

event: step
data: {"step":"careers","status":"done","progress":0.25,"data":[...CareerMatch]}

event: done
data: {"roadmap_id":"..."}

event: error
data: {"code":"LLM_UNAVAILABLE","message":"...","step":"courses"}
```
- If a step fails, emit `status:"failed"` and **continue** with independent steps.
- The roadmap is persisted as it builds, so `GET /api/roadmap/{id}` works after refresh.
- If `target_role_id` is not given, gaps/courses/opportunities use the **top-ranked career match**.

## C.5 Error envelope

| HTTP | `code` | Meaning |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Bad input (also remap FastAPI's default 422) |
| 413 | `FILE_TOO_LARGE` | Over 5 MB |
| 415 | `FILE_UNSUPPORTED` | Not PDF/DOCX |
| 422 | `PARSE_FAILED` | Could not extract usable text |
| 404 | `NOT_FOUND` | Unknown or foreign-session ID |
| 429 | `RATE_LIMITED` | Provider or per-session limit |
| 503 | `LLM_UNAVAILABLE` | All providers failed |
| 500 | `INTERNAL` | Anything else; include `X-Request-ID` |

## C.6 CORS and headers (backend)

```python
app = FastAPI(generate_unique_id_function=lambda r: r.name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"], allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Request-ID"],
)
```

## C.7 Environment variables

| Var | Side | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | frontend | `http://localhost:8000` locally |
| `ALLOWED_ORIGINS` | backend | comma-separated |
| `GROQ_API_KEY`, `GEMINI_API_KEY` | backend only | never in git |
| `LLM_PROVIDER` | backend | `groq` (default), `gemini`, `ollama`, `mock` |
| `OLLAMA_BASE_URL`, `OLLAMA_MODEL` | backend | local dev |
| `MOCK_LLM` | backend | `1` forces mock provider |
| `DATABASE_URL` | backend | `sqlite:///./app.db` |
| `CHROMA_DIR` | backend | `./chroma_store` |

## C.8 Change protocol
1. Freeze `schemas.py` and publish a first `openapi.json` on Day 1.
2. Adding fields is free; renaming/removing requires team notice.
3. After any schema change: backend commits, frontend runs `make gen-api` and fixes type errors.
4. Both sides use `/fixtures/*.json` (real-shaped responses). Frontend can develop against fixtures or `MOCK_LLM=1`.
5. Integration checkpoint at the end of every phase, on **deployed** URLs from Phase 3 onward.

---

# PART D: PROJECT STRUCTURE

```
career-platform/
├── CLAUDE.md                         # Part A
├── Makefile
├── README.md
├── .gitignore
├── docs/
│   └── IMPLEMENTATION_PLAN.md        # this file
├── fixtures/                         # shared, real-shaped sample responses
│   ├── profile_persona1.json  profile_persona2.json  profile_persona3.json
│   ├── careers.json  gaps.json  courses.json  opportunities.json  govt.json
│   ├── resume_review.json  resume_rewrite.json
│   ├── interview_start.json  interview_answer.json  interview_summary.json
│   └── resumes/                      # persona1.pdf, persona2.docx, persona3.pdf + .txt versions
├── scripts/
│   └── smoke.py                      # end-to-end check against any API_URL
├── backend/
│   ├── CLAUDE.md                     # A.6
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── app/
│   │   ├── main.py                   # app, CORS, exception handlers, router mounting, startup index check
│   │   ├── config.py                 # pydantic-settings, env vars
│   │   ├── errors.py                 # AppError classes + handlers → ErrorEnvelope
│   │   ├── deps.py                   # get_session_id, get_db
│   │   ├── schemas.py                # Section C.2
│   │   ├── db.py                     # SQLModel tables + engine
│   │   ├── llm.py                    # generate(), providers, cache, mock
│   │   ├── routers/
│   │   │   ├── health.py  profile.py  careers.py  skills.py  courses.py
│   │   │   ├── opportunities.py  govt.py  resume.py  interview.py
│   │   │   ├── roadmap.py            # SSE + GET
│   │   │   └── session.py
│   │   ├── services/
│   │   │   ├── resume_parser.py      # file/text → clean text
│   │   │   ├── profile_service.py    # text → StudentProfile (LLM) + persistence
│   │   │   ├── skill_normalizer.py   # aliases + embedding fallback
│   │   │   ├── gap_analysis.py       # deterministic weighted diff
│   │   │   ├── retrieval.py          # Chroma queries + metadata filters
│   │   │   ├── careers_service.py    # embed-score + LLM re-rank by role_id
│   │   │   ├── courses_service.py    # retrieve → LLM orders IDs → hydrate
│   │   │   ├── opportunities_service.py
│   │   │   ├── govt_service.py       # hard eligibility filter + LLM explain
│   │   │   ├── scoring.py            # EmployabilityScore
│   │   │   ├── resume_service.py     # review + rewrite
│   │   │   ├── interview_service.py  # state machine
│   │   │   ├── roadmap_service.py    # orchestrates the chain, yields StepEvents
│   │   │   └── export.py             # PDF/DOCX
│   │   ├── prompts/
│   │   │   ├── profile_extract.md
│   │   │   ├── careers_rerank.md
│   │   │   ├── gap_explain.md
│   │   │   ├── courses_order.md
│   │   │   ├── opportunities_rank.md
│   │   │   ├── govt_explain.md
│   │   │   ├── resume_review.md
│   │   │   ├── resume_rewrite.md
│   │   │   ├── interview_questions.md
│   │   │   ├── interview_evaluate.md
│   │   │   └── interview_summary.md
│   │   └── templates/
│   │       └── resume.html           # WeasyPrint template
│   ├── data/
│   │   ├── roles.json  skills_aliases.json  courses.json
│   │   ├── internships.json  govt_schemes.json  govt_jobs.json
│   │   └── README.md                 # sources, schema, verification notes
│   ├── scripts/
│   │   ├── build_index.py            # embeds data → Chroma
│   │   ├── validate_data.py          # schema + ID-reference checks
│   │   └── check_links.py            # HEAD-request all URLs, write report
│   └── tests/
│       ├── conftest.py               # TestClient, MOCK_LLM=1, temp DB
│       ├── test_parser.py  test_normalizer.py  test_gap_analysis.py
│       ├── test_scoring.py  test_govt_eligibility.py
│       ├── test_mock_schemas.py      # every fixture validates against schemas
│       └── test_api_smoke.py         # full flow on mock
└── frontend/
    ├── CLAUDE.md                     # A.7
    ├── .env.local.example
    ├── package.json  tsconfig.json  next.config.ts  components.json
    └── src/
        ├── app/
        │   ├── layout.tsx            # fonts (Inter, Noto Sans Devanagari), providers, Toaster
        │   ├── globals.css           # Tailwind + design tokens
        │   ├── page.tsx              # landing + demo persona buttons
        │   ├── start/page.tsx
        │   ├── profile/page.tsx
        │   ├── roadmap/page.tsx
        │   ├── resume/page.tsx
        │   ├── interview/page.tsx
        │   └── about/page.tsx
        ├── components/
        │   ├── ui/                   # shadcn primitives
        │   ├── layout/               # Header, Footer, PageShell, Stepper nav
        │   ├── roadmap/              # ProgressStepper, ScoreRing, CareerCard, SkillGapList,
        │   │                         # CourseCard, OpportunityCard, SchemeCard, RoadmapTabs
        │   ├── resume/               # BeforeAfter, CritiqueList, ExportButtons, ScoreDelta
        │   ├── interview/            # ChatBubble, FeedbackPanel, MicButton (stretch)
        │   ├── profile/              # ProfileEditor, SkillChips, EligibilityForm
        │   └── common/               # ApiErrorBoundary, WakingServerBanner, Skeletons, EmptyState
        ├── hooks/
        │   ├── useHealthPing.ts  useParseProfile.ts  useRoadmapStream.ts
        │   ├── useResume.ts  useInterview.ts
        ├── lib/
        │   ├── api/
        │   │   ├── schema.d.ts       # GENERATED
        │   │   ├── client.ts         # openapi-fetch + middleware
        │   │   ├── upload.ts         # uploadResume()
        │   │   ├── sse.ts            # streamRoadmap()
        │   │   ├── download.ts       # blob download helper
        │   │   └── errors.ts         # ApiError + code→message
        │   ├── store.ts              # Zustand
        │   ├── personas.ts           # demo persona definitions
        │   ├── i18n.ts               # tiny en/hi dictionary (stretch)
        │   └── utils.ts
        └── types/index.ts            # aliases over generated types
```

---

# PART E: BACKEND IMPLEMENTATION SPEC

## E.1 `config.py`, `errors.py`, `deps.py`
- Settings via `pydantic-settings`. Parse `ALLOWED_ORIGINS` as a comma-separated list.
- `AppError(code, message, http_status, details)` with subclasses per C.5. One handler converts `AppError`, `RequestValidationError`, and unhandled exceptions to `ErrorEnvelope`. Add `X-Request-ID` middleware.
- `get_session_id` dependency: reads `X-Session-ID`, validates it as a UUID, raises `VALIDATION_ERROR` if missing.

## E.2 `db.py` tables (SQLModel)
| Table | Key columns |
|---|---|
| `Session` | `id`, `created_at`, `last_seen` |
| `ProfileRow` | `id`, `session_id`, `profile_json`, `raw_text_hash` (no raw text stored) |
| `RoadmapRow` | `id`, `session_id`, `profile_id`, `roadmap_json`, `status`, `updated_at` |
| `ResumeRow` | `id`, `session_id`, `profile_id`, `resume_json`, `score_before`, `score_after` |
| `InterviewRow` | `id`, `session_id`, `role_id`, `difficulty`, `turns_json`, `status` |
| `LLMCache` | `key`, `response_json`, `created_at` |

Raw resume text is processed in memory and discarded after profile extraction.

## E.3 `llm.py`
```python
def generate(prompt_name: str, variables: dict, schema: type[T]) -> T: ...
```
1. If `MOCK_LLM=1` or provider is `mock`: load `fixtures/<SchemaName>.json` (or a per-prompt fixture) and validate.
2. Render `prompts/<prompt_name>.md` with variables (simple `{{var}}` substitution).
3. Check the cache; return on hit.
4. Try providers in order. Each provider function: send the system prompt "Return ONLY valid JSON matching this schema", the schema JSON, and the user content; use JSON mode where supported.
5. Parse, then validate with Pydantic. On failure, retry **once** with the error message appended.
6. Store in cache, return.
7. On all-provider failure raise `LLMUnavailable`.
- Timeout per call about 30 s. Groq `429` triggers immediate fallback to the next provider.

## E.4 `resume_parser.py`
- PDF: PyMuPDF text extraction, page by page, sorted blocks. DOCX: paragraphs plus table cells.
- Validate size (≤ 5 MB), extension, and MIME sniffing. Reject others (`FILE_UNSUPPORTED`).
- If extracted text is under ~200 characters, raise `PARSE_FAILED` with a message suggesting paste-text (likely a scanned PDF; OCR is out of scope).
- Clean whitespace and hyphenation. Never log the text.

## E.5 `profile_service.py`
- `profile_extract.md` prompt returns `StudentProfile`. Rules in the prompt: extract only what is present, no invention, normalise degrees, leave unknown fields empty.
- After extraction, run skills through `skill_normalizer` and store canonical names.
- `PUT /api/profile/{id}` replaces the profile (student edits), re-normalising skills.

## E.6 `skill_normalizer.py`
- `skills_aliases.json` maps aliases to canonical IDs (`"js" → "javascript"`, `"ml" → "machine learning"`, `"ms excel" → "excel"`).
- Order: exact alias match, then lowercase/strip punctuation, then embedding nearest neighbour against canonical skills with a similarity threshold (~0.75). Below the threshold, keep the original string as a free-text skill (it still displays, but is not scored).
- Unit-test with at least 30 alias cases, including Hinglish and typos.

## E.7 `gap_analysis.py` (pure code)
- `roles.json` role entry: `required_skills: [{skill, importance}]` where critical = 3, important = 2, nice_to_have = 1.
- `readiness_pct = round(100 * matched_weight / total_weight)`.
- `missing_skills` sorted by weight descending. The `gap_explain.md` prompt fills only the `reason` text; it **cannot** add or remove skills.

## E.8 `retrieval.py`
- Collections: `roles`, `courses`, `opportunities`, `schemes`. Embedding text = title + skills + short description. Metadata carries `level`, `cost_inr`, `type`, `mode`, and so on.
- `search(collection, query_text, k, where=None)` returns records with distances.
- `scripts/build_index.py` rebuilds the index from JSON. On app startup, if the Chroma dir is empty, build it automatically (a few hundred documents; takes seconds).

## E.9 Feature services

**careers_service**
1. Embed a profile query (skills, projects, interests, education). Get the top 8 roles from Chroma.
2. `careers_rerank.md` receives the 8 candidates (IDs, required skills) and the profile. It returns ≤ 5 `{role_id, match_score, reasons}`.
3. Server drops unknown `role_id`s, hydrates `title`, `growth_outlook`, and `indicative_entry_salary_lpa` from `roles.json`.

**courses_service**
1. From `SkillGapReport.missing_skills`, query `courses` per critical/important skill, filter by level (beginner if the profile has little evidence), and prefer `cost_inr == 0`.
2. `courses_order.md` gets the candidate courses (IDs) and must return an ordered list of `{course_id, order, rationale}`, at most 6 to 8 items, foundational first.
3. Server validates IDs, hydrates the rest from `courses.json`, and reindexes `order`.

**opportunities_service**
- Filter by role/skill overlap, compute `matched_skills` / `missing_skills` deterministically, and `match_score` from overlap ratio. The LLM may only reorder and is optional; skip it in mock mode.

**govt_service**
- Hard filter first from `eligibility` rules in `govt_schemes.json` (`min_age`, `max_age`, `min_qualification`, `domicile_states`, `categories`, all optional).
- If the profile lacks the data needed for a rule, set `eligible: "unknown"` and list what is missing in `reasons`. Never guess.
- `govt_explain.md` writes the human-readable `reasons` text only.

**scoring.py**
| Component | Weight | Basis |
|---|---|---|
| skills | 0.35 | `readiness_pct` against the target role |
| projects | 0.20 | count and skill relevance of projects (formula) |
| experience | 0.15 | internships/jobs present and relevance |
| resume_quality | 0.20 | LLM rubric 0 to 100 from `resume_review.md` |
| certifications | 0.10 | count and relevance of certifications |

`total = round(sum(score * weight))`. Everything except `resume_quality` is deterministic and unit-tested.

**resume_service**
- `review`: builds `ResumeReview` (score, strengths, issues with concrete suggestions).
- `rewrite`: `resume_rewrite.md` returns structured sections. Rules: **no fabricated experience**, strong action verbs, quantify impact only where the source gives numbers, and use `[ADD: ...]` placeholders (also listed in `placeholders`) where information is missing. The service recomputes `score_after` on the rewritten content.
- Persist `ResumeRow`; `export.py` renders the stored JSON.

**export.py**
- PDF via WeasyPrint + `templates/resume.html` (one clean single-column ATS-friendly layout). DOCX via `python-docx`. Filename `resume_<role>.pdf|docx`. Set `Content-Disposition`.

**interview_service**
- `start`: `interview_questions.md` produces 5 questions grounded in the role's required skills (mix of technical/behavioral/situational; difficulty changes depth). Store them.
- `answer`: `interview_evaluate.md` scores relevance/structure/depth (0 to 10), returns feedback, an improvement tip, and the next question from the stored list.
- `finish`: `interview_summary.md` returns `InterviewSummary`.
- Transcript stored in `InterviewRow.turns_json`.

**roadmap_service**
- `async def run(profile_id, interests, target_role_id) -> AsyncIterator[StepEvent]` executes the fixed step order, persists after each step, and never lets one failure abort independent steps.
- Run blocking LLM calls in a thread pool (`run_in_threadpool`) so the event loop isn't blocked.
- Where steps are independent (opportunities and govt), run them concurrently.

## E.10 Prompt file contract
Every prompt file begins with a short role statement, then rules, then `{{variables}}`. All prompts must include:
- "Return ONLY JSON matching the schema."
- "Use only information present in the input. Do not invent facts."
- For any ranking prompt: "Return only IDs from the provided list."

## E.11 Datasets (`backend/data/`)

| File | Target size | Key fields |
|---|---|---|
| `roles.json` | 18 roles | `id, title, category, required_skills[{skill,importance}], typical_education, growth_outlook, indicative_entry_salary_lpa, related_roles, interview_topics` |
| `skills_aliases.json` | 300+ aliases | `canonical → [aliases]` |
| `courses.json` | ~100 | `id, title, provider, url, skills_taught, level, duration_weeks, cost_inr, certificate, language, last_verified, verified` |
| `internships.json` | ~40 | `id, title, organization, type, location, mode, stipend_or_salary, skills, url, source, verified` |
| `govt_schemes.json` | ~25 to 30 | `id, name, kind, authority, benefits, url, eligibility{min_age,max_age,min_qualification,domicile_states,categories}, last_verified, verified` |
| `govt_jobs.json` | ~15 | exams/posts: `id, name, body, qualification, age_limit, url, verified` |

**Suggested roles (18):** Backend Developer, Frontend Developer, Full-Stack Developer, Data Analyst, Data Scientist, ML Engineer, DevOps/Cloud Engineer, Cybersecurity Analyst, QA/Test Engineer, UI/UX Designer, Digital Marketing Executive, Business Analyst, Technical Content Writer, Accounts/Finance Executive, Customer Support/BPO Associate, Embedded/IoT Engineer, Banking/Finance Exam Aspirant track, Government Exam Aspirant track.

**Candidate govt items to research and verify (not authoritative):** PM Internship Scheme, PMKVY, NAPS (apprenticeship), National Career Service, Skill India Digital Hub, MP Rojgar Portal, CM Seekho Kamao Yojana (MP), Startup India, MPESB and MPPSC exams, SSC, IBPS, RRB. **Human verification of every name, eligibility rule, and URL is mandatory before demo.**

**Data tooling Claude Code should build:**
- `validate_data.py`: JSON Schema/Pydantic validation, unique IDs, all `related_roles` and skill references resolve, alias targets exist.
- `check_links.py`: HEAD (fallback GET) each non-null URL, write `link_report.md` with status codes; failures flip `verified` to false in a report, never silently edit data.
- Claude Code may **draft** dataset entries but must mark `verified: false` and leave URLs `null` when not certain. The data curator fills real URLs.

---

# PART F: FRONTEND IMPLEMENTATION SPEC

## F.1 Setup commands (verify flags against current docs)
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
npx shadcn@latest init
npx shadcn@latest add button card tabs badge progress input textarea select skeleton sonner separator accordion dialog scroll-area
npm i lucide-react zustand @tanstack/react-query openapi-fetch @microsoft/fetch-event-source \
      react-hook-form zod @hookform/resolvers react-dropzone recharts framer-motion
npm i -D openapi-typescript
```
`package.json` script: `"gen:api": "openapi-typescript $NEXT_PUBLIC_API_URL/openapi.json -o src/lib/api/schema.d.ts"`.
If Tailwind v4 and the shadcn init conflict, fall back to Tailwind v3.

## F.2 Design system
```css
/* globals.css */
@theme {
  --color-brand-50:  #eef2ff;
  --color-brand-600: #4f46e5;   /* primary actions */
  --color-accent-500: #f59e0b;  /* amber: govt + highlights */
  --color-success-600: #059669; /* score up, eligible */
  --font-sans: var(--font-inter), var(--font-devanagari), system-ui, sans-serif;
}
```
Neutrals: Tailwind `slate`. Page `bg-slate-50`; cards `rounded-2xl border bg-white shadow-sm`. One primary, one accent. Load Inter and Noto Sans Devanagari with `next/font`.

## F.3 Screens

| Route | Behaviour |
|---|---|
| `/` | Hero, single CTA to `/start`, three **"Try demo profile"** buttons (load a persona's fixture resume text and go straight to `/profile`), alignment badges |
| `/start` | Dropzone (PDF/DOCX, 5 MB, client-validated), paste-text tab, interest chips, optional target role select (from a `GET`-less static list mirrored from `roles.json` ids/titles, or a small `/api/roles` endpoint if added) |
| `/profile` | Editable parsed profile (education, skills chips, projects), optional **EligibilityForm** (age, qualification, state, category; clearly marked optional with a one-line privacy note), "Looks right, build my roadmap" |
| `/roadmap` | Streaming `ProgressStepper` on top; `RoadmapTabs`: Overview (ScoreRing + top matches), Careers, Skill Gaps, Learning Path, Opportunities, Govt Schemes. Each tab shows a skeleton until its step arrives. Failed step shows an inline retry that calls the standalone endpoint |
| `/resume` | Review (score + issues), "Improve my resume" button, BeforeAfter view, `ScoreDelta`, placeholders list highlighted, PDF and DOCX download |
| `/interview` | Role and difficulty select, chat UI, per-answer FeedbackPanel with three scores, finish, then summary card |
| `/about` | NEP 2020, Skill India, Digital India, Viksit Bharat 2047 mapping; short privacy note |

## F.4 State (`store.ts`, Zustand + persist)
`sessionId` (uuid created on first load), `profileId`, `profile`, `targetRoleId`, `roadmapId`, `resumeId`, `interviewId`, plus `setX` actions and `reset()` (which also calls `DELETE /api/session`).
On `/roadmap` mount: if `roadmapId` exists, load `GET /api/roadmap/{id}`; otherwise start the stream.

## F.5 API layer
- `client.ts`: `createClient<paths>`, middleware adds `X-Session-ID`, throws `ApiError` on non-2xx (parsing the envelope).
- `upload.ts`: `FormData` upload for `/api/profile/parse`; also `parseText()`.
- `sse.ts`: `streamRoadmap()` using `fetchEventSource` with `openWhenHidden: true`, an `AbortController`, and `onerror` that rethrows (no silent infinite retry).
- `download.ts`: fetch with header, then blob, then temporary anchor click, then `revokeObjectURL`.
- `errors.ts`: code-to-friendly-message map (C.5), plus rules: no retry on 4xx except one auto-retry after 3 s on `RATE_LIMITED`; one retry on 502/503.
- `useHealthPing`: pings `/health` on load; if it takes over 3 s, show `WakingServerBanner`.

## F.6 UX rules (enforced)
- Skeletons everywhere data loads; progressive reveal per SSE step.
- Score is the hero: `ScoreRing` (recharts radial) with component breakdown and "+X after improvements" delta.
- Mobile-first at 375 px, with tables and long content in `overflow-x-auto`.
- Cards always link out to the real URL; hide the button if `url` is null.
- Toasts (sonner) for recoverable errors; never a stack trace or raw server message.
- Motion is minimal: stepper progress and tab fade only.
- Hindi toggle is stretch: static label dictionary only, not a full i18n system.

---

# PART G: PHASED BUILD PLAN

**Rules for every phase:** plan mode first; small commits; run `make test`; finish with the checkpoint; don't start the next phase until the checkpoint passes.

## Phase 0: Contract and scaffolding
**Backend**
- [ ] Monorepo, `.gitignore`, `Makefile`, `.env.example` files
- [ ] `config.py`, `errors.py`, `deps.py`, `db.py`, `main.py` (CORS, handlers, request-id)
- [ ] `schemas.py` from C.2
- [ ] `llm.py` with the mock provider working; `/health`
- [ ] Router stubs for **every** endpoint returning fixture data, so the OpenAPI spec is complete on Day 1
- [ ] `fixtures/*.json` for every response schema (3 personas for profile)

**Frontend**
- [ ] Next.js + Tailwind + shadcn setup, providers, layout, fonts, tokens
- [ ] `client.ts`, `errors.ts`, `store.ts`, `useHealthPing`, `WakingServerBanner`
- [ ] `npm run gen:api` produces `schema.d.ts`; `tsc` passes

**Checkpoint:** frontend loads, shows health status from the backend, and a test button calls one stub endpoint with a typed client.

**Prompt for Claude Code (backend):**
> Read CLAUDE.md and docs/IMPLEMENTATION_PLAN.md Parts A, C, E.1, E.2, E.3. Scaffold the backend per Part D. Implement config, errors (envelope from C.5), deps (session header), db tables (E.2), main.py with CORS (C.6) and `generate_unique_id_function`, `schemas.py` exactly as C.2, and `llm.py` with the mock provider only. Create a router stub for every endpoint in C.3 returning validated fixture data from `/fixtures`, including a working SSE stub for `/api/roadmap/generate` that follows C.4. Create the fixtures for all three personas. Add `test_mock_schemas.py` proving every fixture validates. Do not implement real LLM providers yet.

**Prompt for Claude Code (frontend):**
> Read CLAUDE.md and Parts A.7, C, F.1, F.2, F.4, F.5. Scaffold the Next.js app using the setup commands in F.1. Build the app shell (layout, header, fonts, tokens), the typed API client with the session-header middleware and ApiError, the Zustand store, health ping with WakingServerBanner, and `gen:api`. Add a temporary `/dev` page that calls `GET /health` and one stub endpoint and displays the typed result.

## Phase 1: Data layer (parallel, human-led)
- [ ] Data curator drafts `roles.json`, `courses.json`, `internships.json`, `govt_schemes.json`, `govt_jobs.json`, `skills_aliases.json` using the E.11 schemas
- [ ] Claude Code builds `validate_data.py`, `check_links.py`, `build_index.py`, and `data/README.md`
- [ ] Claude Code drafts dataset skeletons with `verified: false` and `url: null` where uncertain
- [ ] Human fills and verifies URLs and eligibility rules; run `make check-links`

**Checkpoint:** `validate_data.py` passes; index builds; a Chroma query for "python data analysis" returns sensible courses.

**Prompt:**
> Read Part E.8 and E.11. Create the Pydantic/JSON-schema validators for every dataset file, `scripts/validate_data.py`, `scripts/check_links.py` (HEAD then GET fallback, writes `link_report.md`, never edits data), and `scripts/build_index.py`. Then draft skeleton entries for `roles.json` (18 roles) and `skills_aliases.json`. Do NOT invent URLs or scheme facts: use `null` and `verified:false` for anything you are not certain about. Add tests that fail if a dataset references an unknown ID.

## Phase 2: The spine (parse, profile, gaps, careers, courses)
**Backend**
- [ ] Real LLM providers in `llm.py` (Groq, Gemini, Ollama), retry-once, cache
- [ ] `resume_parser.py`, `profile_service.py`, `skill_normalizer.py`
- [ ] `gap_analysis.py`, `retrieval.py`, `careers_service.py`, `courses_service.py`
- [ ] Routers switched from stubs to real services (mock mode still returns fixtures)
- [ ] Tests: parser, normalizer (30+ cases), gap analysis, ID-validation of LLM outputs

**Frontend**
- [ ] `/start`, `/profile`, persona buttons, `ProfileEditor`, `EligibilityForm`
- [ ] Careers, Skill Gaps, and Learning Path components, wired to the standalone endpoints

**Checkpoint:** upload persona 1's resume, review the profile, and see real career matches, a real skill-gap report, and a real ordered course path with working links.

**Prompt (backend):**
> Read Parts A, C, E.3 to E.9. Implement the real LLM providers with the fallback chain, retry-once validation, and SQLite cache. Implement resume_parser, profile_service, skill_normalizer, gap_analysis, retrieval, careers_service, and courses_service exactly as specified. LLM outputs for ranking must be IDs only; validate and hydrate from data. Write the prompt files for profile_extract, careers_rerank, gap_explain, courses_order. Replace the stubs for /profile, /careers, /skills, /courses. Add the tests listed in Phase 2. Keep MOCK_LLM working.

**Prompt (frontend):**
> Read Parts A.7 and F.3 to F.6. Build /start, /profile, and the Careers, Skill Gaps, and Learning Path components using the generated types. Implement `uploadResume`, paste-text parsing, the ProfileEditor with skill chips, the optional EligibilityForm with a privacy note, and the three demo persona buttons. All data areas need skeleton, error, and empty states.

## Phase 3: Streaming roadmap
**Backend**
- [ ] `roadmap_service.py` orchestrator, `/api/roadmap/generate` (SSE), `GET /api/roadmap/{id}`
- [ ] Scoring service and `EmployabilityScore`
- [ ] Persist after each step; failure isolation; keepalive

**Frontend**
- [ ] `sse.ts`, `useRoadmapStream`, `ProgressStepper`, `RoadmapTabs`, `ScoreRing`
- [ ] Reload-safe `/roadmap` (loads by `roadmapId`)

**Deploy:** first deployment of both sides (Part H).

**Checkpoint (on deployed URLs):** click a persona button, watch the stepper stream, tabs fill in, refresh the page, and the roadmap reloads without re-streaming.

**Prompt:**
> Read Parts C.4, E.9 (roadmap_service, scoring), F.3 and F.5. Implement the roadmap orchestrator yielding StepEvents in the fixed order, persisting after each step, isolating failures, and running independent steps concurrently. Implement scoring.py with the weights in E.9 and unit tests. Implement GET /api/roadmap/{id}. On the frontend, implement `streamRoadmap`, `useRoadmapStream`, ProgressStepper, RoadmapTabs, ScoreRing, and reload-safe loading by roadmapId.

## Phase 4: Resume improvement
- [ ] `resume_service.py` (review, rewrite), `export.py` (PDF + DOCX), `resume.html` template
- [ ] Prompts `resume_review.md`, `resume_rewrite.md` (no fabrication, placeholders)
- [ ] Frontend `/resume`: review, rewrite, `BeforeAfter`, `ScoreDelta`, placeholders highlighted, downloads

**Checkpoint:** score visibly increases after rewrite; the PDF opens and looks professional; DOCX opens in Word.

## Phase 5: Breadth (opportunities, govt, interview)
- [ ] `opportunities_service`, `govt_service` (hard eligibility filter, `unknown` handling)
- [ ] `interview_service` + prompts; frontend `/interview` and the Opportunities and Govt tabs
- [ ] Tests: eligibility rules (including missing data yields `unknown`), interview state machine

**Checkpoint:** all 8 capabilities reachable from the UI on mock and on real LLM.

## Phase 6: Hardening and deployment
- [ ] Cache tuning, provider fallback tested by forcing failures, per-session simple rate limit
- [ ] `DELETE /api/session` wired to "Start over"
- [ ] Empty, error, and mobile passes on every screen; accessibility pass
- [ ] `scripts/smoke.py` end to end against production URLs
- [ ] Data verification complete (`check-links`, human review of schemes)

## Phase 7: Polish and stretch (only if all above pass)
Voice mock interview (Groq-hosted Whisper for STT, browser speech synthesis for TTS), Hindi label toggle, before/after animations, `/about` polish, pitch slide.

---

# PART H: DEPLOYMENT

## H.1 Backend (Docker)
```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b libffi-dev fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Bake the embedding model and search index into the image
RUN python scripts/build_index.py
ENV PORT=7860
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
```
- **Memory warning:** `sentence-transformers` pulls in PyTorch, which can exceed the 512 MB of typical free tiers. Prefer **Hugging Face Spaces (Docker)** for the backend, which offers much more RAM on free CPU. If you must use Render's free tier, switch to a lighter ONNX-based embedding runtime (e.g. `fastembed`; verify it supports the multilingual model you want) or precompute all dataset embeddings and embed only the query with a small model.
- WeasyPrint needs the system libraries above. If they cause trouble, fall back to ReportLab for PDF.
- Set env vars in the host's secret store. Verify `ALLOWED_ORIGINS` includes the Vercel URL.

## H.2 Frontend
Vercel: connect the repo, set root directory to `frontend`, set `NEXT_PUBLIC_API_URL` to the deployed backend. SSE goes **directly** to the backend (with CORS), not through Next rewrites, to avoid proxy buffering.

## H.3 Cold start
Ping `/health` about 10 minutes before presenting. The frontend shows the waking banner if the first ping is slow.

---

# PART I: TESTING AND DEMO READINESS

## I.1 Automated
- Backend `pytest`: parser, normalizer, gap analysis, scoring, eligibility, fixture-schema validation, and a full-flow API smoke test on `MOCK_LLM=1`.
- Frontend: `tsc --noEmit` and `eslint` must pass. Type errors after `gen:api` are the integration alarm.
- `scripts/smoke.py <API_URL>`: parse persona resume, stream roadmap and assert all six steps arrive, fetch by `roadmap_id`, rewrite resume, export PDF, run a 3-turn interview, delete the session.

## I.2 Manual demo checklist
- [ ] Backend pinged awake 10 minutes before
- [ ] All dataset links clicked and verified; scheme rules checked against official sources
- [ ] Three persona buttons work in one click (no typing on stage)
- [ ] Refresh mid-roadmap still works
- [ ] Tested on a phone and on venue wifi
- [ ] Offline fallback: `MOCK_LLM=1` build completes the full demo path
- [ ] Backup screen recording of the full flow
- [ ] `/about` page and slide mapping features to NEP 2020, Skill India, Digital India, Viksit Bharat 2047

---

# PART J: RISKS AND MITIGATIONS

| Risk | Mitigation |
|---|---|
| Free LLM rate limits or downtime | Provider fallback chain, response cache, mock mode |
| "Just an LLM wrapper" critique | ID-grounded retrieval on curated MP/India data, deterministic gap analysis and scoring, visible rubric |
| Hallucinated courses or schemes | LLM returns IDs only; server validates and hydrates |
| Backend cold start on stage | Health ping, waking banner, pre-warm |
| Frontend and backend drift | Frozen schemas, generated types, fixtures, per-phase checkpoints |
| Bad parsing of a judge's odd PDF | Editable profile step plus paste-text fallback; scanned PDFs get a clear message |
| Dead links or stale scheme info | `verified` and `last_verified` fields, `check_links.py`, manual review |
| Resume PII concerns | No content logging, no raw text storage, `DELETE /api/session`, privacy note in UI |
| Sensitive eligibility fields (age, category) | Optional and opt-in, never inferred, used only for govt matching, deleted with the session |
| Memory limits on free hosting | HF Spaces or lighter embeddings (H.1) |
| Scope creep | All 8 capabilities reachable beats 3 perfect ones; voice, Hindi, and animation are Phase 7 |

---

# PART K: DEFINITION OF DONE

- [ ] All 8 capabilities work from the UI on the deployed URLs
- [ ] The full demo path also works on `MOCK_LLM=1`
- [ ] Every recommendation shown is a real dataset entry with a working link (or no link button)
- [ ] `pytest`, `tsc`, and `eslint` all pass; `smoke.py` passes against production
- [ ] No secrets in git; `.env.example` files present
- [ ] README explains setup in under 10 commands
- [ ] Three demo personas rehearsed end to end, twice
- [ ] Pitch materials tie every feature to the judging lens: *"does this make a student more employable?"*

> Reminder: scheme names, eligibility rules, salary figures, and URLs in this plan are starting points to research, not verified facts. Verify against official sources before the demo.
