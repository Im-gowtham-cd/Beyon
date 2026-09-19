"""
Mathematical Skill Gap & Priority Ranking Engine
Computes Gap = Required - Current and ranks gaps using multi-dimensional weighting.
"""
from typing import Dict, List, Any, Optional
import math

def calculate_skill_gaps(
    student_skills: Dict[str, Dict[str, Any]],
    target_role: str,
    role_requirements: List[Dict[str, Any]],
    student_interests: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Computes priority-ranked skill gaps for a student and target role.
    Formula: Priority = Gap * Career_Relevance * Industry_Demand * Opportunity_Relevance
                       * Prerequisite_Importance * Student_Interest * (1.1 - Confidence * 0.3)
    """
    interests_set = set(i.lower() for i in (student_interests or []))
    gaps = []

    for req in role_requirements:
        skill_name = req["skill_name"]
        required_level = float(req.get("required_level", 75.0))
        career_relevance = float(req.get("career_relevance", 1.0))
        industry_demand = float(req.get("industry_demand", 1.0))
        prerequisite_importance = float(req.get("prerequisite_importance", 1.0))
        opportunity_relevance = float(req.get("opportunity_relevance", 1.0))

        student_skill = student_skills.get(skill_name.lower()) or student_skills.get(skill_name)
        if student_skill:
            current_level = float(student_skill.get("proficiency", 0.0))
            confidence = float(student_skill.get("confidence", 0.5))
        else:
            current_level = 0.0
            confidence = 0.0

        gap = max(0.0, required_level - current_level)

        if gap > 0:
            student_interest_boost = 1.25 if skill_name.lower() in interests_set else 1.0
            confidence_factor = 1.1 - (confidence * 0.3)

            priority_score = (
                gap
                * career_relevance
                * industry_demand
                * opportunity_relevance
                * prerequisite_importance
                * student_interest_boost
                * confidence_factor
            )

            severity = "CRITICAL" if gap >= 25 else ("NEEDS_IMPROVEMENT" if gap >= 10 else "MINOR")

            gaps.append({
                "skill_name": skill_name,
                "target_role": target_role,
                "current_level": current_level,
                "required_level": required_level,
                "gap": round(gap, 1),
                "severity": severity,
                "priority_score": round(priority_score, 2),
                "career_relevance": career_relevance,
                "industry_demand": industry_demand,
                "confidence": confidence,
                "estimated_hours_to_close": int(math.ceil(gap * 1.5))
            })

    # Sort gaps strictly by priority score descending
    gaps.sort(key=lambda g: g["priority_score"], reverse=True)
    return gaps
