import pytest
from app.services.skill_model import evaluate_skill_state, calculate_mastery_status
from app.services.gap_engine import calculate_skill_gaps
from app.services.course_recommender import recommend_courses_for_gaps
from app.services.daily_question_engine import generate_personalized_daily_questions
from app.services.adaptive_learning import process_question_attempt
from app.services.new_skill_onboarding import onboard_new_skill

def test_evidence_hierarchy_weighting():
    """
    Verifies that verified assessments and certifications outweigh self-declaration.
    """
    # Student A: Self declared 90
    student_a = evaluate_skill_state("Java", [], self_reported_score=90)
    # Student B: Scored 80 on a verified assessment
    student_b = evaluate_skill_state("Java", [{"type": "VERIFIED_ASSESSMENT", "score": 80}])

    assert student_b["confidence"] > student_a["confidence"]
    assert student_b["mastery_status"] in ["ADVANCED", "EXPERT"]

def test_skill_gap_calculation_and_priority():
    """
    Verifies the gap engine ranks Docker and Testing as top priority gaps for Backend Engineer.
    """
    student_skills = {
        "java": {"proficiency": 82.0, "confidence": 0.90},
        "sql": {"proficiency": 76.0, "confidence": 0.85},
        "spring boot": {"proficiency": 61.0, "confidence": 0.75},
        "docker": {"proficiency": 42.0, "confidence": 0.50},
        "testing": {"proficiency": 38.0, "confidence": 0.40}
    }

    role_requirements = [
        {"skill_name": "Java", "required_level": 85.0, "career_relevance": 1.2, "industry_demand": 1.1},
        {"skill_name": "Spring Boot", "required_level": 80.0, "career_relevance": 1.3, "industry_demand": 1.2},
        {"skill_name": "Docker", "required_level": 70.0, "career_relevance": 1.3, "industry_demand": 1.3},
        {"skill_name": "Testing", "required_level": 65.0, "career_relevance": 1.2, "industry_demand": 1.1},
        {"skill_name": "SQL", "required_level": 75.0, "career_relevance": 1.0, "industry_demand": 1.0}
    ]

    gaps = calculate_skill_gaps(student_skills, "Backend Software Engineer", role_requirements)

    assert len(gaps) == 4  # SQL gap is 0 (76 >= 75)
    gap_skill_names = [g["skill_name"] for g in gaps]

    # Highest gaps should be Docker (70 - 42 = 28) and Testing (65 - 38 = 27)
    assert gap_skill_names[0] in ["Docker", "Testing"]
    assert gap_skill_names[1] in ["Docker", "Testing"]
    assert "SQL" not in gap_skill_names

def test_strictly_targeted_course_recommendations():
    """
    Verifies that ONLY gap-closing courses are recommended, and generic popular courses are EXCLUDED.
    """
    student_skills = {
        "java": {"proficiency": 82.0, "confidence": 0.90},
        "docker": {"proficiency": 42.0, "confidence": 0.50},
        "testing": {"proficiency": 38.0, "confidence": 0.40},
        "spring boot": {"proficiency": 61.0, "confidence": 0.75}
    }

    gaps = [
        {"skill_name": "Docker", "target_role": "Backend Engineer", "current_level": 42.0, "required_level": 70.0, "gap": 28.0, "severity": "CRITICAL", "priority_score": 45.0},
        {"skill_name": "Testing", "target_role": "Backend Engineer", "current_level": 38.0, "required_level": 65.0, "gap": 27.0, "severity": "CRITICAL", "priority_score": 41.0},
        {"skill_name": "Spring Boot", "target_role": "Backend Engineer", "current_level": 61.0, "required_level": 80.0, "gap": 19.0, "severity": "NEEDS_IMPROVEMENT", "priority_score": 30.0}
    ]

    recs = recommend_courses_for_gaps(gaps, student_skills)

    rec_titles = [r["course"]["title"] for r in recs]
    skills_targeted = [r["targeted_skill"] for r in recs]

    # Must contain Docker, Testing, or Spring Boot
    assert any("Docker" in title for title in rec_titles)
    assert any("Testing" in title or "JUnit" in title for title in rec_titles)

    # Must NOT recommend unrelated skills like Python, React, Machine Learning
    for title in rec_titles:
        assert "Python" not in title
        assert "React" not in title
        assert "Machine Learning" not in title

def test_personalized_daily_questions():
    """
    Verifies that daily questions target the student's weak skills rather than random topics.
    """
    gaps = [
        {"skill_name": "Docker", "gap": 28.0},
        {"skill_name": "Testing", "gap": 27.0},
        {"skill_name": "Spring Boot", "gap": 19.0}
    ]

    questions = generate_personalized_daily_questions(gaps, question_count=5)
    assert len(questions) == 5

    skills_in_quiz = set(q["skill"] for q in questions)
    assert "Docker" in skills_in_quiz or "Testing" in skills_in_quiz

def test_adaptive_learning_loop():
    """
    Verifies that answering questions correctly boosts proficiency, while incorrect answers
    schedule spaced recall.
    """
    correct_attempt = process_question_attempt(
        student_id="S1001",
        skill_name="Docker",
        subtopic="Docker Networking",
        is_correct=True,
        time_spent_seconds=35,
        current_proficiency=42.0,
        current_confidence=0.50
    )
    assert correct_attempt["new_proficiency"] > 42.0
    assert correct_attempt["new_confidence"] > 0.50
    assert correct_attempt["next_action"] == "CONTINUE_PATH"

    wrong_attempt = process_question_attempt(
        student_id="S1001",
        skill_name="Docker",
        subtopic="Docker Networking",
        is_correct=False,
        time_spent_seconds=60,
        current_proficiency=42.0,
        current_confidence=0.50
    )
    assert wrong_attempt["new_proficiency"] < 42.0
    assert wrong_attempt["next_action"] == "SCHEDULE_SPACED_RECALL"

def test_new_skill_onboarding_prerequisites():
    """
    Verifies that declaring a new skill like Kubernetes enforces prerequisites (Docker, Linux).
    """
    current_skills_without_docker = {"java": {"proficiency": 80}}
    res1 = onboard_new_skill("Kubernetes", current_skills_without_docker)
    assert res1["status"] == "PREREQUISITES_NEEDED"
    assert any(mp["prerequisite_skill"] == "Docker" for mp in res1["missing_prerequisites"])

    current_skills_with_docker = {"docker": {"proficiency": 75}, "linux basics": {"proficiency": 60}, "networking": {"proficiency": 65}}
    res2 = onboard_new_skill("Kubernetes", current_skills_with_docker)
    assert res2["status"] == "READY_FOR_DIAGNOSTIC"

def test_aws_event_worker_processing():
    """
    Verifies that the AWS Event Worker correctly processes EventBridge AssessmentCompleted events.
    """
    from app.services.aws_event_worker import AwsEventWorker
    worker = AwsEventWorker()

    event = {
        "detail-type": "AssessmentCompleted",
        "detail": {
            "studentId": "stu-1001",
            "score": 85,
            "accuracy": 0.88,
            "questionsAttempted": 10
        }
    }

    result = worker.process_event_payload(event)
    assert result["action"] == "SKILL_RECALCULATION"
    assert result["student_id"] == "stu-1001"
    assert "85%" in result["message"]
