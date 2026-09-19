"""
Targeted Course Recommender
STRICT PRINCIPLE: NEVER recommend 'all available courses' or generic popular courses.
Only recommends curated courses that specifically close the student's calculated skill gaps.
"""
from typing import Dict, List, Any, Optional

# Curated catalog mapping skills to high-yield courses
CURATED_COURSE_CATALOG = [
    {
        "id": "crs-docker-java",
        "title": "Docker & Containers for Java Developers",
        "provider": "Beyon Academy",
        "skill_covered": "Docker",
        "target_gap_reduction": 25,
        "duration_hours": 12,
        "difficulty": "INTERMEDIATE",
        "prerequisites": ["Java"],
        "url": "/learning/course/docker-for-java"
    },
    {
        "id": "crs-junit-testing",
        "title": "Backend Testing & Test-Driven Development with JUnit 5 & Mockito",
        "provider": "Beyon Academy",
        "skill_covered": "Testing",
        "target_gap_reduction": 25,
        "duration_hours": 10,
        "difficulty": "BEGINNER",
        "prerequisites": ["Java"],
        "url": "/learning/course/backend-testing-junit"
    },
    {
        "id": "crs-spring-production",
        "title": "Building Production-Ready REST APIs with Spring Boot 3",
        "provider": "Beyon Academy",
        "skill_covered": "Spring Boot",
        "target_gap_reduction": 20,
        "duration_hours": 16,
        "difficulty": "INTERMEDIATE",
        "prerequisites": ["Java", "SQL"],
        "url": "/learning/course/spring-boot-production-apis"
    },
    {
        "id": "crs-k8s-arch",
        "title": "Kubernetes Architecture, Pods & Services for Microservices",
        "provider": "Beyon Academy",
        "skill_covered": "Kubernetes",
        "target_gap_reduction": 30,
        "duration_hours": 18,
        "difficulty": "ADVANCED",
        "prerequisites": ["Docker"],
        "url": "/learning/course/kubernetes-architecture"
    },
    {
        "id": "crs-sql-perf",
        "title": "Relational Database Indexing, Query Optimization & Dolt Versioning",
        "provider": "Beyon Academy",
        "skill_covered": "SQL",
        "target_gap_reduction": 20,
        "duration_hours": 14,
        "difficulty": "INTERMEDIATE",
        "prerequisites": [],
        "url": "/learning/course/sql-indexing-optimization"
    },
    {
        "id": "crs-aws-cloud",
        "title": "AWS Cloud Foundations for Backend Engineers (S3, SQS, ECS)",
        "provider": "Beyon Academy",
        "skill_covered": "AWS",
        "target_gap_reduction": 25,
        "duration_hours": 15,
        "difficulty": "INTERMEDIATE",
        "prerequisites": ["Docker", "Linux Basics"],
        "url": "/learning/course/aws-cloud-foundations"
    }
]

def recommend_courses_for_gaps(
    skill_gaps: List[Dict[str, Any]],
    student_skills: Dict[str, Dict[str, Any]],
    completed_course_ids: Optional[List[str]] = None,
    max_recommendations: int = 5
) -> List[Dict[str, Any]]:
    """
    Selects top courses strictly aligned with the student's highest-priority gaps.
    Enforces prerequisite validation.
    """
    completed_ids = set(completed_course_ids or [])
    top_gaps = skill_gaps[:3]  # Focus strictly on top 3 critical gaps
    gap_skills = {g["skill_name"].lower(): g for g in top_gaps}

    recommendations = []

    for course in CURATED_COURSE_CATALOG:
        if course["id"] in completed_ids:
            continue

        skill_covered = course["skill_covered"].lower()
        if skill_covered not in gap_skills:
            # Drop course if it does NOT directly close a top priority gap!
            continue

        matching_gap = gap_skills[skill_covered]

        # Check prerequisites
        prereqs_met = True
        missing_prereq = None
        for prereq in course["prerequisites"]:
            prereq_skill = student_skills.get(prereq.lower())
            if not prereq_skill or prereq_skill.get("proficiency", 0) < 40:
                prereqs_met = False
                missing_prereq = prereq
                break

        if not prereqs_met:
            # Do not recommend advanced courses before prerequisites are satisfied
            continue

        reason = (
            f"Closes your {matching_gap['gap']} point gap in {course['skill_covered']} "
            f"for your target role of {matching_gap['target_role']}."
        )

        recommendations.append({
            "course": course,
            "targeted_skill": course["skill_covered"],
            "current_proficiency": matching_gap["current_level"],
            "required_proficiency": matching_gap["required_level"],
            "point_gap": matching_gap["gap"],
            "reason": reason,
            "urgency": matching_gap["severity"],
            "priority_score": matching_gap["priority_score"]
        })

    # Sort recommendations by matching gap priority
    recommendations.sort(key=lambda r: r["priority_score"], reverse=True)
    return recommendations[:max_recommendations]
