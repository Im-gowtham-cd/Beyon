package com.beyon.practice.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.practice.model.DailyChallenge;
import com.beyon.practice.model.Question;
import com.beyon.practice.repository.DailyChallengeRepository;
import com.beyon.practice.repository.QuestionOptionRepository;
import com.beyon.practice.repository.QuestionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
public class DailyChallengeService {

    private final DailyChallengeRepository challengeRepository;
    private final QuestionRepository questionRepository;
    private final CoinService coinService;
    private final StreakService streakService;
    private final SkillXpService skillXpService;
    private final AchievementBadgeService badgeService;
    private final PracticeService practiceService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private final QuestionOptionRepository optionRepository;
    private final com.beyon.modules.telemetry.service.TelemetryService telemetryService;
    private final com.beyon.intelligence.client.AiIntelligenceClient aiClient;

    public DailyChallengeService(DailyChallengeRepository challengeRepository,
                                  QuestionRepository questionRepository,
                                  QuestionOptionRepository optionRepository,
                                  CoinService coinService,
                                  StreakService streakService,
                                  SkillXpService skillXpService,
                                  AchievementBadgeService badgeService,
                                  PracticeService practiceService,
                                  org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
                                  @org.springframework.beans.factory.annotation.Autowired(required = false) com.beyon.modules.telemetry.service.TelemetryService telemetryService,
                                  @org.springframework.beans.factory.annotation.Autowired(required = false) com.beyon.intelligence.client.AiIntelligenceClient aiClient) {
        this.challengeRepository = challengeRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.coinService = coinService;
        this.streakService = streakService;
        this.skillXpService = skillXpService;
        this.badgeService = badgeService;
        this.practiceService = practiceService;
        this.jdbcTemplate = jdbcTemplate;
        this.telemetryService = telemetryService;
        this.aiClient = aiClient;
    }

