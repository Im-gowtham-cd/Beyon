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

    public DailyChallengeService(DailyChallengeRepository challengeRepository,
                                  QuestionRepository questionRepository,
                                  QuestionOptionRepository optionRepository,
                                  CoinService coinService,
                                  StreakService streakService,
                                  SkillXpService skillXpService,
                                  AchievementBadgeService badgeService,
                                  PracticeService practiceService,
                                  org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.challengeRepository = challengeRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.coinService = coinService;
        this.streakService = streakService;
        this.skillXpService = skillXpService;
        this.badgeService = badgeService;
        this.practiceService = practiceService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> getRecommendedDailySet(UUID studentId, int count) {
        int targetCount = count > 0 ? Math.min(count, 20) : 15;

        List<String> studentSkills = new ArrayList<>();
        try {
            List<String> wished = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(skill_name) FROM student_learning_skills WHERE user_id = ?",
                    String.class, studentId.toString()
            );
            studentSkills.addAll(wished);

            List<String> enrolledSkills = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(skill_name) FROM student_skills WHERE user_id = ?",
                    String.class, studentId.toString()
            );
            studentSkills.addAll(enrolledSkills);

            List<String> learningTopics = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(s.name) FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id WHERE slt.student_id = ?",
                    String.class, studentId.toString()
            );
            studentSkills.addAll(learningTopics);
        } catch (Exception ignored) {}

        List<Map<String, Object>> selectedQuestions = new ArrayList<>();
        Set<String> addedIds = new HashSet<>();

        if (!studentSkills.isEmpty()) {
            try {
                String inSql = String.join("','", studentSkills);
                List<Map<String, Object>> matched = jdbcTemplate.queryForList(
                        "SELECT q.id, q.title, q.description, q.difficulty, q.question_type, s.name as skill_name " +
                        "FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE (LOWER(s.name) IN ('" + inSql + "') OR LOWER(q.title) REGEXP '" + String.join("|", studentSkills) + "') " +
                        "AND (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') " +
                        "ORDER BY RAND() LIMIT " + targetCount
                );
                for (Map<String, Object> row : matched) {
                    String id = row.get("id").toString();
                    if (addedIds.add(id)) {
                        selectedQuestions.add(row);
                    }
                }
            } catch (Exception ignored) {}
        }

        if (selectedQuestions.size() < targetCount) {
            int remaining = targetCount - selectedQuestions.size();
            try {
                List<Map<String, Object>> fallback = jdbcTemplate.queryForList(
                        "SELECT q.id, q.title, q.description, q.difficulty, q.question_type, s.name as skill_name " +
                        "FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') " +
                        "ORDER BY RAND() LIMIT " + remaining
                );
                for (Map<String, Object> row : fallback) {
                    String id = row.get("id").toString();
                    if (addedIds.add(id)) {
                        selectedQuestions.add(row);
                    }
                }
            } catch (Exception ignored) {}
        }

        return buildQuestionSetResponse(selectedQuestions, "DAILY_SPRINT");
    }

    public List<Map<String, Object>> getReviseRecallSet(UUID studentId, int count) {
        int targetCount = count > 0 ? Math.min(count, 15) : 10;

        List<String> completedSkills = new ArrayList<>();
        try {
            List<String> completed = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(s.name) FROM student_learning_topics slt " +
                    "JOIN skill_topics st ON st.id = slt.topic_id " +
                    "JOIN skills s ON s.id = st.skill_id " +
                    "WHERE slt.student_id = ? AND slt.status = 'COMPLETED'",
                    String.class, studentId.toString()
            );
            completedSkills.addAll(completed);

            List<String> profileSkills = jdbcTemplate.queryForList(
                    "SELECT DISTINCT LOWER(skill_name) FROM student_skills WHERE user_id = ? AND proficiency_level IN ('INTERMEDIATE', 'ADVANCED', 'EXPERT')",
                    String.class, studentId.toString()
            );
            completedSkills.addAll(profileSkills);
        } catch (Exception ignored) {}

        List<Map<String, Object>> selectedQuestions = new ArrayList<>();
        Set<String> addedIds = new HashSet<>();

        if (!completedSkills.isEmpty()) {
            try {
                String inSql = String.join("','", completedSkills);
                List<Map<String, Object>> matched = jdbcTemplate.queryForList(
                        "SELECT q.id, q.title, q.description, q.difficulty, q.question_type, s.name as skill_name " +
                        "FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE (LOWER(s.name) IN ('" + inSql + "') OR LOWER(q.title) REGEXP '" + String.join("|", completedSkills) + "') " +
                        "AND (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') " +
                        "ORDER BY RAND() LIMIT " + targetCount
                );
                for (Map<String, Object> row : matched) {
                    String id = row.get("id").toString();
                    if (addedIds.add(id)) {
                        selectedQuestions.add(row);
                    }
                }
            } catch (Exception ignored) {}
        }

        if (selectedQuestions.size() < targetCount) {
            int remaining = targetCount - selectedQuestions.size();
            try {
                List<Map<String, Object>> fallback = jdbcTemplate.queryForList(
                        "SELECT q.id, q.title, q.description, q.difficulty, q.question_type, s.name as skill_name " +
                        "FROM questions q " +
                        "LEFT JOIN skills s ON s.id = q.skill_id " +
                        "WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') " +
                        "ORDER BY RAND() LIMIT " + remaining
                );
                for (Map<String, Object> row : fallback) {
                    String id = row.get("id").toString();
                    if (addedIds.add(id)) {
                        selectedQuestions.add(row);
                    }
                }
            } catch (Exception ignored) {}
        }

        return buildQuestionSetResponse(selectedQuestions, "ACTIVE_RECALL");
    }

    private List<Map<String, Object>> buildQuestionSetResponse(List<Map<String, Object>> rawQuestions, String mode) {
        if (rawQuestions.isEmpty()) return Collections.emptyList();

        List<UUID> qIds = rawQuestions.stream()
                .map(r -> UUID.fromString(r.get("id").toString()))
                .toList();

        List<com.beyon.practice.model.QuestionOption> allOptions = optionRepository.findByQuestionIdIn(qIds);
        Map<UUID, List<Map<String, Object>>> optionsByQ = new HashMap<>();

        for (var opt : allOptions) {
            optionsByQ.computeIfAbsent(opt.getQuestionId(), k -> new ArrayList<>()).add(Map.of(
                    "id", opt.getId().toString(),
                    "optionText", opt.getOptionText(),
                    "displayOrder", opt.getDisplayOrder(),
                    "isCorrect", opt.isCorrect(),
                    "explanation", opt.getExplanation() != null ? opt.getExplanation() : ""
            ));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        int index = 1;
        for (Map<String, Object> q : rawQuestions) {
            UUID qId = UUID.fromString(q.get("id").toString());
            Map<String, Object> item = new LinkedHashMap<>(q);
            item.put("index", index++);
            item.put("options", optionsByQ.getOrDefault(qId, Collections.emptyList()));
            item.put("xpReward", "HARD".equals(q.get("difficulty")) ? 35 : 25);
            item.put("coinReward", 10);
            if ("ACTIVE_RECALL".equals(mode)) {
                int retention = 75 + (int)(Math.random() * 20);
                item.put("retentionScore", retention);
                item.put("recallStage", retention > 85 ? "SOLID" : "NEEDS_REFRESH");
                item.put("lastReviewed", "3 days ago");
            }
            result.add(item);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> submitSprintQuestion(UUID studentId, UUID questionId, UUID selectedOptionId, Integer timeSpent) {
        boolean correct = false;

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
            streakService.recordActivity(studentId);
            questionRepository.findById(questionId).ifPresent(q -> {
                practiceService.updateStats(studentId, q, true, timeSpent != null ? timeSpent : 30);
                if (q.getSkillId() != null) {
                    skillXpService.earnXp(studentId, q.getSkillId(), xpEarned, "DAILY_SPRINT", questionId, "Daily sprint question: " + q.getTitle());
                }
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

