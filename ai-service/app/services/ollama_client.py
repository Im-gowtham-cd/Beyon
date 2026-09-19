"""
Ollama Client for Qwen 3.5 (4B)
Integrates local Ollama LLM to perform deep skill gap diagnostics,
recommendations for target professions, and interactive career advisory.
"""
import os
import json
import logging
import re
from typing import Dict, List, Any, Optional
import httpx

logger = logging.getLogger(__name__)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3.5:4b")
DEFAULT_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "240.0"))

def clean_and_repair_json(raw: str) -> Dict[str, Any]:
    """Extract, sanitize, and repair JSON block from LLM output."""
    raw = raw.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
    if match:
        text = match.group(1).strip()
    else:
        match = re.search(r"(\{.*)", raw, re.DOTALL)
        text = match.group(1).strip() if match else raw

    # 1. Attempt direct JSON parsing
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2. Attempt progressive repair of truncated JSON
    try:
        # Strip trailing incomplete key or property
        repaired = re.sub(r',\s*"[^"]*"?\s*:\s*[^,}\]]*$', '', text)
        repaired = re.sub(r',\s*"[^"]*"?\s*$', '', repaired)
        repaired = re.sub(r',\s*$', '', repaired)

        # Balance open brackets and braces
        open_brackets = repaired.count('[') - repaired.count(']')
        open_braces = repaired.count('{') - repaired.count('}')
        repaired += (']' * max(0, open_brackets)) + ('}' * max(0, open_braces))

        return json.loads(repaired)
    except Exception as e:
        logger.warning(f"Could not parse or repair JSON: {e}. Raw text: {raw[:200]}")
        return {}

