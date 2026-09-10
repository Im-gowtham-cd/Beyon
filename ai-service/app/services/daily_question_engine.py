"""
Personalized Daily Question Generator
Generates question sprints tailored specifically to weak skills and highest priority gaps.
"""
from typing import Dict, List, Any
import random

SAMPLE_QUESTION_BANK = {
    "Docker": [
        {
            "id": "q-docker-1",
            "title": "Docker Network Bridge Isolation",
            "subtopic": "Docker Networking",
            "skill": "Docker",
            "difficulty": "MEDIUM",
            "question": "Which command creates a user-defined bridge network in Docker that enables automatic DNS resolution between containers?",
            "options": [
                {"id": "opt-1", "text": "docker network create my-net", "correct": True},
                {"id": "opt-2", "text": "docker network join --default my-net", "correct": False},
                {"id": "opt-3", "text": "docker network link --all", "correct": False},
                {"id": "opt-4", "text": "docker bridge start my-net", "correct": False},
            ],
            "explanation": "User-defined bridge networks in Docker provide automatic DNS resolution between containers using container names as hostnames."
        },
        {
            "id": "q-docker-2",
            "title": "Multi-stage Dockerfile Optimization",
            "subtopic": "Dockerfile Best Practices",
            "skill": "Docker",
            "difficulty": "MEDIUM",
            "question": "What is the primary architectural benefit of multi-stage builds in Docker for compiled languages like Java?",
            "options": [
                {"id": "opt-1", "text": "Allows running containers on multiple CPU architectures simultaneously", "correct": False},
                {"id": "opt-2", "text": "Keeps the final runtime container image minimal by excluding build tools and source code", "correct": True},
                {"id": "opt-3", "text": "Increases disk cache allocation per container layer", "correct": False},
                {"id": "opt-4", "text": "Automatically scales container replica count", "correct": False},
            ],
            "explanation": "Multi-stage builds leave compiler SDKs and build tools in early stages, copying only the compiled artifacts into a lightweight JRE runtime image."
        }
    ],
    "Testing": [
        {
            "id": "q-test-1",
            "title": "JUnit 5 Parameterized Tests",
            "subtopic": "JUnit Mocking & Testing",
            "skill": "Testing",
            "difficulty": "EASY",
            "question": "Which JUnit 5 annotation is required alongside @ParameterizedTest to provide string arguments to a test method?",
            "options": [
                {"id": "opt-1", "text": "@ValueSource", "correct": True},
                {"id": "opt-2", "text": "@ArgSource", "correct": False},
                {"id": "opt-3", "text": "@InputList", "correct": False},
                {"id": "opt-4", "text": "@TestData", "correct": False},
            ],
            "explanation": "@ValueSource(strings = {...}) supplies a simple array of literal values to a @ParameterizedTest in JUnit 5."
        },
        {
            "id": "q-test-2",
            "title": "Mockito Lenient Stubbing",
            "subtopic": "Mocking Frameworks",
            "skill": "Testing",
            "difficulty": "MEDIUM",
            "question": "When does Mockito throw UnnecessaryStubbingException, and how can it be safely avoided?",
            "options": [
                {"id": "opt-1", "text": "When a stubbed method is never invoked during the test execution; avoid with lenient().when(...)", "correct": True},
                {"id": "opt-2", "text": "When a mock is called more than 100 times in a loop", "correct": False},
                {"id": "opt-3", "text": "When verifying private methods", "correct": False},
                {"id": "opt-4", "text": "When using spy instead of mock", "correct": False},
            ],
            "explanation": "Mockito detects unused stubs to prevent dead code in unit tests; lenient().when(...) marks stubs that may not be invoked in all test branches."
        }
    ],
    "Spring Boot": [
        {
            "id": "q-spring-1",
            "title": "Spring Boot Global Exception Handling",
            "subtopic": "REST Error Handling",
            "skill": "Spring Boot",
            "difficulty": "MEDIUM",
            "question": "Which combination of Spring annotations is standard for handling exceptions across all controllers and returning RFC-7807 ProblemDetail?",
            "options": [
                {"id": "opt-1", "text": "@ControllerAdvice (or @RestControllerAdvice) and @ExceptionHandler", "correct": True},
                {"id": "opt-2", "text": "@GlobalFilter and @Catch", "correct": False},
                {"id": "opt-3", "text": "@Service and @Fallback", "correct": False},
                {"id": "opt-4", "text": "@ErrorListener and @Recover", "correct": False},
            ],
            "explanation": "@RestControllerAdvice combined with @ExceptionHandler methods intercepts exceptions globally across all REST controllers."
        }
    ]
}

def generate_personalized_daily_questions(
    skill_gaps: List[Dict[str, Any]],
    question_count: int = 5
) -> List[Dict[str, Any]]:
    """
    Generates questions specifically targeting the student's highest priority skill gaps.
    """
    questions = []
    top_gap_skills = [g["skill_name"] for g in skill_gaps[:3]]

    if not top_gap_skills:
        top_gap_skills = ["Docker", "Testing", "Spring Boot"]

    for skill in top_gap_skills:
        available = SAMPLE_QUESTION_BANK.get(skill, [])
        for q in available:
            if len(questions) < question_count:
                questions.append(q)

    # Fallback to general questions if needed
    if len(questions) < question_count:
        for skill, bank in SAMPLE_QUESTION_BANK.items():
            for q in bank:
                if q not in questions and len(questions) < question_count:
                    questions.append(q)

    return questions
