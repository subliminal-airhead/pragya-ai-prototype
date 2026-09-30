import json
import os
import hashlib
from typing import TypeVar, Type, Dict, Any, Optional
from pydantic import BaseModel
from groq import Groq
import google.generativeai as genai
from .config import settings
from .deps import get_db
from .db import LLMCache
from sqlmodel import Session, select
from datetime import datetime, timezone
import time

T = TypeVar('T', bound=BaseModel)

class LLMUnavailable(Exception):
    """Raised when all LLM providers fail"""
    pass

class LLMCacheDB:
    """Simple SQLite cache for LLM responses"""

    def __init__(self, db_session: Session):
        self.db_session = db_session

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        statement = select(LLMCache).where(LLMCache.key == key)
        result = self.db_session.exec(statement).first()
        if result:
            # Check if cache is older than 1 hour (optional)
            return json.loads(result.response_json)
        return None

    def set(self, key: str, value: Dict[str, Any]):
        # Check if already exists
        statement = select(LLMCache).where(LLMCache.key == key)
        existing = self.db_session.exec(statement).first()

        if existing:
            existing.response_json = json.dumps(value)
            existing.created_at = datetime.now(timezone.utc)
        else:
            cache_entry = LLMCache(
                key=key,
                response_json=json.dumps(value)
            )
            self.db_session.add(cache_entry)

        self.db_session.commit()

def get_cache_key(provider: str, model: str, prompt: str, schema: str) -> str:
    """Generate a cache key for LLM requests"""
    content = f"{provider}:{model}:{prompt}:{schema}"
    return hashlib.sha256(content.encode()).hexdigest()