def generate_fallback_analysis(
    target_profession: str,
    current_skills: Dict[str, Any],
    gaps: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Deterministic fallback analysis when Ollama is unreachable or loading."""
    top_gaps = gaps[:4] if gaps else []
    gap_names = [g.get("skill_name", "") for g in top_gaps]

    exec_summary = (
        f"Diagnostic evaluation for {target_profession}: You currently hold foundational competence, "
        f"but key competencies in {', '.join(gap_names[:3]) if gap_names else 'specialized engineering areas'} "
        f"must be reinforced to meet enterprise hiring benchmarks."
    )

    recommended = []
    for g in top_gaps:
        s_name = g.get("skill_name", "Technical Skill")
        cur = g.get("current_level", 0)
        req = g.get("required_level", 75)
        point_gap = round(float(req) - float(cur), 1)
        recommended.append({
            "skill_name": s_name,
            "target_gap_reduction": point_gap,
            "importance": f"Essential core competency for {target_profession}",
            "key_topics": [f"{s_name} Fundamentals", f"{s_name} Enterprise Patterns", "Best Practices & Optimization"],
            "suggested_project": f"Build an end-to-end portfolio project demonstrating production-grade {s_name}.",
            "estimated_hours": int(point_gap * 1.5) if point_gap > 0 else 20,
            "priority": g.get("severity", "NEEDS_IMPROVEMENT")
        })

    roadmap = [
        {
            "phase": "Phase 1: Critical Foundations",
            "title": "Bridge Essential Core Gaps",
            "description": f"Focus immediately on {', '.join(gap_names[:2]) if gap_names else 'primary skills'} through targeted code practice.",
            "duration": "Weeks 1-3"
        },
        {
            "phase": "Phase 2: Architectural Integration",
            "title": "Full-Stack & System Design Competency",
            "description": f"Integrate {gap_names[2] if len(gap_names) > 2 else 'advanced frameworks'} with hands-on services and database schemas.",
            "duration": "Weeks 4-6"
        },
        {
            "phase": "Phase 3: Production & Interview Readiness",
            "title": "Deployment, Optimization & Mock Benchmarks",
            "description": f"Simulate real-world hiring rounds for {target_profession} and complete proctored assessments.",
            "duration": "Weeks 7-8"
        }
    ]

    return {
        "model_used": f"{OLLAMA_MODEL} (Local Engine Fallback)",
        "target_profession": target_profession,
        "executive_summary": exec_summary,
        "overall_readiness_pct": max(20, min(95, 100 - (len(top_gaps) * 15))),
        "critical_gap_analysis": [
            {
                "skill_name": g.get("skill_name", ""),
                "current_level": g.get("current_level", 0),
                "required_level": g.get("required_level", 75),
                "gap": g.get("gap", 0),
                "impact": f"Lack of verified {g.get('skill_name')} proficiency lowers resume ATS match and reduces technical shortlist probability."
            }
            for g in top_gaps
        ],
        "recommended_skills": recommended,
        "milestone_roadmap": roadmap,
        "interview_readiness_advice": f"Review data structures, system architecture, and real-time troubleshooting scenarios typical in {target_profession} rounds.",
        "reasoning_steps": "Evaluated quantitative skill baseline against institutional career path competencies and enterprise hiring rubrics."
    }

async def analyze_skill_gaps_for_profession(
    student_id: str,
    target_profession: str,
    current_skills: Dict[str, Any],
    gaps: List[Dict[str, Any]],
    student_interests: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Executes deep AI Skill Gap Analysis and generates a profession achievement plan
    using the local Ollama qwen3.5:4b model.
    """
    cleaned_skills_summary = []
    for k, v in current_skills.items():
        if isinstance(v, dict):
            prof = v.get("proficiency") or v.get("level") or v.get("current_score") or "Intermediate"
            cleaned_skills_summary.append(f"{k} ({prof})")
        else:
            cleaned_skills_summary.append(f"{k} ({v})")

    gaps_summary = []
    for g in gaps[:5]:
        gaps_summary.append(
            f"{g.get('skill_name')}: Current {g.get('current_level')}, Required {g.get('required_level')} (Gap: {g.get('gap')}, {g.get('severity')})"
        )

    system_prompt = (
        "You are an expert AI Career Architect on the Beyon platform. "
        "Analyze candidate verified skills against the target profession, identify critical gaps, "
        "and formulate a concrete roadmap with skill recommendations. "
        "Respond ONLY with valid JSON conforming to the requested schema. Keep descriptions concise."
    )

    user_prompt = f"""Target Profession: {target_profession}
Current Skills: {', '.join(cleaned_skills_summary) if cleaned_skills_summary else 'Entry Level'}
Skill Gaps:
{chr(10).join(gaps_summary) if gaps_summary else 'No critical gaps'}

Output JSON only with keys:
"executive_summary": string,
"overall_readiness_pct": number (0-100),
"critical_gap_analysis": list of {{"skill_name", "impact"}},
"recommended_skills": list of {{"skill_name", "target_gap_reduction", "importance", "key_topics", "suggested_project", "estimated_hours", "priority"}},
"milestone_roadmap": list of 3 items {{"phase", "title", "description", "duration"}},
"interview_readiness_advice": string"""

    # Pre-fill thinking boundary to bypass long internal monologue while preserving Qwen 3.5 speed
    assistant_prefill = (
        f"<think>\n"
        f"Synthesizing verified skills against {target_profession} enterprise hiring rubrics. "
        f"Prioritizing critical gap closures and constructing a 3-phase strategic roadmap.\n"
        f"</think>\n"
    )

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
            {"role": "assistant", "content": assistant_prefill}
        ],
        "stream": False,
        "options": {
            "num_ctx": 2048,
            "num_predict": 650,
            "temperature": 0.2
        }
    }

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                msg = data.get("message", {})
                content = msg.get("content", "").strip()
                thinking = msg.get("thinking", "").strip()

                parsed = clean_and_repair_json(content)

                if parsed:
                    # Provide fallback defaults for any incomplete or omitted fields
                    fallback = generate_fallback_analysis(target_profession, current_skills, gaps)

                    if not parsed.get("executive_summary"):
                        parsed["executive_summary"] = fallback["executive_summary"]
                    if not parsed.get("overall_readiness_pct"):
                        parsed["overall_readiness_pct"] = fallback["overall_readiness_pct"]
                    if not parsed.get("critical_gap_analysis"):
                        parsed["critical_gap_analysis"] = fallback["critical_gap_analysis"]
                    if not parsed.get("recommended_skills"):
                        parsed["recommended_skills"] = fallback["recommended_skills"]
                    if not parsed.get("milestone_roadmap") or len(parsed.get("milestone_roadmap", [])) < 2:
                        parsed["milestone_roadmap"] = fallback["milestone_roadmap"]
                    if not parsed.get("interview_readiness_advice"):
                        parsed["interview_readiness_advice"] = fallback["interview_readiness_advice"]

                    parsed["model_used"] = OLLAMA_MODEL
                    parsed["target_profession"] = target_profession
                    parsed["reasoning_steps"] = (
                        thinking if thinking else
                        f"Qwen 3.5 multi-dimensional evaluation: Mapped baseline profile against enterprise {target_profession} standards and formulated prioritized roadmap."
                    )
                    return parsed

            logger.warning(f"Ollama returned HTTP {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.warning(f"Ollama inference error for {target_profession}: {e}. Activating deterministic fallback.")

    return generate_fallback_analysis(target_profession, current_skills, gaps)


async def chat_with_career_advisor(
    student_skills: Dict[str, Any],
    target_profession: str,
    chat_history: List[Dict[str, str]],
    question: str
) -> Dict[str, Any]:
    """
    Conversational AI Career Advisor powered by qwen3.5:4b.
    """
    system_prompt = (
        f"You are the Beyon AI Career Advisor powered by Qwen 3.5. "
        f"You are counseling a student aiming to become a {target_profession}. "
        f"Their known skills are: {', '.join(student_skills.keys()) if student_skills else 'Beginner / Undisclosed'}. "
        f"Provide direct, encouraging, highly technical, and actionable career guidance. "
        f"Keep answers structured, concise (under 250 words), and focused on practical skill acquisition."
    )

    assistant_prefill = (
        f"<think>\n"
        f"Formulating concise technical advice for {target_profession} candidate.\n"
        f"</think>\n"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for h in chat_history[-4:]:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    messages.append({"role": "user", "content": question})
    messages.append({"role": "assistant", "content": assistant_prefill})

    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "num_ctx": 2048,
            "num_predict": 350,
            "temperature": 0.3
        }
    }

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                msg = data.get("message", {})
                content = msg.get("content", "").strip()
                thinking = msg.get("thinking", "").strip()

                if content:
                    return {
                        "model_used": OLLAMA_MODEL,
                        "response": content,
                        "reasoning_steps": thinking if thinking else f"Evaluated technical pathway and project suggestions for {target_profession}."
                    }
    except Exception as e:
        logger.warning(f"Ollama advisor chat error: {e}")

    return {
        "model_used": f"{OLLAMA_MODEL} (Fallback)",
        "response": f"To accelerate your journey toward becoming a {target_profession}, focus on mastering core competencies, building 2 end-to-end portfolio projects, and solving daily challenges to reinforce algorithmic consistency.",
        "reasoning_steps": "Local advisory heuristic applied."
    }


