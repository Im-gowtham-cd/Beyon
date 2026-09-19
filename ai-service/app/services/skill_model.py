"""
Holistic Student Skill Model & Evidence Hierarchy
Evaluates multi-source evidence to determine true skill proficiency and confidence.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import math

EVIDENCE_WEIGHTS = {
    "VERIFIED_ASSESSMENT": 1.00,
    "VERIFIED_CERTIFICATION": 0.85,
    "PROJECT_EVIDENCE": 0.70,
    "PRACTICAL_CHALLENGE": 0.60,
    "COURSE_COMPLETION": 0.50,
    "SELF_REPORTED": 0.25,
}

def calculate_mastery_status(proficiency: float) -> str:
    if proficiency >= 85:
        return "EXPERT"
    elif proficiency >= 70:
        return "ADVANCED"
    elif proficiency >= 45:
        return "INTERMEDIATE"
    else:
        return "BEGINNER"

def evaluate_skill_state(
    skill_name: str,
    evidence_list: List[Dict[str, Any]],
    self_reported_score: Optional[float] = None,
    last_practiced_days_ago: int = 0
) -> Dict[str, Any]:
    """
    Computes weighted skill proficiency, confidence, and trend from multi-source evidence.
    """
    if not evidence_list and self_reported_score is None:
        return {
            "skill": skill_name,
            "proficiency": 0.0,
            "confidence": 0.0,
            "evidence_count": 0,
            "sources": [],
            "trend": "STABLE",
            "mastery_status": "BEGINNER"
        }

    weighted_score_sum = 0.0
    weight_sum = 0.0
    sources_used = []

    for ev in evidence_list:
        ev_type = ev.get("type", "PRACTICAL_CHALLENGE")
        score = float(ev.get("score", 50.0))
        weight = EVIDENCE_WEIGHTS.get(ev_type, 0.50)

        weighted_score_sum += score * weight
        weight_sum += weight
        sources_used.append(ev_type)

    if self_reported_score is not None:
        self_weight = EVIDENCE_WEIGHTS["SELF_REPORTED"]
        weighted_score_sum += float(self_reported_score) * self_weight
        weight_sum += self_weight
        sources_used.append("SELF_REPORTED")

    raw_proficiency = (weighted_score_sum / weight_sum) if weight_sum > 0 else 0.0

    # Apply slight memory decay for skills unpracticed for > 30 days
    decay_factor = 1.0
    if last_practiced_days_ago > 30:
        decay_days = min(last_practiced_days_ago - 30, 90)
        decay_factor = max(0.85, 1.0 - (decay_days * 0.0015))

    final_proficiency = round(raw_proficiency * decay_factor, 1)

    # Confidence calculation: based on total evidence weight and variety
    evidence_count = len(evidence_list)
    confidence = min(0.98, round(0.20 + (weight_sum * 0.15) + (min(evidence_count, 10) * 0.05), 2))

    trend = "STABLE"
    if len(evidence_list) >= 2:
        latest_score = float(evidence_list[-1].get("score", 50))
        prev_score = float(evidence_list[-2].get("score", 50))
        if latest_score > prev_score + 3:
            trend = "IMPROVING"
        elif latest_score < prev_score - 3:
            trend = "DECLINING"

    return {
        "skill": skill_name,
        "proficiency": final_proficiency,
        "confidence": confidence,
        "evidence_count": evidence_count,
        "sources": list(set(sources_used)),
        "trend": trend,
        "mastery_status": calculate_mastery_status(final_proficiency)
    }