    private final Map<UUID, Map<String, Object>> syntheticQuestionRegistry = new java.util.concurrent.ConcurrentHashMap<>();
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    private void registerOptionsInRegistry(List<Map<String, Object>> questions) {
        for (Map<String, Object> q : questions) {
            Object idObj = q.get("id");
            if (idObj == null) continue;
            UUID validUuid;
            try {
                validUuid = UUID.fromString(idObj.toString());
            } catch (Exception e) {
                continue;
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> options = (List<Map<String, Object>>) q.get("options");
            if (options != null && !options.isEmpty()) {
                UUID correctOptId = null;
                String correctOptText = "";
                String explanationText = (String) q.getOrDefault("explanation", "");

                for (Map<String, Object> opt : options) {
                    boolean isCorr = Boolean.TRUE.equals(opt.get("isCorrect")) || Boolean.TRUE.equals(opt.get("correct"));
                    if (isCorr) {
                        Object oId = opt.get("id");
                        if (oId != null) {
                            try {
                                correctOptId = UUID.fromString(oId.toString());
                            } catch (Exception ignored) {}
                        }
                        correctOptText = (String) opt.getOrDefault("optionText", opt.getOrDefault("text", ""));
                        if (opt.get("explanation") != null && !opt.get("explanation").toString().isBlank()) {
                            explanationText = opt.get("explanation").toString();
                        }
                    }
                }

                if (correctOptId != null) {
                    syntheticQuestionRegistry.put(validUuid, Map.of(
                            "correctOptionId", correctOptId,
                            "correctOptionText", correctOptText != null ? correctOptText : "",
                            "explanation", explanationText != null ? explanationText : "Review architectural principles."
                    ));
                }
            }
        }
    }

    private void updateDailySetSubmission(UUID studentId, UUID questionId, UUID selectedOptionId, boolean correct, String explanation, String correctOptionId, String correctOptionText, int xpEarned, int coinsEarned) {
        try {
            LocalDate today = LocalDate.now();
            List<Map<String, Object>> sets = jdbcTemplate.queryForList(
                    "SELECT id, set_type, questions_json, results_json FROM student_daily_challenge_sets WHERE student_id = ? AND session_date = ?",
                    studentId.toString(), java.sql.Date.valueOf(today)
            );
            for (Map<String, Object> s : sets) {
                String qJson = (String) s.get("questions_json");
                if (qJson != null && qJson.contains(questionId.toString())) {
                    String setId = (String) s.get("id");
                    String resJson = (String) s.get("results_json");
                    Map<String, Object> results = new HashMap<>();
                    if (resJson != null && !resJson.isBlank()) {
                        try {
                            results = objectMapper.readValue(resJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                        } catch (Exception ignored) {}
                    }
                    Map<String, Object> item = new HashMap<>();
                    item.put("selectedOptionId", selectedOptionId != null ? selectedOptionId.toString() : "");
                    item.put("correct", correct);
                    item.put("explanation", explanation);
                    item.put("correctOptionId", correctOptionId != null ? correctOptionId : "");
                    item.put("correctOptionText", correctOptionText != null ? correctOptionText : "");
                    item.put("xpEarned", xpEarned);
                    item.put("coinsEarned", coinsEarned);
                    results.put(questionId.toString(), item);

                    String updatedResJson = objectMapper.writeValueAsString(results);
                    jdbcTemplate.update("UPDATE student_daily_challenge_sets SET results_json = ?, updated_at = NOW() WHERE id = ?", updatedResJson, setId);
                    break;
                }
            }
        } catch (Exception ignored) {}
    }

    private String extractConceptName(String skill, String title, String tags) {
        String combined = (skill + " " + title + " " + (tags != null ? tags : "")).toLowerCase();
        if (combined.contains("box") || combined.contains("margin")) return "CSS Box Model & Margin Collapsing";
        if (combined.contains("fiber") || combined.contains("reconcil")) return "React Fiber Architecture";
        if (combined.contains("hook") || combined.contains("useeffect")) return "Hook Invariants & Closures";
        if (combined.contains("generic") || combined.contains("narrowing") || combined.contains("union")) return "TypeScript Generics & Discriminated Unions";
        if (combined.contains("decorator") || combined.contains("middleware")) return "Design Patterns: Decorator & Middleware";
        if (combined.contains("event loop") || combined.contains("microtask")) return "JavaScript Event Loop & Task Queues";
        if (combined.contains("viewport") || combined.contains("responsive")) return "Viewport: Responsive Mobile Meta Tag";
        if (combined.contains("jpa") || combined.contains("dirty checking") || combined.contains("persistence")) return "JPA Entity Lifecycle & Dirty Checking";
        if (combined.contains("validation") || combined.contains("invariant")) return "Data Validation & Invariant Checking";
        if (combined.contains("gil") || combined.contains("threading")) return "Python GIL & Concurrency";
        if (combined.contains("mvcc") || combined.contains("vacuum") || combined.contains("isolation")) return "PostgreSQL MVCC & Isolation";
        if (combined.contains("index") || combined.contains("gin") || combined.contains("b-tree")) return "PostgreSQL B-Tree vs GIN Indexing";
        if (combined.contains("primitive") || combined.contains("syntax")) return "Core Syntax & Primitive Types";
        return null;
    }

    private Map<String, Object> resolveStudentProfileContext(UUID studentId) {
        List<String> weakSkills = new ArrayList<>();
        List<String> learnedSkills = new ArrayList<>();
        String targetRole = "Full-Stack Software Engineer (Cloud Architecture)";
        List<String> activeWeakConcepts = new ArrayList<>();
        Set<String> clearedConcepts = new HashSet<>();
        List<Map<String, Object>> failedAttempts = new ArrayList<>();
        String skillLevel = "INTERMEDIATE";

        // 1. Weak skills / Skill Gaps (score < 60 or verified = 0), sorted by score ASC
        try {
            List<String> lowScoreSkills = jdbcTemplate.queryForList(
                    "SELECT DISTINCT skill_name FROM student_skills WHERE user_id = ? AND (score < 60.0 OR verified = 0) ORDER BY score ASC",
                    String.class, studentId.toString()
            );
            weakSkills.addAll(lowScoreSkills);

            List<String> inProgress = jdbcTemplate.queryForList(
                    "SELECT DISTINCT s.name FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id WHERE slt.student_id = ? AND slt.status = 'IN_PROGRESS'",
                    String.class, studentId.toString()
            );
            for (String ip : inProgress) {
                if (!weakSkills.contains(ip)) weakSkills.add(ip);
            }

            List<String> wished = jdbcTemplate.queryForList(
                    "SELECT DISTINCT skill_name FROM student_learning_skills WHERE user_id = ?",
                    String.class, studentId.toString()
            );
            for (String w : wished) {
                if (!weakSkills.contains(w)) weakSkills.add(w);
            }
        } catch (Exception ignored) {}

        if (weakSkills.isEmpty()) {
            weakSkills = new ArrayList<>(List.of("TypeScript", "Python", "CSS", "Spring Boot", "React", "PostgreSQL"));
        }

        // 2. Learned / Mastered skills (score >= 60 or verified = 1), sorted by score DESC
        try {
            List<String> highScores = jdbcTemplate.queryForList(
                    "SELECT DISTINCT skill_name FROM student_skills WHERE user_id = ? AND (score >= 60.0 OR verified = 1) ORDER BY score DESC",
                    String.class, studentId.toString()
            );
            learnedSkills.addAll(highScores);

            List<String> completedTopics = jdbcTemplate.queryForList(
                    "SELECT DISTINCT s.name FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id WHERE slt.student_id = ? AND slt.status = 'COMPLETED'",
                    String.class, studentId.toString()
            );
            for (String ct : completedTopics) {
                if (!learnedSkills.contains(ct)) learnedSkills.add(ct);
            }
        } catch (Exception ignored) {}

        if (learnedSkills.isEmpty()) {
            learnedSkills = new ArrayList<>(List.of("HTML", "JavaScript", "Java"));
        }

        // 3. Target company role
        try {
            List<String> roles = jdbcTemplate.queryForList(
                    "SELECT target_role FROM student_profiles WHERE user_id = ? AND target_role IS NOT NULL AND target_role != ''",
                    String.class, studentId.toString()
            );
            if (!roles.isEmpty() && roles.get(0) != null && !roles.get(0).isBlank()) {
                targetRole = roles.get(0);
            }
        } catch (Exception ignored) {}

        // 4. Detailed Concept Mastery: Active Weak Concepts vs Cleared Concepts
        try {
            List<Map<String, Object>> allAttempts = jdbcTemplate.queryForList(
                    "SELECT q.id, q.title, q.tags, s.name as skill_name, sqa.is_correct " +
                    "FROM student_question_attempts sqa " +
                    "JOIN questions q ON q.id = sqa.question_id " +
                    "LEFT JOIN skills s ON s.id = q.skill_id " +
                    "WHERE sqa.student_id = ? " +
                    "ORDER BY sqa.created_at ASC",
                    studentId.toString()
            );
            Map<String, Integer> totalPerConcept = new HashMap<>();
            Map<String, Integer> correctPerConcept = new HashMap<>();
            Map<String, Boolean> lastCorrectPerConcept = new HashMap<>();

            for (Map<String, Object> a : allAttempts) {
                String title = a.get("title") != null ? a.get("title").toString() : "";
                String tags = a.get("tags") != null ? a.get("tags").toString() : "";
                String skill = a.get("skill_name") != null ? a.get("skill_name").toString() : "";
                boolean isCorr = Boolean.TRUE.equals(a.get("is_correct")) || (a.get("is_correct") instanceof Number && ((Number) a.get("is_correct")).intValue() == 1);

                String concept = extractConceptName(skill, title, tags);
                if (concept == null) {
                    concept = title.replaceFirst("^Level \\d+: ", "").replaceFirst(" \\(Q\\d+\\)$", "").replaceFirst(" \\(Scenario \\d+\\)$", "");
                }

                totalPerConcept.put(concept, totalPerConcept.getOrDefault(concept, 0) + 1);
                if (isCorr) {
                    correctPerConcept.put(concept, correctPerConcept.getOrDefault(concept, 0) + 1);
                }
                lastCorrectPerConcept.put(concept, isCorr);
            }

            for (String concept : totalPerConcept.keySet()) {
                int tot = totalPerConcept.get(concept);
                int cor = correctPerConcept.getOrDefault(concept, 0);
                boolean lastCor = Boolean.TRUE.equals(lastCorrectPerConcept.get(concept));
                double acc = (cor * 100.0) / tot;

                if (lastCor && acc >= 60.0) {
                    clearedConcepts.add(concept); // Overcome/cleared -> Omit from daily challenge!
                } else {
                    activeWeakConcepts.add(concept); // Still weak / unresolved
                }
            }

            List<Map<String, Object>> rawFailed = jdbcTemplate.queryForList(
                    "SELECT q.id, q.title, q.tags, s.name as skill_name " +
                    "FROM student_question_attempts sqa " +
                    "JOIN questions q ON q.id = sqa.question_id " +
                    "LEFT JOIN skills s ON s.id = q.skill_id " +
                    "WHERE sqa.student_id = ? AND sqa.is_correct = false " +
                    "ORDER BY sqa.created_at DESC LIMIT 30",
                    studentId.toString()
            );
            failedAttempts = new ArrayList<>();
            for (Map<String, Object> rf : rawFailed) {
                Map<String, Object> cleanRow = new HashMap<>();
                cleanRow.put("id", rf.get("id") != null ? rf.get("id").toString() : "");
                cleanRow.put("title", rf.get("title") != null ? rf.get("title").toString() : "");
                cleanRow.put("tags", rf.get("tags") != null ? rf.get("tags").toString() : "");
                cleanRow.put("skill_name", rf.get("skill_name") != null ? rf.get("skill_name").toString() : "");
                failedAttempts.add(cleanRow);
            }
        } catch (Exception ignored) {}

        if (activeWeakConcepts.isEmpty()) {
            activeWeakConcepts = List.of("Universal border-box Reset", "Vertical Margin Collapsing Mechanics", "React Resource Ownership", "Python Generator Functions & Yield");
        }

        // 5. Skill Level
        try {
            Double avgScore = jdbcTemplate.queryForObject(
                    "SELECT AVG(score) FROM student_skills WHERE user_id = ?",
                    Double.class, studentId.toString()
            );
            if (avgScore != null) {
                if (avgScore >= 70.0) skillLevel = "ADVANCED";
                else if (avgScore >= 35.0) skillLevel = "INTERMEDIATE";
                else skillLevel = "BEGINNER";
            }
        } catch (Exception ignored) {}

        Map<String, Object> ctx = new HashMap<>();
        ctx.put("weakSkills", weakSkills);
        ctx.put("learnedSkills", learnedSkills);
        ctx.put("activeWeakConcepts", activeWeakConcepts);
        ctx.put("clearedConcepts", clearedConcepts);
        ctx.put("targetRole", targetRole);
        ctx.put("failedAttempts", failedAttempts);
        ctx.put("skillLevel", skillLevel);
        return ctx;
    }

    /**
     * Daily Challenge Sprint (15 Questions):
     * Based on what the candidate ALREADY LEARNED and INTERESTED COMPANY ROLES,
     * specifically targeting tricky edge cases and lagged concepts adapted to skill level.
     * Powered by local Ollama qwen3.5:4b.
     */
    /**
     * Daily Challenge Sprint (15 Questions):
     * Based on student's SKILL GAPS / WEAK SKILLS (TypeScript, Python, CSS, Spring Boot, React, PostgreSQL)
     * and ACTIVE UNRESOLVED FAILED CONCEPTS (omitting concepts they have already cleared).
     * Fixed for 24 hours (stored in student_daily_challenge_sets).
     */
    public List<Map<String, Object>> getRecommendedDailySet(UUID studentId, int count) {
        int targetCount = 15;
        LocalDate today = LocalDate.now();

        // 1. Check if Daily Sprint set is already generated and cached for today (24-hour persistence)
        try {
            List<Map<String, Object>> existing = jdbcTemplate.queryForList(
                    "SELECT questions_json, results_json, is_completed FROM student_daily_challenge_sets WHERE student_id = ? AND session_date = ? AND set_type = 'SPRINT'",
                    studentId.toString(), java.sql.Date.valueOf(today)
            );
            if (!existing.isEmpty()) {
                String qJson = (String) existing.get(0).get("questions_json");
                String resJson = (String) existing.get(0).get("results_json");
                List<Map<String, Object>> cachedList = objectMapper.readValue(qJson, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
                if (resJson != null && !resJson.isBlank()) {
                    try {
                        Map<String, Map<String, Object>> resMap = objectMapper.readValue(resJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Map<String, Object>>>() {});
                        for (Map<String, Object> q : cachedList) {
                            String qId = q.get("id") != null ? q.get("id").toString() : "";
                            if (resMap.containsKey(qId)) {
                                Map<String, Object> r = resMap.get(qId);
                                q.put("answered", true);
                                q.put("userSelectedOptionId", r.get("selectedOptionId"));
                                q.put("isCorrect", r.get("correct"));
                                q.put("explanation", r.get("explanation"));
                                q.put("correctOptionId", r.get("correctOptionId"));
                                q.put("correctOptionText", r.get("correctOptionText"));
                            }
                        }
                    } catch (Exception ignored) {}
                }
                registerOptionsInRegistry(cachedList);
                return cachedList;
            }
        } catch (Exception ignored) {}

        Map<String, Object> ctx = resolveStudentProfileContext(studentId);
        @SuppressWarnings("unchecked")
        List<String> weakSkills = (List<String>) ctx.get("weakSkills");
        @SuppressWarnings("unchecked")
        List<String> activeWeakConcepts = (List<String>) ctx.get("activeWeakConcepts");
        @SuppressWarnings("unchecked")
        Set<String> clearedConcepts = (Set<String>) ctx.get("clearedConcepts");
        String targetRole = (String) ctx.get("targetRole");
        String skillLevel = (String) ctx.get("skillLevel");

        List<Map<String, Object>> selectedQuestions = new ArrayList<>();
        Set<String> addedTitles = new HashSet<>();

        // 2. Call AI service for Ollama qwen3.5:4b targeting weak skills & active weak concepts
        if (aiClient != null) {
            try {
                Map<String, Object> aiResult = aiClient.getDailyChallengeSprint(
                        studentId.toString(), targetRole, weakSkills, activeWeakConcepts, skillLevel, targetCount
                );
                if (aiResult != null && aiResult.containsKey("questions")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> aiQuestions = (List<Map<String, Object>>) aiResult.get("questions");
                    if (aiQuestions != null) {
                        for (Map<String, Object> q : aiQuestions) {
                            String title = q.get("title") != null ? q.get("title").toString() : "";
                            boolean isCleared = clearedConcepts != null && clearedConcepts.stream().anyMatch(c -> title.toLowerCase().contains(c.toLowerCase()));
                            if (!isCleared && addedTitles.add(title)) {
                                selectedQuestions.add(q);
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // 3. Enrich/Backfill from database questions matching student's WEAK SKILLS
        if (selectedQuestions.size() < targetCount && !weakSkills.isEmpty()) {
            int remaining = targetCount - selectedQuestions.size();
            try {
                String inSql = String.join("','", weakSkills.stream().map(String::toLowerCase).toList());
                List<Map<String, Object>> dbQuestions = jdbcTemplate.queryForList(
                        "SELECT q.id, q.title, q.description, q.difficulty, q.question_type, s.name as skill_name " +
                        "FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE LOWER(s.name) IN ('" + inSql + "') " +
                        "AND (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') " +
                        "ORDER BY RAND() LIMIT ?",
                        remaining
                );
                for (Map<String, Object> row : dbQuestions) {
                    String title = row.get("title") != null ? row.get("title").toString() : "";
                    boolean isCleared = clearedConcepts != null && clearedConcepts.stream().anyMatch(c -> title.toLowerCase().contains(c.toLowerCase()));
                    if (!isCleared && addedTitles.add(title)) {
                        selectedQuestions.add(row);
                    }
                }
            } catch (Exception ignored) {}
        }

        // 4. Fallback if still needed
        if (selectedQuestions.size() < targetCount) {
            int remaining = targetCount - selectedQuestions.size();
            try {
                List<Map<String, Object>> generalDb = jdbcTemplate.queryForList(
                        "SELECT q.id, q.title, q.description, q.difficulty, q.question_type, s.name as skill_name " +
                        "FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') " +
                        "ORDER BY RAND() LIMIT ?",
                        remaining
                );
                for (Map<String, Object> row : generalDb) {
                    String title = row.get("title") != null ? row.get("title").toString() : "";
                    if (addedTitles.add(title)) {
                        selectedQuestions.add(row);
                    }
                }
            } catch (Exception ignored) {}
        }

        List<Map<String, Object>> finalSprint = buildQuestionSetResponse(selectedQuestions, "DAILY_SPRINT", targetRole, skillLevel);

        // 5. Persist to student_daily_challenge_sets for 24 hours
        try {
            String sprintJson = objectMapper.writeValueAsString(finalSprint);
            jdbcTemplate.update(
                    "INSERT INTO student_daily_challenge_sets (id, student_id, session_date, set_type, questions_json, results_json, is_completed, created_at, updated_at) " +
                    "VALUES (?, ?, ?, 'SPRINT', ?, '{}', 0, NOW(), NOW()) " +
                    "ON DUPLICATE KEY UPDATE questions_json = VALUES(questions_json), updated_at = NOW()",
                    UUID.randomUUID().toString(), studentId.toString(), java.sql.Date.valueOf(today), sprintJson
            );
        } catch (Exception ignored) {}

        return finalSprint;
    }

    /**
     * Revise & Recall (10 Questions):
     * Based on student's LEARNT / MASTERED SKILLS (HTML, JavaScript, Java)
     * for spaced retention and reinforcement.
     * Fixed for 24 hours (stored in student_daily_challenge_sets).
     */
    public List<Map<String, Object>> getReviseRecallSet(UUID studentId, int count) {
        int targetCount = 10;
        LocalDate today = LocalDate.now();

        // 1. Check if Recall set is already generated and cached for today (24-hour persistence)
        try {
            List<Map<String, Object>> existing = jdbcTemplate.queryForList(
                    "SELECT questions_json, results_json, is_completed FROM student_daily_challenge_sets WHERE student_id = ? AND session_date = ? AND set_type = 'RECALL'",
                    studentId.toString(), java.sql.Date.valueOf(today)
            );
            if (!existing.isEmpty()) {
                String qJson = (String) existing.get(0).get("questions_json");
                String resJson = (String) existing.get(0).get("results_json");
                List<Map<String, Object>> cachedList = objectMapper.readValue(qJson, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
                if (resJson != null && !resJson.isBlank()) {
                    try {
                        Map<String, Map<String, Object>> resMap = objectMapper.readValue(resJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Map<String, Object>>>() {});
                        for (Map<String, Object> q : cachedList) {
                            String qId = q.get("id") != null ? q.get("id").toString() : "";
                            if (resMap.containsKey(qId)) {
                                Map<String, Object> r = resMap.get(qId);
                                q.put("answered", true);
                                q.put("userSelectedOptionId", r.get("selectedOptionId"));
                                q.put("isCorrect", r.get("correct"));
                                q.put("explanation", r.get("explanation"));
                                q.put("correctOptionId", r.get("correctOptionId"));
                                q.put("correctOptionText", r.get("correctOptionText"));
                            }
                        }
                    } catch (Exception ignored) {}
                }
                registerOptionsInRegistry(cachedList);
                return cachedList;
            }
        } catch (Exception ignored) {}

        Map<String, Object> ctx = resolveStudentProfileContext(studentId);
        @SuppressWarnings("unchecked")
        List<String> learnedSkills = (List<String>) ctx.get("learnedSkills");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> failedAttempts = (List<Map<String, Object>>) ctx.get("failedAttempts");
        String skillLevel = (String) ctx.get("skillLevel");

        List<Map<String, Object>> selectedQuestions = new ArrayList<>();
        Set<String> addedTitles = new HashSet<>();

        // 2. Call AI service for Ollama qwen3.5:4b active recall questions on learned skills
        if (aiClient != null) {
            try {
                Map<String, Object> aiResult = aiClient.getReviseRecall(
                        studentId.toString(), learnedSkills, List.of("Mental Models", "Core Invariants"), failedAttempts, skillLevel, targetCount
                );
                if (aiResult != null && aiResult.containsKey("questions")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> aiQuestions = (List<Map<String, Object>>) aiResult.get("questions");
                    if (aiQuestions != null) {
                        for (Map<String, Object> q : aiQuestions) {
                            String title = q.get("title") != null ? q.get("title").toString() : "";
                            if (addedTitles.add(title)) {
                                selectedQuestions.add(q);
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // 3. Enrich from database matching student's LEARNED SKILLS (HTML, JavaScript, Java)
        if (selectedQuestions.size() < targetCount && !learnedSkills.isEmpty()) {
            int remaining = targetCount - selectedQuestions.size();
            try {
                String inSql = String.join("','", learnedSkills.stream().map(String::toLowerCase).toList());
                List<Map<String, Object>> dbQuestions = jdbcTemplate.queryForList(
                        "SELECT q.id, q.title, q.description, q.difficulty, q.question_type, s.name as skill_name " +
                        "FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE LOWER(s.name) IN ('" + inSql + "') " +
                        "AND (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') " +
                        "ORDER BY RAND() LIMIT ?",
                        remaining
                );
                for (Map<String, Object> row : dbQuestions) {
                    String title = row.get("title") != null ? row.get("title").toString() : "";
                    if (addedTitles.add(title)) {
                        selectedQuestions.add(row);
                    }
                }
            } catch (Exception ignored) {}
        }

        // 4. Fallback if still needed
        if (selectedQuestions.size() < targetCount) {
            int remaining = targetCount - selectedQuestions.size();
            try {
                List<Map<String, Object>> generalDb = jdbcTemplate.queryForList(
                        "SELECT q.id, q.title, q.description, q.difficulty, q.question_type, s.name as skill_name " +
                        "FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') " +
                        "ORDER BY RAND() LIMIT ?",
                        remaining
                );
                for (Map<String, Object> row : generalDb) {
                    String title = row.get("title") != null ? row.get("title").toString() : "";
                    if (addedTitles.add(title)) {
                        selectedQuestions.add(row);
                    }
                }
            } catch (Exception ignored) {}
        }

        List<Map<String, Object>> finalRecall = buildQuestionSetResponse(selectedQuestions, "ACTIVE_RECALL", "Spaced Retention on Mastered Skills", skillLevel);

        // 5. Persist to student_daily_challenge_sets for 24 hours
        try {
            String recallJson = objectMapper.writeValueAsString(finalRecall);
            jdbcTemplate.update(
                    "INSERT INTO student_daily_challenge_sets (id, student_id, session_date, set_type, questions_json, results_json, is_completed, created_at, updated_at) " +
                    "VALUES (?, ?, ?, 'RECALL', ?, '{}', 0, NOW(), NOW()) " +
                    "ON DUPLICATE KEY UPDATE questions_json = VALUES(questions_json), updated_at = NOW()",
                    UUID.randomUUID().toString(), studentId.toString(), java.sql.Date.valueOf(today), recallJson
            );
        } catch (Exception ignored) {}

        return finalRecall;
    }

    private List<Map<String, Object>> buildQuestionSetResponse(
            List<Map<String, Object>> rawQuestions,
            String mode,
            String roleOrFocus,
            String skillLevel
    ) {
        if (rawQuestions.isEmpty()) return Collections.emptyList();

        List<UUID> dbQIds = new ArrayList<>();
        for (Map<String, Object> q : rawQuestions) {
            Object idObj = q.get("id");
            if (idObj != null) {
                try {
                    dbQIds.add(UUID.fromString(idObj.toString()));
                } catch (Exception ignored) {}
            }
        }

        Map<UUID, List<Map<String, Object>>> optionsByQ = new HashMap<>();
        if (!dbQIds.isEmpty()) {
            List<com.beyon.practice.model.QuestionOption> allOptions = optionRepository.findByQuestionIdIn(dbQIds);
            for (var opt : allOptions) {
                optionsByQ.computeIfAbsent(opt.getQuestionId(), k -> new ArrayList<>()).add(Map.of(
                        "id", opt.getId().toString(),
                        "optionText", opt.getOptionText(),
                        "displayOrder", opt.getDisplayOrder(),
                        "isCorrect", opt.isCorrect(),
                        "explanation", opt.getExplanation() != null ? opt.getExplanation() : ""
                ));
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        int index = 1;
        for (Map<String, Object> q : rawQuestions) {
            Map<String, Object> item = new LinkedHashMap<>(q);
            item.put("index", index++);

            UUID validUuid;
            Object idObj = q.get("id");
            try {
                validUuid = idObj != null ? UUID.fromString(idObj.toString()) : UUID.randomUUID();
            } catch (Exception e) {
                validUuid = UUID.nameUUIDFromBytes((idObj != null ? idObj.toString() : ("gen-" + index)).getBytes());
            }
            item.put("id", validUuid.toString());

            if (item.get("description") == null && item.get("question") != null) {
                item.put("description", item.get("question"));
            } else if (item.get("question") == null && item.get("description") != null) {
                item.put("question", item.get("description"));
            }

            // Check if options are already provided by AI synthesis
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> existingOptions = (List<Map<String, Object>>) q.get("options");
            if (existingOptions != null && !existingOptions.isEmpty()) {
                List<Map<String, Object>> formattedOptions = new ArrayList<>();
                UUID correctOptId = null;
                String correctOptText = "";
                String explanationText = "";

                for (Map<String, Object> opt : existingOptions) {
                    UUID optUuid = UUID.randomUUID();
                    boolean isCorr = Boolean.TRUE.equals(opt.get("isCorrect")) || Boolean.TRUE.equals(opt.get("correct"));
                    String text = (String) opt.getOrDefault("optionText", opt.getOrDefault("text", ""));
                    String exp = (String) opt.getOrDefault("explanation", "");

                    formattedOptions.add(Map.of(
                            "id", optUuid.toString(),
                            "optionText", text,
                            "displayOrder", formattedOptions.size() + 1,
                            "isCorrect", isCorr,
                            "explanation", exp
                    ));

                    if (isCorr) {
                        correctOptId = optUuid;
                        correctOptText = text;
                        explanationText = exp;
                    }
                }
                item.put("options", formattedOptions);

                // Register in synthetic registry for submission grading
                syntheticQuestionRegistry.put(validUuid, Map.of(
                        "correctOptionId", correctOptId != null ? correctOptId : UUID.randomUUID(),
                        "correctOptionText", correctOptText,
                        "explanation", explanationText != null ? explanationText : "Review architectural principles."
                ));
            } else {
                item.put("options", optionsByQ.getOrDefault(validUuid, Collections.emptyList()));
            }

            item.put("xpReward", "ACTIVE_RECALL".equals(mode) ? 30 : 25);
            item.put("coinReward", "ACTIVE_RECALL".equals(mode) ? 6 : 5);
            item.put("difficulty", skillLevel != null ? skillLevel : "INTERMEDIATE");

            if ("ACTIVE_RECALL".equals(mode)) {
                int retention = 40 + (int)(Math.random() * 25);
                item.put("retentionScore", retention);
                item.put("recallStage", "STAGE_2_ACTIVE_RECALL");
                item.put("lastReviewed", "Incorrect attempt in recent assessment");
            } else {
                item.put("companyRoleAligned", roleOrFocus);
            }

            result.add(item);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> submitSprintQuestion(UUID studentId, UUID questionId, UUID selectedOptionId, Integer timeSpent) {
        boolean correct = false;

        // Check synthetic question registry first
        if (syntheticQuestionRegistry.containsKey(questionId)) {
            Map<String, Object> synth = syntheticQuestionRegistry.get(questionId);
            UUID correctOptId = (UUID) synth.get("correctOptionId");
            correct = correctOptId != null && correctOptId.equals(selectedOptionId);
            String explanation = (String) synth.getOrDefault("explanation", "Review the architectural principles.");
            String correctOptionText = (String) synth.getOrDefault("correctOptionText", "");

            int xpEarned = correct ? 25 : 5;
            int coinsEarned = correct ? 10 : 0;
            if (correct) {
                coinService.earnCoins(studentId, "DAILY_SPRINT_QUESTION_CORRECT", "DAILY_SPRINT", questionId);
            }

            try {
                jdbcTemplate.update(
                        "INSERT INTO student_question_attempts (id, student_id, question_id, is_correct, score, time_spent_seconds, status, created_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED', NOW()) " +
                        "ON DUPLICATE KEY UPDATE is_correct = VALUES(is_correct)",
                        UUID.randomUUID().toString(), studentId.toString(), questionId.toString(), correct, correct ? 1 : 0, timeSpent != null ? timeSpent : 30
                );
            } catch (Exception ignored) {}

            updateDailySetSubmission(studentId, questionId, selectedOptionId, correct, explanation, correctOptId != null ? correctOptId.toString() : "", correctOptionText, xpEarned, coinsEarned);

            return Map.of(
                    "correct", correct,
                    "explanation", explanation,
                    "correctOptionId", correctOptId != null ? correctOptId.toString() : "",
                    "correctOptionText", correctOptionText,
                    "xpEarned", xpEarned,
                    "coinsEarned", coinsEarned
            );
        }

        List<com.beyon.practice.model.QuestionOption> options = optionRepository.findByQuestionId(questionId);
        com.beyon.practice.model.QuestionOption correctOpt = options.stream()
                .filter(com.beyon.practice.model.QuestionOption::isCorrect)
                .findFirst()
                .orElse(null);

        com.beyon.practice.model.QuestionOption selectedOpt = selectedOptionId != null
                ? options.stream().filter(o -> o.getId().equals(selectedOptionId)).findFirst().orElse(null)
                : null;

        if (selectedOpt != null) {
            correct = selectedOpt.isCorrect();
        }

        String explanation = null;
        if (correctOpt != null && correctOpt.getExplanation() != null && !correctOpt.getExplanation().isBlank()) {
            explanation = correctOpt.getExplanation();
        } else if (selectedOpt != null && selectedOpt.getExplanation() != null && !selectedOpt.getExplanation().isBlank()) {
            explanation = selectedOpt.getExplanation();
        }

        if (explanation == null || explanation.isBlank()) {
            var qOpt = questionRepository.findById(questionId);
            if (qOpt.isPresent() && qOpt.get().getDescription() != null && !qOpt.get().getDescription().isBlank()) {
                explanation = qOpt.get().getDescription();
            } else if (correctOpt != null) {
                explanation = "The correct answer is: " + correctOpt.getOptionText();
            } else {
                explanation = "Review the core concepts in the practice arena.";
            }
        }

        int xpEarned = correct ? 25 : 5;
        int coinsEarned = correct ? 10 : 0;

        if (correct) {
            coinService.earnCoins(studentId, "DAILY_SPRINT_QUESTION_CORRECT", "DAILY_SPRINT", questionId);
            questionRepository.findById(questionId).ifPresent(q -> {
                practiceService.updateStats(studentId, q, true, timeSpent != null ? timeSpent : 30);
                if (q.getSkillId() != null) {
                    skillXpService.earnXp(studentId, q.getSkillId(), xpEarned, "DAILY_SPRINT", questionId, "Daily sprint question: " + q.getTitle());
                }
            });
        }

        // Record telemetry to MongoDB & EventBridge
        if (telemetryService != null) {
            Map<String, Object> meta = new HashMap<>();
            meta.put("questionId", questionId.toString());
            meta.put("selectedOptionId", selectedOptionId != null ? selectedOptionId.toString() : null);
            meta.put("correct", correct);
            telemetryService.logActivity(studentId.toString(), "PRACTICE_SPRINT_ANSWER", questionId.toString(), timeSpent != null ? timeSpent : 30, meta);
        }

        // Trigger adaptive learning update in AI Intelligence engine
        if (aiClient != null) {
            final boolean isAnsCorrect = correct;
            questionRepository.findById(questionId).ifPresent(q -> {
                try {
                    String sName = q.getTitle() != null ? q.getTitle() : "Skill Sprint";
                    aiClient.processAttempt(studentId.toString(), sName, "Sprint", isAnsCorrect, timeSpent != null ? timeSpent : 30, isAnsCorrect ? 80.0 : 40.0, 0.85);
                } catch (Exception ignored) {}
            });
        }

        try {
            jdbcTemplate.update(
                    "INSERT INTO student_question_attempts (id, student_id, question_id, is_correct, score, time_spent_seconds, status, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED', NOW()) " +
                    "ON DUPLICATE KEY UPDATE is_correct = VALUES(is_correct)",
                    UUID.randomUUID().toString(), studentId.toString(), questionId.toString(), correct, correct ? 1 : 0, timeSpent != null ? timeSpent : 30
            );
        } catch (Exception ignored) {}

        updateDailySetSubmission(studentId, questionId, selectedOptionId, correct, explanation, correctOpt != null ? correctOpt.getId().toString() : "", correctOpt != null ? correctOpt.getOptionText() : "", xpEarned, coinsEarned);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("correct", correct);
        resp.put("explanation", explanation);
        resp.put("xpEarned", xpEarned);
        resp.put("coinsEarned", coinsEarned);
        if (correctOpt != null) {
            resp.put("correctOptionId", correctOpt.getId().toString());
            resp.put("correctOptionText", correctOpt.getOptionText());
        }
        return resp;
    }

    @Transactional
    public Map<String, Object> claimSprintBonus(UUID studentId, String sessionType, double scorePercentage) {
        if (scorePercentage < 100.0) {
            return Map.of(
                    "success", false,
                    "coinsAwarded", 0,
                    "message", "A perfect score of 100% is required to claim the 100 Beyon Coins completion bonus."
            );
        }

        coinService.earnCoins(studentId, "DAILY_COMPLETION_BONUS", sessionType != null ? sessionType : "DAILY_SPRINT", UUID.randomUUID());
        streakService.recordActivity(studentId);

        return Map.of(
                "success", true,
                "coinsAwarded", 100,
                "message", "Congratulations! 100 Beyon Coins have been credited to your wallet."
        );
    }

    public DailyChallenge getTodayChallenge(UUID studentId) {
        LocalDate today = LocalDate.now();
        Optional<DailyChallenge> existing = challengeRepository.findByStudentIdAndChallengeDate(studentId, today);
        if (existing.isPresent()) {
            return existing.get();
        }
        return generateChallenge(studentId, today);
    }

    @Transactional
    public DailyChallenge generateChallenge(UUID studentId, LocalDate date) {
        List<String> studentSkills = new ArrayList<>();
        try {
            List<String> enrolled = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(skill_name) FROM student_skills WHERE user_id = ?",
                    String.class, studentId.toString()
            );
            studentSkills.addAll(enrolled);

            List<String> learning = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(s.name) FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id WHERE slt.student_id = ?",
                    String.class, studentId.toString()
            );
            studentSkills.addAll(learning);
        } catch (Exception ignored) {}

        UUID selectedQuestionId = null;
        if (!studentSkills.isEmpty()) {
            try {
                String inSql = String.join("','", studentSkills);
                List<Map<String, Object>> matchingQuestions = jdbcTemplate.queryForList(
                        "SELECT q.id FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE (LOWER(s.name) IN ('" + inSql + "') OR " +
                        "LOWER(q.title) REGEXP '" + String.join("|", studentSkills) + "') " +
                        "AND q.id NOT IN (SELECT question_id FROM daily_challenges WHERE student_id = ? AND status = 'COMPLETED') " +
                        "ORDER BY RAND() LIMIT 5",
                        studentId.toString()
                );
                if (!matchingQuestions.isEmpty()) {
                    selectedQuestionId = UUID.fromString(matchingQuestions.get(0).get("id").toString());
                }
            } catch (Exception ignored) {}
        }

        if (selectedQuestionId == null) {
            List<Question> unsolved = questionRepository.findUnsolvedForStudent(studentId, PageRequest.of(0, 20));
            if (unsolved.isEmpty()) {
                unsolved = questionRepository.findByStatusInOrderByCreatedAtDesc(List.of("PUBLISHED", "ACTIVE"), PageRequest.of(0, 20));
            }
            if (unsolved.isEmpty()) return null;
            selectedQuestionId = unsolved.get((int) (Math.random() * unsolved.size())).getId();
        }

        DailyChallenge challenge = new DailyChallenge();
        challenge.setStudentId(studentId);
        challenge.setChallengeDate(date);
        challenge.setQuestionId(selectedQuestionId);
        challenge.setStatus("PENDING");
        return challengeRepository.save(challenge);
    }

    @Transactional
    public DailyChallenge startChallenge(UUID studentId, UUID challengeId) {
        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ConflictException("Challenge not found"));
        if (!challenge.getStudentId().equals(studentId)) {
            throw new ConflictException("Not your challenge");
        }
        challenge.setStatus("IN_PROGRESS");
        challenge.setStartedAt(Instant.now());
        return challengeRepository.save(challenge);
    }

    @Transactional
    public DailyChallenge completeChallenge(UUID studentId, UUID challengeId, boolean correct, Integer timeSpent) {
        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ConflictException("Challenge not found"));
        if (!challenge.getStudentId().equals(studentId)) {
            throw new ConflictException("Not your challenge");
        }
        challenge.setStatus("COMPLETED");
        challenge.setCompletedAt(Instant.now());
        challenge.setCorrect(correct);
        challenge.setTimeSpentSeconds(timeSpent);

        DailyChallenge saved = challengeRepository.save(challenge);
        if (correct) {
            coinService.earnCoins(studentId, "DAILY_CHALLENGE_COMPLETED", "DAILY_CHALLENGE", challengeId);
            streakService.recordActivity(studentId);
            badgeService.awardBadge(studentId, "LEARNING_STARTER");

            if (challenge.getQuestionId() != null) {
                questionRepository.findById(challenge.getQuestionId()).ifPresent(q -> {
                    practiceService.updateStats(studentId, q, true, timeSpent);
                    int xp = switch (q.getDifficulty() != null ? q.getDifficulty() : "MEDIUM") {
                        case "HARD" -> 50;
                        case "EASY" -> 15;
                        default -> 30;
                    };
                    if (q.getSkillId() != null) {
                        skillXpService.earnXp(studentId, q.getSkillId(), xp, "DAILY_CHALLENGE", challengeId, "Completed daily challenge: " + q.getTitle());
                    }
                });
            }
        }
        return saved;
    }

    public List<DailyChallenge> getHistory(UUID studentId) {
        return challengeRepository.findByStudentIdOrderByChallengeDateDesc(studentId);
    }
}