async def synthesize_targeted_questions_with_qwen(
    mode: str,
    target_role: str,
    skills: List[str],
    lagged_concepts: List[str],
    skill_level: str,
    count: int = 3
) -> List[Dict[str, Any]]:
    """
    Synthesizes custom scenario questions using Ollama qwen3.5:4b targeting
    learned skills & company roles (for Daily Sprint) or in-progress learning & lagged concepts (for Revise & Recall).
    """
    skills_str = ", ".join(skills[:4]) if skills else "Full-Stack Development"
    concepts_str = ", ".join(lagged_concepts[:4]) if lagged_concepts else "Core Architecture"
    level_str = skill_level if skill_level else "INTERMEDIATE"

    if mode == "DAILY_SPRINT":
        prompt_instruction = (
            f"Generate {count} multiple-choice questions for candidate who already learned: {skills_str}. "
            f"Align questions with enterprise requirements for company role: {target_role}. "
            f"Target tricky edge cases and lagged concepts: {concepts_str}. "
            f"Difficulty must match: {level_str}."
        )
    else:
        prompt_instruction = (
            f"Generate {count} active recall questions for candidate currently learning: {skills_str}. "
            f"Directly target concepts where the candidate made errors: {concepts_str}. "
            f"Reinforce core invariants and mental models. Difficulty must match: {level_str}."
        )

    system_prompt = (
        "You are an expert technical interviewer and question author. "
        "Return ONLY a valid JSON object with a single key 'questions' containing an array of questions. "
        "Each question must have: 'title', 'description', 'skill_name', 'concept', 'difficulty', and 'options' "
        "(array of 4 objects with 'id' like 'A','B','C','D', 'optionText', 'isCorrect' boolean with exactly one true, and 'explanation')."
    )

    assistant_prefill = (
        f"<think>\n"
        f"Synthesizing {count} {level_str} questions for {skills_str} focusing on {concepts_str}.\n"
        f"</think>\n"
    )

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_instruction},
            {"role": "assistant", "content": assistant_prefill}
        ],
        "stream": False,
        "options": {
            "num_ctx": 2048,
            "num_predict": 750,
            "temperature": 0.2
        }
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                msg = data.get("message", {})
                content = msg.get("content", "").strip()
                parsed = clean_and_repair_json(content)
                if isinstance(parsed, dict) and "questions" in parsed and isinstance(parsed["questions"], list):
                    return parsed["questions"]
                elif isinstance(parsed, list):
                    return parsed
    except Exception as e:
        logger.warning(f"Ollama question synthesis note: {e}. Utilizing concept bank enrichment.")

    return []


