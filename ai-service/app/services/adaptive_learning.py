"""
Adaptive Learning Loop
Updates student mastery and confidence dynamically per question attempt.
"""
from typing import Dict, Any

def process_question_attempt(
    student_id: str,
    skill_name: str,
    subtopic: str,
    is_correct: bool,
    time_spent_seconds: int,
    current_proficiency: float,
    current_confidence: float
) -> Dict[str, Any]:
    """
    Adaptive scoring:
    - Correct: increases proficiency and boosts confidence
    - Incorrect: identifies learning gap, slightly adjusts proficiency, marks for spaced recall
    """
    if is_correct:
        proficiency_delta = +3.5 if current_proficiency < 70 else +2.0
        confidence_delta = +0.05
        next_action = "CONTINUE_PATH"
        recommendation = f"Great mastery on {subtopic}! Ready to advance."
    else:
        proficiency_delta = -1.5
        confidence_delta = -0.02
        next_action = "SCHEDULE_SPACED_RECALL"
        recommendation = f"Review {subtopic} concepts. A revision card has been scheduled in your recall queue."

    new_proficiency = max(0.0, min(100.0, round(current_proficiency + proficiency_delta, 1)))
    new_confidence = max(0.10, min(0.99, round(current_confidence + confidence_delta, 2)))

    return {
        "student_id": student_id,
        "skill": skill_name,
        "subtopic": subtopic,
        "is_correct": is_correct,
        "old_proficiency": current_proficiency,
        "new_proficiency": new_proficiency,
        "old_confidence": current_confidence,
        "new_confidence": new_confidence,
        "next_action": next_action,
        "recommendation": recommendation
    }