def load_fixture(schema_name: str) -> Dict[str, Any]:
    """Load fixture data for mock mode"""
    fixture_dir = os.path.join(os.path.dirname(__file__), "..", "fixtures")
    fixture_path = os.path.join(fixture_dir, f"{schema_name}.json")

    try:
        with open(fixture_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return a basic structure based on schema name
        return get_default_fixture(schema_name)

def get_default_fixture(schema_name: str) -> Dict[str, Any]:
    """Return default fixture data when specific fixture not found"""
    fixtures = {
        "StudentProfile": {
            "name": "Demo Student",
            "email": "student@example.com",
            "phone": "+91 9876543210",
            "location": "India",
            "summary": "A motivated student seeking career opportunities",
            "education": [
                {
                    "degree": "Bachelor of Technology",
                    "field": "Computer Science",
                    "institution": "Sample University",
                    "year": 2024,
                    "score": "8.5 CGPA"
                }
            ],
            "skills": ["python", "java", "javascript", "sql"],
            "projects": [
                {
                    "title": "Sample Project",
                    "description": "A sample project for demonstration",
                    "skills": ["python", "javascript"]
                }
            ],
            "experience": [],
            "certifications": [],
            "interests": ["technology", "innovation"],
            "languages": ["english", "hindi"],
            "eligibility": {
                "age": 21,
                "highest_qualification": "Bachelor's",
                "domicile_state": "Madhya Pradesh",
                "category": "general"
            }
        },
        "CareerMatch": [
            {
                "role_id": "backend-developer",
                "title": "Backend Developer",
                "match_score": 85,
                "reasons": ["Strong foundation in programming languages", "Good problem-solving skills"],
                "growth_outlook": "Strong demand for backend developers in enterprise applications",
                "indicative_entry_salary_lpa": "4.5-6.0"
            }
        ],
        "SkillGapReport": {
            "target_role_id": "backend-developer",
            "target_role_title": "Backend Developer",
            "matched_skills": ["python", "java", "sql"],
            "missing_skills": [
                {
                    "skill": "spring boot",
                    "importance": "critical",
                    "reason": "Spring Boot is essential for backend development in Java ecosystem"
                },
                {
                    "skill": "rest api design",
                    "importance": "important",
                    "reason": "REST API design skills are important for building scalable backend services"
                }
            ],
            "readiness_pct": 65
        },
        "CourseRec": [
            {
                "course_id": "spring-boot-course",
                "title": "Spring Boot Framework",
                "provider": "NPTEL",
                "url": "https://example.com/spring-boot",
                "skills_covered": ["spring boot", "java", "microservices"],
                "level": "beginner",
                "duration_weeks": 8,
                "cost_inr": 0,
                "certificate": True,
                "order": 1,
                "rationale": "Addresses critical missing skill in Spring Boot framework"
            }
        ],
        "Opportunity": [
            {
                "opportunity_id": "internship-001",
                "title": "Software Development Internship",
                "organization": "Tech Solutions Inc",
                "type": "internship",
                "location": "Bangalore",
                "mode": "hybrid",
                "stipend_or_salary": "₹15,000/month",
                "url": "https://example.com/internship-001",
                "match_score": 78,
                "matched_skills": ["python", "java"],
                "missing_skills": ["spring boot"]
            }
        ],
        "GovtScheme": [
            {
                "scheme_id": "mmsky",
                "name": "Mukhyamantri Seekho Kamao Yojana",
                "kind": "scheme",
                "authority": "Madhya Pradesh Government",
                "benefits": "₹8,000-₹10,000 monthly stipend for skill training",
                "url": "https://example.com/mmsky",
                "eligible": "yes",
                "reasons": ["MP domicile", "Age 18-29", "Seeking skill development"],
                "last_verified": "2024-01-15"
            }
        ],
        "EmployabilityScore": {
            "total": 75,
            "components": [
                {
                    "name": "skills",
                    "score": 80,
                    "weight": 0.4,
                    "note": "Good skills match"
                },
                {
                    "name": "projects",
                    "score": 70,
                    "weight": 0.25,
                    "note": "2 projects with relevant skills"
                },
                {
                    "name": "experience",
                    "score": 60,
                    "weight": 0.15,
                    "note": "Some internship experience"
                },
                {
                    "name": "resume_quality",
                    "score": 80,
                    "weight": 0.15,
                    "note": "Well formatted resume"
                },
                {
                    "name": "certifications",
                    "score": 70,
                    "weight": 0.1,
                    "note": "Relevant certifications"
                }
            ]
        },
        "ResumeReview": {
            "score": {
                "total": 65,
                "components": [
                    {
                        "name": "skills",
                        "score": 70,
                        "weight": 0.4,
                        "note": "Good technical skills"
                    },
                    {
                        "name": "projects",
                        "score": 60,
                        "weight": 0.25,
                        "note": "Projects need more detail"
                    },
                    {
                        "name": "experience",
                        "score": 50,
                        "weight": 0.15,
                        "note": "Limited work experience"
                    },
                    {
                        "name": "resume_quality",
                        "score": 70,
                        "weight": 0.15,
                        "note": "Standard formatting"
                    },
                    {
                        "name": "certifications",
                        "score": 60,
                        "weight": 0.1,
                        "note": "Some certifications"
                    }
                ]
            },
            "strengths": ["Good technical foundation", "Clear communication"],
            "issues": [
                {
                    "severity": "medium",
                    "section": "experience",
                    "message": "Limited professional experience documented",
                    "suggestion": "Add details about academic projects and any volunteer work"
                }
            ]
        },
        "ResumeSection": [
            {
                "title": "Summary",
                "items": ["Motivated computer science graduate seeking backend development role"]
            },
            {
                "title": "Skills",
                "items": ["Python", "Java", "JavaScript", "SQL", "Data Structures"]
            },
            {
                "title": "Projects",
                "items": [
                    "Full-stack web application using React and Node.js",
                    "Data analysis project using Python and Pandas"
                ]
            }
        ],
        "ResumeRewrite": {
            "resume_id": "rewrite-001",
            "sections": [
                {
                    "title": "Summary",
                    "items": ["Motivated computer science graduate with strong foundation in backend development seeking to contribute to innovative software solutions"]
                },
                {
                    "title": "Skills",
                    "items": ["Python (Advanced)", "Java (Intermediate)", "JavaScript", "SQL", "REST API Design", "Data Structures", "Algorithms"]
                },
                {
                    "title": "Projects",
                    "items": [
                        "Developed a full-stack e-commerce application using React frontend and Node.js/Express backend, integrated with MongoDB database - Accomplished [30% improvement in user engagement], as measured by [user analytics], by doing [full-cycle development from UI to database]",
                        "Created a data analysis pipeline processing CSV files using Python Pandas, generating insights for business decision-making - Accomplished [processed 10K+ records], as measured by [accuracy and performance], by doing [data cleaning, transformation, and visualization]"
                    ]
                }
            ],
            "changes_summary": [
                "Enhanced technical skill descriptions with proficiency levels",
                "Rewrote project descriptions using XYZ formula with measurable outcomes",
                "Added relevant keywords for backend developer roles"
            ],
            "score_after": {
                "total": 80,
                "components": [
                    {
                        "name": "skills",
                        "score": 85,
                        "weight": 0.4,
                        "note": "Enhanced skill presentation"
                    },
                    {
                        "name": "projects",
                        "score": 80,
                        "weight": 0.25,
                        "note": "Project descriptions improved with metrics"
                    },
                    {
                        "name": "experience",
                        "score": 65,
                        "weight": 0.15,
                        "note": "Better presentation of academic experience"
                    },
                    {
                        "name": "resume_quality",
                        "score": 85,
                        "weight": 0.15,
                        "note": "Improved formatting and keyword optimization"
                    },
                    {
                        "name": "certifications",
                        "score": 70,
                        "weight": 0.1,
                        "note": "Same certifications"
                    }
                ]
            },
            "placeholders": [
                "[30% improvement in user engagement]",
                "[user analytics]",
                "[full-cycle development from UI to database]",
                "[processed 10K+ records]",
                "[accuracy and performance]"
            ]
        },
        "InterviewQuestion": {
            "text": "Can you explain the difference between REST and GraphQL?",
            "kind": "technical",
            "index": 1,
            "total": 5
        },
        "InterviewStartResponse": {
            "interview_id": "interview-001",
            "question": {
                "text": "Tell me about yourself and your background.",
                "kind": "behavioral",
                "index": 1,
                "total": 5
            }
        },
        "AnswerFeedback": {
            "relevance": 8,
            "structure": 7,
            "depth": 6,
            "feedback": "Good answer covering your background and motivation",
            "improvement": "Could provide more specific examples of your technical projects",
            "next_question": {
                "text": "What programming languages are you most comfortable with?",
                "kind": "technical",
                "index": 2,
                "total": 5
            }
        },
        "InterviewSummary": {
            "overall": 75,
            "strengths": ["Good communication skills", "Solid technical foundation"],
            "weaknesses": ["Could improve on behavioral examples", "Need more depth in system design"],
            "next_steps": ["Practice STAR method for behavioral questions", "Study system design fundamentals"]
        }
    }

    return fixtures.get(schema_name, {"message": f"Fixture for {schema_name} not implemented"})


def generate(prompt_name: str, variables: Dict[str, Any], schema: Type[T]) -> T:
    """
    Generate LLM response with mock fallback and provider fallback chain.

    Args:
        prompt_name: Name of the prompt file (without extension)
        variables: Variables to substitute in the prompt template
        schema: Pydantic model class for response validation

    Returns:
        Validated response of type T

    Raises:
        LLMUnavailable: If all providers fail
    """
    # Check if we should use mock mode
    if settings.MOCK_LLM:
        return _get_mock_response(schema.__name__, schema)

    # Try to get cached response
    with next(get_db()) as db_session:
        cache = LLMCacheDB(db_session)
        prompt_text = _render_prompt(prompt_name, variables)
        schema_json = schema.model_json_schema()
        cache_key = get_cache_key(
            getattr(settings, "LLM_PROVIDER", "groq") or "groq",
            getattr(settings, "LLM_MODEL", "openai/gpt-oss-120b") or "openai/gpt-oss-120b",
            prompt_text,
            schema_json
        )

        cached = cache.get(cache_key)
        if cached:
            return schema.model_validate(cached)

    # Try providers in order: Groq -> Gemini -> Ollama -> Mock fallback
    providers = [
        ("groq", _call_groq),
        ("gemini", _call_gemini),
        # Ollama would go here if configured
    ]

    last_error = None
    for provider_name, provider_func in providers:
        try:
            response_json = provider_func(prompt_name, variables, schema)
            validated_response = schema.model_validate_json(response_json)

            # Cache the successful response
            with next(get_db()) as db_session:
                cache = LLMCacheDB(db_session)
                cache.set(cache_key, validated_response.model_dump())

            return validated_response
        except Exception as e:
            last_error = e
            continue

    # If all providers fail, fall back to mock
    if settings.MOCK_LLM or os.getenv("FORCE_MOCK_FALLBACK", "false").lower() == "true":
        return _get_mock_response(schema.__name__, schema)

    raise LLMUnavailable(f"All LLM providers failed. Last error: {last_error}")

def _get_mock_response(schema_name: str, schema: Type[T]) -> T:
    """Get mock response from fixtures"""
    fixture_data = load_fixture(schema_name)
    return schema.model_validate(fixture_data)

def _render_prompt(prompt_name: str, variables: Dict[str, Any]) -> str:
    """Render prompt template with variables"""
    prompt_dir = os.path.join(os.path.dirname(__file__), "prompts")
    prompt_path = os.path.join(prompt_dir, f"{prompt_name}.md")

    try:
        with open(prompt_path, 'r') as f:
            template = f.read()
    except FileNotFoundError:
        # Fallback: create a simple prompt from variables
        template = str(variables.get("text", "")) if "text" in variables else json.dumps(variables)

    # Simple variable substitution
    rendered = template
    for key, value in variables.items():
        placeholder = f"{{{{{key}}}}}"
        if isinstance(value, str):
            rendered = rendered.replace(placeholder, value)
        elif isinstance(value, list):
            rendered = rendered.replace(placeholder, ", ".join(str(item) for item in value))
        elif isinstance(value, dict):
            rendered = rendered.replace(placeholder, json.dumps(value))
        else:
            rendered = rendered.replace(placeholder, str(value))

    return rendered

def _call_groq(prompt_name: str, variables: Dict[str, Any], schema: Type[T]) -> str:
    """Call Groq API"""
    if not settings.GROQ_API_KEY:
        raise Exception("GROQ_API_KEY not configured")

    client = Groq(api_key=settings.GROQ_API_KEY)
    prompt_text = _render_prompt(prompt_name, variables)
    schema_json = schema.model_json_schema()

    # Add system prompt to ensure JSON output
    messages = [
        {
            "role": "system",
            "content": f"Return ONLY valid JSON matching this schema: {json.dumps(schema_json)}"
        },
        {
            "role": "user",
            "content": prompt_text
        }
    ]

    response = client.chat.completions.create(
        model=getattr(settings, "LLM_MODEL", "openai/gpt-oss-120b") or "openai/gpt-oss-120b",
        messages=messages,
        temperature=0.1,
        max_tokens=1000,
        response_format={"type": "json_object"}
    )

    response_text = response.choices[0].message.content or ""
    response_text = response_text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    elif response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]

    return response_text.strip()

def _call_gemini(prompt_name: str, variables: Dict[str, Any], schema: Type[T]) -> str:
    """Call Google Gemini API"""
    if not settings.GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not configured")

    genai.configure(api_key=settings.GEMINI_API_KEY)
    prompt_text = _render_prompt(prompt_name, variables)
    schema_json = schema.model_json_schema()

    # Add system instruction for JSON output
    full_prompt = f"""
Return ONLY valid JSON matching this schema: {json.dumps(schema_json)}

{prompt_text}
"""

    gemini_model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
    model = genai.GenerativeModel(gemini_model)
    response = model.generate_content(
        full_prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.1,
            max_output_tokens=1000,
        )
    )

    res_text = response.text or ""
    res_text = res_text.strip()
    if res_text.startswith("```json"):
        res_text = res_text[7:]
    elif res_text.startswith("```"):
        res_text = res_text[3:]
    if res_text.endswith("```"):
        res_text = res_text[:-3]

    return res_text.strip()

# Alias for backward compatibility
def generate_structured_response(prompt_name: str, variables: Dict[str, Any], schema: Type[T]) -> T:
    return generate(prompt_name, variables, schema)

