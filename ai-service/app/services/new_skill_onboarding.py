"""
New Skill Onboarding & Prerequisite Resolver
Handles student declaring interest or start in a new skill (e.g., Kubernetes).
"""
from typing import Dict, List, Any

PREREQUISITE_GRAPH = {
    "Kubernetes": ["Docker", "Linux Basics", "Networking"],
    "Docker": ["Linux Basics"],
    "Spring Boot": ["Java", "SQL"],
    "Microservices": ["Spring Boot", "Docker", "REST APIs"],
    "System Design": ["Databases", "Distributed Systems", "Caching"]
}

def onboard_new_skill(
    skill_name: str,
    current_skills: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Onboards a newly declared skill, evaluates prerequisite readiness, and generates diagnostic baseline.
    """
    prereqs = PREREQUISITE_GRAPH.get(skill_name, [])
    missing_prereqs = []

    for p in prereqs:
        p_skill = current_skills.get(p.lower()) or current_skills.get(p)
        if not p_skill or p_skill.get("proficiency", 0) < 50:
            missing_prereqs.append({
                "prerequisite_skill": p,
                "current_level": p_skill.get("proficiency", 0) if p_skill else 0,
                "required_level": 50
            })

    roadmap = []
    if missing_prereqs:
        status = "PREREQUISITES_NEEDED"
        for mp in missing_prereqs:
            roadmap.append(f"Step 1: Solidify {mp['prerequisite_skill']} (currently {mp['current_level']}%)")
        roadmap.append(f"Step 2: Start {skill_name} Fundamentals")
        roadmap.append(f"Step 3: Hands-on Architecture & Projects in {skill_name}")
    else:
        status = "READY_FOR_DIAGNOSTIC"
        roadmap.append(f"Step 1: Take 5-Question Baseline Diagnostic for {skill_name}")
        roadmap.append(f"Step 2: Curated Daily Sprints for {skill_name}")
        roadmap.append(f"Step 3: Build Verification Project in {skill_name}")

    return {
        "skill_name": skill_name,
        "status": status,
        "prerequisites_required": prereqs,
        "missing_prerequisites": missing_prereqs,
        "recommended_learning_path": roadmap,
        "baseline_test_available": True
    }
