from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from uuid import UUID

# ---------- Profile ----------
class Education(BaseModel):
    degree: str
    field: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[int] = None
    score: Optional[str] = None  # "8.1 CGPA" / "72%"

class Project(BaseModel):
    title: str
    description: str = ""
    skills: List[str] = []

class Experience(BaseModel):
    role: str
    organization: Optional[str] = None
    duration: Optional[str] = None
    description: str = ""

class Eligibility(BaseModel):  # OPTIONAL, opt-in, used only for govt matching
    age: Optional[int] = None
    highest_qualification: Optional[str] = None
    domicile_state: Optional[str] = None
    category: Optional[str] = None  # sensitive: user-provided, optional, never inferred

class StudentProfile(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: str = ""
    education: List[Education] = []
    skills: List[str] = []
    projects: List[Project] = []
    experience: List[Experience] = []
    certifications: List[str] = []
    interests: List[str] = []
    languages: List[str] = []
    eligibility: Eligibility = Eligibility()

class ProfileParseResponse(BaseModel):
    profile_id: str
    profile: StudentProfile

# ---------- Recommendations ----------
class CareerMatch(BaseModel):
    role_id: str
    title: str
    match_score: int = Field(ge=0, le=100)
    reasons: List[str]
    growth_outlook: str = ""
    indicative_entry_salary_lpa: Optional[str] = None  # from dataset, labelled "indicative"

class MissingSkill(BaseModel):
    skill: str
    importance: Literal["critical", "important", "nice_to_have"]
    reason: str = ""

class SkillGapReport(BaseModel):
    target_role_id: str
    target_role_title: str
    matched_skills: List[str]
    missing_skills: List[MissingSkill]
    readiness_pct: int = Field(ge=0, le=100)

class CourseRec(BaseModel):
    course_id: str
    title: str
    provider: str
    url: Optional[str] = None
    skills_covered: List[str]
    level: Literal["beginner", "intermediate", "advanced"]
    duration_weeks: Optional[int] = None
    cost_inr: int = 0
    certificate: bool = False
    order: int  # position in the learning path
    rationale: str

class Opportunity(BaseModel):
    opportunity_id: str
    title: str
    organization: str
    type: Literal["internship", "job", "apprenticeship"]
    location: str
    mode: Literal["remote", "onsite", "hybrid"]
    stipend_or_salary: Optional[str] = None
    url: Optional[str] = None
    match_score: int = Field(ge=0, le=100)
    matched_skills: List[str]
    missing_skills: List[str]

class GovtScheme(BaseModel):
    scheme_id: str
    name: str
    kind: Literal["scheme", "exam", "apprenticeship", "training", "portal"]
    authority: str
    benefits: str
    url: Optional[str] = None
    eligible: Literal["yes", "no", "unknown"]
    reasons: List[str]  # why eligible / what is missing
    last_verified: Optional[str] = None

# ---------- Score ----------
class ScoreComponent(BaseModel):
    name: Literal["skills", "projects", "experience", "resume_quality", "certifications"]
    score: int = Field(ge=0, le=100)
    weight: float
    note: str = ""

class EmployabilityScore(BaseModel):
    total: int = Field(ge=0, le=100)
    components: List[ScoreComponent]

# ---------- Resume ----------
class ResumeIssue(BaseModel):
    severity: Literal["high", "medium", "low"]
    section: str
    message: str
    suggestion: str

class ResumeReview(BaseModel):
    score: EmployabilityScore
    strengths: List[str]
    issues: List[ResumeIssue]

class ResumeSection(BaseModel):
    title: str
    items: List[str]  # bullets or lines

class ResumeRewrite(BaseModel):
    resume_id: str
    sections: List[ResumeSection]
    changes_summary: List[str]
    score_after: EmployabilityScore
    placeholders: List[str] = []  # things the student must fill in

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
    next_question: Optional[InterviewQuestion] = None

class InterviewSummary(BaseModel):
    overall: int = Field(ge=0, le=100)
    strengths: List[str]
    weaknesses: List[str]
    next_steps: List[str]

# ---------- Roadmap ----------
class Roadmap(BaseModel):
    roadmap_id: str
    profile_id: str
    target_role_id: Optional[str] = None
    careers: List[CareerMatch]
    gaps: Optional[SkillGapReport] = None
    courses: List[CourseRec]
    opportunities: List[Opportunity]
    govt: List[GovtScheme]
    score: Optional[EmployabilityScore] = None

class StepEvent(BaseModel):
    step: Literal["careers", "gaps", "courses", "opportunities", "govt", "score"]
    status: Literal["started", "done", "failed"]
    progress: float
    data: Optional[Dict[str, Any]] = None

# ---------- Requests ----------
class ParseTextRequest(BaseModel):
    text: str = Field(min_length=50)

class RoadmapRequest(BaseModel):
    profile_id: str
    interests: List[str] = []
    target_role_id: Optional[str] = None

class ProfileRoleRequest(BaseModel):
    profile_id: str
    target_role_id: str

class ErrorBody(BaseModel):
    code: str
    message: str
    details: Dict[str, Any] = {}

class ErrorEnvelope(BaseModel):
    error: ErrorBody
