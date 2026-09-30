from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import request_validation_exception_handler
from starlette.exceptions import HTTPException as StarletteHTTPException
import uuid
import time
from typing import List, Optional
from . import schemas, errors, deps, config, llm
from .services import parser, engine, govt_filter
from .db import Session as SessionModel, ProfileRow, RoadmapRow, ResumeRow, InterviewRow
from .deps import get_db
from sqlmodel import Session, select
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load settings
settings = config.Settings()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    generate_unique_id_function=lambda r: r.name  # Use operation ID as unique ID for clients
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Request-ID"],
)

# Add exception handlers
app.add_exception_handler(errors.AppError, errors.app_error_handler)
app.add_exception_handler(StarletteHTTPException, errors.http_exception_handler)
app.add_exception_handler(Exception, errors.unhandled_exception_handler)

# Middleware to add request ID
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    llm_status = "mock" if settings.MOCK_LLM else "configured"
    return {
        "status": "healthy",
        "llm": llm_status,
        "mock": settings.MOCK_LLM,
        "timestamp": time.time()
    }

# ============================================================================
# PROFILE ENDPOINTS
# ============================================================================

@app.post("/api/profile/parse", response_model=schemas.ProfileParseResponse)
async def parse_profile(
    request: Request,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Parse resume PDF/DOCX or raw text to extract structured profile
    """
    try:
        # Get raw text from either file upload or form text
        raw_text = ""

        if file:
            # Validate file size
            contents = await file.read()
            if len(contents) > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail={
                        "code": "FILE_TOO_LARGE",
                        "message": f"File size exceeds {settings.MAX_UPLOAD_SIZE // (1024*1024)} MB limit",
                        "details": {}
                    }
                )

            # Validate file type
            allowed_extensions = {".pdf", ".docx", ".doc"}
            file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
            if file_ext not in allowed_extensions:
                raise HTTPException(
                    status_code=415,
                    detail={
                        "code": "FILE_UNSUPPORTED",
                        "message": f"Unsupported file type: {file_ext}. Only PDF and DOCX are supported.",
                        "details": {}
                    }
                )

            # Parse the file
            raw_text = parser.parse_resume_file(contents, file_ext)

        elif text:
            raw_text = parser.extract_plain_text(text)
            if len(raw_text.strip()) < 50:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "code": "VALIDATION_ERROR",
                        "message": "Text is too short. Please provide at least 50 characters.",
                        "details": {}
                    }
                )
        else:
            raise HTTPException(
                status_code=422,
                detail={
                    "code": "VALIDATION_ERROR",
                    "message": "Either file or text must be provided",
                    "details": {}
                }
            )

        # Validate we got usable text
        if len(raw_text.strip()) < 200:
            raise HTTPException(
                status_code=422,
                detail={
                    "code": "PARSE_FAILED",
                    "message": "Could not extract usable text from the document. Please try pasting the text directly.",
                    "details": {}
                }
            )

        # Generate profile using LLM
        profile_data = llm.generate(
            prompt_name="profile_extract",
            variables={"text": raw_text},
            schema=schemas.StudentProfile
        )

        # Create session if it doesn't exist
        session_stmt = select(SessionModel).where(SessionModel.id == session_id)
        session_result = db.exec(session_stmt).first()
        if not session_result:
            session_result = SessionModel(id=session_id)
            db.add(session_result)

        # Store profile
        profile_row = ProfileRow(
            session_id=session_id,
            profile_json=profile_data.model_dump_json(),
            raw_text_hash=str(hash(raw_text))  # Simple hash for deduplication
        )
        db.add(profile_row)
        db.commit()
        db.refresh(profile_row)

        return schemas.ProfileParseResponse(
            profile_id=profile_row.id,
            profile=profile_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in parse_profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "code": "INTERNAL",
                "message": "Failed to parse profile",
                "details": {"error": str(e)}
            }
        )

@app.put("/api/profile/{profile_id}", response_model=schemas.StudentProfile)
async def update_profile(
    profile_id: str,
    profile_update: schemas.StudentProfile,
    request: Request,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Update an existing profile (student edits)
    """
    # Verify profile belongs to session
    stmt = select(ProfileRow).where(
        ProfileRow.id == profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    # Normalize skills
    normalized_skills = [engine.normalize_skill(skill) for skill in profile_update.skills if skill.strip()]
    profile_update.skills = [s for s in normalized_skills if s]

    # Update profile
    profile_row.profile_json = profile_update.model_dump_json()
    db.add(profile_row)
    db.commit()
    db.refresh(profile_row)

    return profile_update

# ============================================================================
# CAREER RECOMMENDATION ENDPOINTS
# ============================================================================

@app.post("/api/careers/recommend", response_model=List[schemas.CareerMatch])
async def recommend_careers(
    request: schemas.RoadmapRequest,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Recommend careers based on profile skills
    """
    # Get profile
    stmt = select(ProfileRow).where(
        ProfileRow.id == request.profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    profile = schemas.StudentProfile.model_validate_json(profile_row.profile_json)

    # Generate career recommendations using LLM
    career_matches = llm.generate(
        prompt_name="careers_rerank",
        variables={
            "skills": profile.skills,
            "projects": [p.model_dump() for p in profile.projects],
            "interests": profile.interests,
            "education": [e.model_dump() for e in profile.education]
        },
        schema=List[schemas.CareerMatch]
    )

    # Validate and hydrate from dataset
    roles_data = engine.get_roles_data()
    validated_matches = []

    for match in career_matches:
        if match.role_id in roles_data:
            role_data = roles_data[match.role_id]
            # Hydrate missing fields from dataset
            match.title = role_data["title"]
            match.growth_outlook = role_data["growth_outlook"]
            match.indicative_entry_salary_lpa = role_data["indicative_entry_salary_lpa"]
            validated_matches.append(match)

    # Return top 3
    return validated_matches[:3]

# ============================================================================
# SKILL GAP ENDPOINTS
# ============================================================================

@app.post("/api/skills/gap", response_model=schemas.SkillGapReport)
async def analyze_skill_gap(
    request: schemas.ProfileRoleRequest,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Analyze skill gap between profile and target role
    """
    # Get profile
    stmt = select(ProfileRow).where(
        ProfileRow.id == request.profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    profile = schemas.StudentProfile.model_validate_json(profile_row.profile_json)

    # Perform deterministic skill gap analysis
    matched_skills, missing_skills, readiness_pct = engine.analyze_skill_gap(
        profile.skills,
        request.target_role_id
    )

    # Get role title
    roles_data = engine.get_roles_data()
    role_title = "Unknown Role"
    if request.target_role_id in roles_data:
        role_title = roles_data[request.target_role_id]["title"]

    # Convert missing skills to proper format
    missing_skill_objects = [
        schemas.MissingSkill(
            skill=item["skill"],
            importance=item["importance"],
            reason=item["reason"]
        )
        for item in missing_skills
    ]

    return schemas.SkillGapReport(
        target_role_id=request.target_role_id,
        target_role_title=role_title,
        matched_skills=matched_skills,
        missing_skills=missing_skill_objects,
        readiness_pct=readiness_pct
    )

# ============================================================================
# COURSE RECOMMENDATION ENDPOINTS
# ============================================================================

@app.post("/api/courses/recommend", response_model=List[schemas.CourseRec])
async def recommend_courses(
    request: schemas.ProfileRoleRequest,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Recommend courses based on skill gaps
    """
    # Get profile
    stmt = select(ProfileRow).where(
        ProfileRow.id == request.profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    profile = schemas.StudentProfile.model_validate_json(profile_row.profile_json)

    # Get skill gap to know what skills we need
    gap_report = await analyze_skill_gap(request, session_id, db)

    # Get courses data
    courses_data = engine.get_courses_data()

    # Match courses to missing skills
    matched_courses = engine.match_courses_to_skills(
        [{"skill": ms.skill, "importance": ms.importance} for ms in gap_report.missing_skills],
        courses_data
    )

    # Convert to CourseRec objects and add rationale
    course_recs = []
    for i, course in enumerate(matched_courses[:8]):  # Limit to 8 courses
        course_rec = schemas.CourseRec(
            course_id=course["id"],
            title=course["title"],
            provider=course["provider"],
            url=course.get("url"),
            skills_covered=course.get("skills_covered", []),
            level=course.get("level", "beginner"),
            duration_weeks=course.get("duration_weeks"),
            cost_inr=course.get("cost_inr", 0),
            certificate=course.get("certificate", False),
            order=i + 1,
            rationale=f"Covers missing skills: {', '.join(course.get('matched_skills', []))}"
        )
        course_recs.append(course_rec)

    return course_recs

# ============================================================================
# OPPORTUNITY MATCHING ENDPOINTS
# ============================================================================

@app.post("/api/opportunities/match", response_model=List[schemas.Opportunity])
async def match_opportunities(
    request: schemas.RoadmapRequest,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Match internships/jobs based on profile skills
    """
    # Get profile
    stmt = select(ProfileRow).where(
        ProfileRow.id == request.profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    profile = schemas.StudentProfile.model_validate_json(profile_row.profile_json)

    # Get opportunities data
    opportunities_data = engine.get_internships_data()

    # Normalize profile skills
    normalized_profile_skills = set()
    for skill in profile.skills:
        if skill and skill.strip():
            normalized = engine.normalize_skill(skill.strip())
            if normalized:
                normalized_profile_skills.add(normalized)

    # Match opportunities
    matched_opportunities = []

    for opp in opportunities_data:
        # Normalize opportunity skills
        opp_skills = set()
        for skill in opp.get("skills", []):
            if skill and skill.strip():
                normalized = engine.normalize_skill(skill.strip())
                if normalized:
                    opp_skills.add(normalized)

        # Calculate match
        if opp_skills:
            intersection = normalized_profile_skills & opp_skills
            union = normalized_profile_skills | opp_skills

            if union:
                match_score = round((len(intersection) / len(union)) * 100)
            else:
                match_score = 0

            matched_skills = list(intersection)
            missing_skills = list(opp_skills - normalized_profile_skills)

            # Only include if there's some match
            if match_score > 0:
                opp_copy = opp.copy()
                opp_copy["match_score"] = match_score
                opp_copy["matched_skills"] = matched_skills
                opp_copy["missing_skills"] = missing_skills
                matched_opportunities.append(opp_copy)

    # Sort by match score descending
    matched_opportunities.sort(key=lambda x: x["match_score"], reverse=True)

    # Convert to Opportunity objects
    opportunities = []
    for opp in matched_opportunities[:10]:  # Limit to 10
        opportunity = schemas.Opportunity(
            opportunity_id=opp["id"],
            title=opp["title"],
            organization=opp["organization"],
            type=opp["type"],
            location=opp["location"],
            mode=opp["mode"],
            stipend_or_salary=opp.get("stipend_or_salary"),
            url=opp.get("url"),
            match_score=opp["match_score"],
            matched_skills=opp["matched_skills"],
            missing_skills=opp["missing_skills"]
        )
        opportunities.append(opportunity)

    return opportunities

# ============================================================================
# GOVERNMENT SCHEME MATCHING ENDPOINTS
# ============================================================================

@app.post("/api/govt/match", response_model=List[schemas.GovtScheme])
async def match_government_schemes(
    request: dict,  # Expecting {"profile_id": "..."}
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Match government schemes based on profile eligibility
    """
    profile_id = request.get("profile_id")
    if not profile_id:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "VALIDATION_ERROR",
                "message": "profile_id is required",
                "details": {}
            }
        )

    # Get profile
    stmt = select(ProfileRow).where(
        ProfileRow.id == profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    profile = schemas.StudentProfile.model_validate_json(profile_row.profile_json)

    # Convert profile eligibility to dict for govt_filter
    eligibility_dict = {
        "age": profile.eligibility.age,
        "highest_qualification": profile.eligibility.highest_qualification,
        "domicile_state": profile.eligibility.domicile_state,
        "category": profile.eligibility.category
    }

    # Filter eligible schemes
    eligible_schemes = govt_filter.filter_eligible_schemes(eligibility_dict)

    # Convert to GovtScheme objects
    schemes = []
    for scheme_data in eligible_schemes:
        scheme = schemas.GovtScheme(
            scheme_id=scheme_data["id"],
            name=scheme_data["name"],
            kind=scheme_data["kind"],
            authority=scheme_data["authority"],
            benefits=scheme_data["benefits"],
            url=scheme_data.get("url"),
            eligible=scheme_data["eligible"],
            reasons=scheme_data["reasons"],
            last_verified=scheme_data.get("last_verified")
        )
        schemes.append(scheme)

    return schemes

# ============================================================================
# UNIFIED ROADMAP ENDPOINT
# ============================================================================

@app.post("/api/roadmap/run")
async def run_roadmap(
    request: schemas.RoadmapRequest,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Unified demo endpoint that runs all steps and returns complete roadmap
    """
    # Get profile
    stmt = select(ProfileRow).where(
        ProfileRow.id == request.profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    profile = schemas.StudentProfile.model_validate_json(profile_row.profile_json)

    # Determine target role (use first career match if not specified)
    target_role_id = request.target_role_id
    if not target_role_id:
        # Get career recommendations to determine top role
        career_recs = await recommend_careers(request, session_id, db)
        if career_recs:
            target_role_id = career_recs[0].role_id
        else:
            # Fallback to a default role
            target_role_id = "backend-developer"

    # Run all steps
    try:
        # 1. Career recommendations
        careers = await recommend_careers(request, session_id, db)

        # 2. Skill gap analysis
        gap_request = schemas.ProfileRoleRequest(
            profile_id=request.profile_id,
            target_role_id=target_role_id
        )
        gaps = await analyze_skill_gap(gap_request, session_id, db)

        # 3. Course recommendations
        courses = await recommend_courses(gap_request, session_id, db)

        # 4. Opportunity matching
        opportunities = await match_opportunities(request, session_id, db)

        # 5. Government scheme matching
        govt_request = {"profile_id": request.profile_id}
        govt = await match_government_schemes(govt_request, session_id, db)

        # 6. Employability score (simplified calculation)
        # In a real implementation, this would use the scoring service
        skills_match_pct = gaps.readiness_pct
        project_count = len(profile.projects)
        project_relevance = 0.8  # Placeholder
        education_level = profile.education[0].degree if profile.education else "unknown"
        has_internship = len(profile.experience) > 0
        resume_quality_score = 70  # Placeholder - would come from resume review

        score_data = engine.calculate_employability_score(
            skills_match_pct=skills_match_pct,
            project_count=project_count,
            project_skills_relevance=project_relevance,
            education_level=education_level,
            has_internship=has_internship,
            resume_quality_score=resume_quality_score
        )
        score = schemas.EmployabilityScore.model_validate(score_data)

        # Create and return roadmap
        roadmap = schemas.Roadmap(
            roadmap_id=str(uuid.uuid4()),
            profile_id=request.profile_id,
            target_role_id=target_role_id,
            careers=careers,
            gaps=gaps,
            courses=courses,
            opportunities=opportunities,
            govt=govt,
            score=score
        )

        # Persist roadmap
        roadmap_row = RoadmapRow(
            session_id=session_id,
            profile_id=request.profile_id,
            roadmap_json=roadmap.model_dump_json(),
            status="done"
        )
        db.add(roadmap_row)
        db.commit()

        return roadmap

    except Exception as e:
        logger.error(f"Error in run_roadmap: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "code": "INTERNAL",
                "message": "Failed to generate roadmap",
                "details": {"error": str(e)}
            }
        )

# ============================================================================
# RESUME ENHANCEMENT ENDPOINTS
# ============================================================================

@app.post("/api/resume/enhance")
async def enhance_resume(
    request: schemas.ProfileRoleRequest,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Enhance resume using LLM - returns before/after score, critique, and rewritten bullets
    """
    # Get profile
    stmt = select(ProfileRow).where(
        ProfileRow.id == request.profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    profile = schemas.StudentProfile.model_validate_json(profile_row.profile_json)

    # Get skill gap for context
    gap_request = schemas.ProfileRoleRequest(
        profile_id=request.profile_id,
        target_role_id=request.target_role_id
    )
    gap_report = await analyze_skill_gap(gap_request, session_id, db)

    # Generate resume review (before score)
    review_variables = {
        "profile": profile.model_dump(),
        "target_role": {
            "id": request.target_role_id,
            "title": engine.get_roles_data().get(request.target_role_id, {}).get("title", "Unknown Role")
        },
        "gap_analysis": gap_report.model_dump()
    }

    # This would normally call the resume review service
    # For now, we'll use mock data through the LLM system
    resume_review = llm.generate(
        prompt_name="resume_review",
        variables=review_variables,
        schema=schemas.ResumeReview
    )

    # Generate resume rewrite
    rewrite_variables = {
        "profile": profile.model_dump(),
        "target_role": {
            "id": request.target_role_id,
            "title": engine.get_roles_data().get(request.target_role_id, {}).get("title", "Unknown Role")
        },
        "gap_analysis": gap_report.model_dump(),
        "review_feedback": resume_review.model_dump()
    }

    resume_rewrite = llm.generate(
        prompt_name="resume_rewrite",
        variables=rewrite_variables,
        schema=schemas.ResumeRewrite
    )

    # Persist the rewrite
    resume_row = ResumeRow(
        session_id=session_id,
        profile_id=request.profile_id,
        resume_json=resume_rewrite.model_dump_json(),
        score_before=resume_review.score.total,
        score_after=resume_rewrite.score_after.total
    )
    db.add(resume_row)
    db.commit()

    return {
        "before_score": resume_review.score,
        "after_score": resume_rewrite.score_after,
        "critique": {
            "strengths": resume_review.strengths,
            "issues": resume_review.issues
        },
        "rewritten_sections": resume_rewrite.sections,
        "changes_summary": resume_rewrite.changes_summary,
        "placeholders": resume_rewrite.placeholders
    }

# ============================================================================
# INTERVIEW ENDPOINTS
# ============================================================================

@app.post("/api/interview/chat")
async def interview_chat(
    request: dict,  # Expecting {"target_role": "...", "history": [...], "user_reply": "..."}
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Multi-turn mock interview chat
    """
    target_role = request.get("target_role", "")
    history = request.get("history", [])
    user_reply = request.get("user_reply", "")

    if not target_role:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "VALIDATION_ERROR",
                "message": "target_role is required",
                "details": {}
            }
        )

    # Generate interview response using LLM
    interview_variables = {
        "target_role": target_role,
        "history": history,
        "user_reply": user_reply
    }

    try:
        answer_feedback = llm.generate(
            prompt_name="interview_evaluate",
            variables=interview_variables,
            schema=schemas.AnswerFeedback
        )

        return answer_feedback
    except Exception as e:
        logger.error(f"Error in interview_chat: {str(e)}")
        # Fallback response
        return schemas.AnswerFeedback(
            relevance=5,
            structure=5,
            depth=5,
            feedback="Thank you for your answer. Let's move to the next question.",
            improvement="Try to provide more specific examples from your experience.",
            next_question=schemas.InterviewQuestion(
                text="Can you tell me about a challenging project you worked on?",
                kind="behavioral",
                index=len(history) + 2,
                total=5
            )
        )

# ============================================================================
# SESSION MANAGEMENT
# ============================================================================

@app.delete("/api/session")
async def clear_session(
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Clear all data for a session (start over)
    """
    # Delete all session-associated data
    # Profile rows
    profile_stmt = select(ProfileRow).where(ProfileRow.session_id == session_id)
    profile_rows = db.exec(profile_stmt).all()
    for row in profile_rows:
        db.delete(row)

    # Roadmap rows
    roadmap_stmt = select(RoadmapRow).where(RoadmapRow.session_id == session_id)
    roadmap_rows = db.exec(roadmap_stmt).all()
    for row in roadmap_rows:
        db.delete(row)

    # Resume rows
    resume_stmt = select(ResumeRow).where(ResumeRow.session_id == session_id)
    resume_rows = db.exec(resume_stmt).all()
    for row in resume_rows:
        db.delete(row)

    # Interview rows
    interview_stmt = select(InterviewRow).where(InterviewRow.session_id == session_id)
    interview_rows = db.exec(interview_stmt).all()
    for row in interview_rows:
        db.delete(row)

    # LLM cache entries (optional - could keep for performance)
    # cache_stmt = select(LLMCache).where(LLMCache.session_id == session_id)
    # cache_rows = db.exec(cache_stmt).all()
    # for row in cache_rows:
    #     db.delete(row)

    # Session itself
    session_stmt = select(SessionModel).where(SessionModel.id == session_id)
    session_row = db.exec(session_stmt).first()
    if session_row:
        db.delete(session_row)

    db.commit()

    return {"status": "session cleared"}

# ============================================================================
# ADDITIONAL ENDPOINTS (Added for frontend compatibility)
# ============================================================================

@app.get("/api/profile/{profile_id}", response_model=schemas.StudentProfile)
async def get_profile(
    profile_id: str,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Get an existing profile by ID
    """
    stmt = select(ProfileRow).where(
        ProfileRow.id == profile_id,
        ProfileRow.session_id == session_id
    )
    profile_row = db.exec(stmt).first()

    if not profile_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Profile not found or access denied",
                "details": {}
            }
        )

    return schemas.StudentProfile.model_validate_json(profile_row.profile_json)


@app.get("/api/roadmap/{roadmap_id}")
async def get_roadmap(
    roadmap_id: str,
    session_id: str = Depends(deps.get_session_id),
    db: Session = Depends(get_db)
):
    """
    Get a stored roadmap by ID
    """
    stmt = select(RoadmapRow).where(
        RoadmapRow.id == roadmap_id,
        RoadmapRow.session_id == session_id
    )
    roadmap_row = db.exec(stmt).first()

    if not roadmap_row:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "NOT_FOUND",
                "message": "Roadmap not found",
                "details": {}
            }
        )

    import json
    return json.loads(roadmap_row.roadmap_json)


@app.get("/api/personas")
async def list_personas():
    """
    Return available demo personas (for frontend onboarding)
    """
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
