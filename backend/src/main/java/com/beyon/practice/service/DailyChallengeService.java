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
        List<String> learnedSkills = new ArrayList<>();
        List<String> currentlyLearningSkills = new ArrayList<>();
        String targetRole = "Full-Stack Software Engineer (Cloud Architecture)";
        List<String> laggedConcepts = new ArrayList<>();
        List<Map<String, Object>> failedAttempts = new ArrayList<>();
        String skillLevel = "INTERMEDIATE";

        // 1. Learned skills (score >= 50 or completed topics)
        try {
            List<String> highScores = jdbcTemplate.queryForList(
                    "SELECT DISTINCT skill_name FROM student_skills WHERE user_id = ? AND (score >= 50 OR proficiency_level IN ('INTERMEDIATE', 'ADVANCED', 'EXPERT'))",
                    String.class, studentId.toString()
            );
            learnedSkills.addAll(highScores);

            List<String> completedTopics = jdbcTemplate.queryForList(
                    "SELECT DISTINCT s.name FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id WHERE slt.student_id = ? AND slt.status = 'COMPLETED'",
                    String.class, studentId.toString()
            );
            learnedSkills.addAll(completedTopics);
        } catch (Exception ignored) {}

        if (learnedSkills.isEmpty()) {
            learnedSkills = new ArrayList<>(List.of("Java", "JavaScript", "HTML", "CSS"));
        }

        // 2. Currently learning skills (in-progress topics, wishlists, score < 50)
        try {
            List<String> inProgress = jdbcTemplate.queryForList(
                    "SELECT DISTINCT s.name FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id WHERE slt.student_id = ? AND slt.status = 'IN_PROGRESS'",
                    String.class, studentId.toString()
            );
            currentlyLearningSkills.addAll(inProgress);

            List<String> wished = jdbcTemplate.queryForList(
                    "SELECT DISTINCT skill_name FROM student_learning_skills WHERE user_id = ?",
                    String.class, studentId.toString()
            );
            currentlyLearningSkills.addAll(wished);

            List<String> lowScores = jdbcTemplate.queryForList(
                    "SELECT DISTINCT skill_name FROM student_skills WHERE user_id = ? AND score < 50",
                    String.class, studentId.toString()
            );
            currentlyLearningSkills.addAll(lowScores);
        } catch (Exception ignored) {}

        if (currentlyLearningSkills.isEmpty()) {
            currentlyLearningSkills = new ArrayList<>(List.of("React", "TypeScript", "Spring Boot", "Python", "PostgreSQL", "CSS"));
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

        // 4. Lagged concepts & failed questions
        try {
            failedAttempts = jdbcTemplate.queryForList(
                    "SELECT q.id, q.title, q.tags, s.name as skill_name " +
                    "FROM student_question_attempts sqa " +
                    "JOIN questions q ON q.id = sqa.question_id " +
                    "LEFT JOIN skills s ON s.id = q.skill_id " +
                    "WHERE sqa.student_id = ? AND sqa.is_correct = false " +
                    "ORDER BY sqa.created_at DESC LIMIT 30",
                    studentId.toString()
            );
            for (Map<String, Object> fa : failedAttempts) {
                String title = fa.get("title") != null ? fa.get("title").toString() : "";
                String tags = fa.get("tags") != null ? fa.get("tags").toString() : "";
                String skill = fa.get("skill_name") != null ? fa.get("skill_name").toString() : "";
                String concept = extractConceptName(skill, title, tags);
                if (concept != null && !laggedConcepts.contains(concept)) {
                    laggedConcepts.add(concept);
                }
            }
        } catch (Exception ignored) {}

        if (laggedConcepts.isEmpty()) {
            laggedConcepts = List.of("Event Loop Order", "CSS Box Model & Margin Collapsing", "React Fiber Architecture", "TypeScript Generics & Discriminated Unions");
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
        ctx.put("learnedSkills", learnedSkills);
        ctx.put("currentlyLearningSkills", currentlyLearningSkills);
        ctx.put("targetRole", targetRole);
        ctx.put("laggedConcepts", laggedConcepts);
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
    public List<Map<String, Object>> getRecommendedDailySet(UUID studentId, int count) {
        int targetCount = 15;
        Map<String, Object> ctx = resolveStudentProfileContext(studentId);

        @SuppressWarnings("unchecked")
        List<String> learnedSkills = (List<String>) ctx.get("learnedSkills");
        @SuppressWarnings("unchecked")
        List<String> laggedConcepts = (List<String>) ctx.get("laggedConcepts");
        String targetRole = (String) ctx.get("targetRole");
        String skillLevel = (String) ctx.get("skillLevel");

        List<Map<String, Object>> selectedQuestions = new ArrayList<>();
        Set<String> addedTitles = new HashSet<>();

        // 1. Call AI service for Ollama qwen3.5:4b generated questions
        if (aiClient != null) {
            try {
                Map<String, Object> aiResult = aiClient.getDailyChallengeSprint(
                        studentId.toString(), targetRole, learnedSkills, laggedConcepts, skillLevel, targetCount
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
            } catch (Exception e) {
                // Fallback will enrich
            }
        }

        // 2. Enrich/Backfill from database questions matching learned skills and lagged concepts
        if (selectedQuestions.size() < targetCount) {
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

        // 3. Fallback to general question bank if still needed
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

        return buildQuestionSetResponse(selectedQuestions, "DAILY_SPRINT", targetRole, skillLevel);
    }

    /**
     * Revise & Recall (10 Questions):
     * Based strictly on what the candidate is CURRENTLY LEARNING,
     * specifically covering lagged concepts and incorrectly answered questions.
     * Formatted for active recall and spaced repetition, powered by local Ollama qwen3.5:4b.
     */
    public List<Map<String, Object>> getReviseRecallSet(UUID studentId, int count) {
        int targetCount = 10;
        Map<String, Object> ctx = resolveStudentProfileContext(studentId);

        @SuppressWarnings("unchecked")
        List<String> currentlyLearningSkills = (List<String>) ctx.get("currentlyLearningSkills");
        @SuppressWarnings("unchecked")
        List<String> laggedConcepts = (List<String>) ctx.get("laggedConcepts");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> failedAttempts = (List<Map<String, Object>>) ctx.get("failedAttempts");
        String skillLevel = (String) ctx.get("skillLevel");

        List<Map<String, Object>> selectedQuestions = new ArrayList<>();
        Set<String> addedTitles = new HashSet<>();

        // 1. Call AI service for Ollama qwen3.5:4b active recall questions
        if (aiClient != null) {
            try {
                Map<String, Object> aiResult = aiClient.getReviseRecall(
                        studentId.toString(), currentlyLearningSkills, laggedConcepts, failedAttempts, skillLevel, targetCount
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
            } catch (Exception e) {
                // Fallback will enrich
            }
        }

        // 2. Enrich from database matching currently learning skills and lagged concepts
        if (selectedQuestions.size() < targetCount) {
            int remaining = targetCount - selectedQuestions.size();
            try {
                String inSql = String.join("','", currentlyLearningSkills.stream().map(String::toLowerCase).toList());
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

        // 3. General backfill if still needed
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

        return buildQuestionSetResponse(selectedQuestions, "ACTIVE_RECALL", "In-Progress Learning & Lagged Concepts", skillLevel);
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

