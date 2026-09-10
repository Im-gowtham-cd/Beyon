from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.services.skill_model import evaluate_skill_state
from app.services.gap_engine import calculate_skill_gaps
from app.services.course_recommender import recommend_courses_for_gaps
from app.services.daily_question_engine import generate_personalized_daily_questions
from app.services.adaptive_learning import process_question_attempt
from app.services.new_skill_onboarding import onboard_new_skill

router = APIRouter(prefix="/api/v1/intelligence", tags=["Intelligence"])

class SkillGapRequest(BaseModel):
    student_id: str
    target_role: str
    student_skills: Dict[str, Dict[str, Any]]
    role_requirements: List[Dict[str, Any]]
    student_interests: Optional[List[str]] = None

class PersonalizedRecommendationRequest(BaseModel):
    student_id: str
    target_role: str
    student_skills: Dict[str, Dict[str, Any]]
    role_requirements: List[Dict[str, Any]]
    completed_course_ids: Optional[List[str]] = None
    max_recommendations: int = 5

class DailyQuestionsRequest(BaseModel):
    student_id: str
    target_role: str
    student_skills: Dict[str, Dict[str, Any]]
    role_requirements: List[Dict[str, Any]]
    question_count: int = 5

class AttemptSubmissionRequest(BaseModel):
    student_id: str
    skill_name: str
    subtopic: str
    is_correct: bool
    time_spent_seconds: int
    current_proficiency: float
    current_confidence: float

class NewSkillRequest(BaseModel):
    student_id: str
    skill_name: str
    current_skills: Dict[str, Dict[str, Any]]

@router.post("/skill-gap/analyze")
async def analyze_skill_gaps(req: SkillGapRequest):
    gaps = calculate_skill_gaps(
        req.student_skills,
        req.target_role,
        req.role_requirements,
        req.student_interests
    )
    return {
        "student_id": req.student_id,
        "target_role": req.target_role,
        "total_gaps": len(gaps),
        "gaps": gaps
    }

@router.post("/recommendations/personalized")
async def get_personalized_recommendations(req: PersonalizedRecommendationRequest):
    gaps = calculate_skill_gaps(
        req.student_skills,
        req.target_role,
        req.role_requirements
    )
    # Strictly recommend ONLY courses that close the calculated gaps
    recs = recommend_courses_for_gaps(
        gaps,
        req.student_skills,
        req.completed_course_ids,
        req.max_recommendations
    )
    return {
        "student_id": req.student_id,
        "target_role": req.target_role,
        "top_gaps": gaps[:3],
        "recommendations": recs,
        "rule_applied": "STRICT_PERSONALIZATION (generic/popular courses omitted)"
    }

@router.post("/daily-questions/personalized")
async def get_personalized_daily_questions(req: DailyQuestionsRequest):
    gaps = calculate_skill_gaps(
        req.student_skills,
        req.target_role,
        req.role_requirements
    )
    questions = generate_personalized_daily_questions(gaps, req.question_count)
    return {
        "student_id": req.student_id,
        "target_role": req.target_role,
        "targeted_gaps": [g["skill_name"] for g in gaps[:3]],
        "daily_questions": questions
    }

@router.post("/adaptive/submit-attempt")
async def submit_question_attempt(req: AttemptSubmissionRequest):
    result = process_question_attempt(
        req.student_id,
        req.skill_name,
        req.subtopic,
        req.is_correct,
        req.time_spent_seconds,
        req.current_proficiency,
        req.current_confidence
    )
    return result

@router.post("/skills/onboard-new-skill")
async def onboard_skill(req: NewSkillRequest):
    result = onboard_new_skill(req.skill_name, req.current_skills)
    return result
