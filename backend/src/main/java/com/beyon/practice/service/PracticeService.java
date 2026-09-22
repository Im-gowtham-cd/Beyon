package com.beyon.practice.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.practice.model.*;
import com.beyon.practice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class PracticeService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final QuestionTestCaseRepository testCaseRepository;
    private final StudentQuestionAttemptRepository attemptRepository;
    private final StudentPracticeStatsRepository statsRepository;
    private final CoinService coinService;
    private final SkillXpService skillXpService;
    private final StreakService streakService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public PracticeService(QuestionRepository questionRepository,
                            QuestionOptionRepository optionRepository,
                            QuestionTestCaseRepository testCaseRepository,
                            StudentQuestionAttemptRepository attemptRepository,
                            StudentPracticeStatsRepository statsRepository,
                            CoinService coinService,
                            SkillXpService skillXpService,
                            StreakService streakService,
                            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.testCaseRepository = testCaseRepository;
        this.attemptRepository = attemptRepository;
        this.statsRepository = statsRepository;
        this.coinService = coinService;
        this.skillXpService = skillXpService;
        this.streakService = streakService;
        this.jdbcTemplate = jdbcTemplate;
    }

    private static class QueryBuilder {
        final StringBuilder sql = new StringBuilder();
        final List<Object> params = new java.util.ArrayList<>();
    }

    private QueryBuilder buildQuestionsQuery(UUID skillId, UUID topicId, String difficulty, String category, String search) {
        QueryBuilder qb = new QueryBuilder();
        qb.sql.append(" WHERE (status = 'PUBLISHED' OR status = 'ACTIVE')");

        if (skillId != null) {
            qb.sql.append(" AND skill_id = ?");
            qb.params.add(skillId.toString());
        }
        if (topicId != null) {
            qb.sql.append(" AND topic_id = ?");
            qb.params.add(topicId.toString());
        }
        if (difficulty != null && !difficulty.isBlank() && !"ALL".equalsIgnoreCase(difficulty)) {
            String diffUpper = difficulty.toUpperCase().trim();
            if ("EASY".equals(diffUpper) || "BEGINNER".equals(diffUpper)) {
                qb.sql.append(" AND difficulty IN ('EASY', 'BEGINNER')");
            } else if ("MEDIUM".equals(diffUpper) || "INTERMEDIATE".equals(diffUpper)) {
                qb.sql.append(" AND difficulty IN ('MEDIUM', 'INTERMEDIATE')");
            } else if ("HARD".equals(diffUpper) || "ADVANCED".equals(diffUpper) || "EXPERT".equals(diffUpper)) {
                qb.sql.append(" AND difficulty IN ('HARD', 'ADVANCED', 'EXPERT')");
            } else {
                qb.sql.append(" AND difficulty = ?");
                qb.params.add(diffUpper);
            }
        }
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            String cat = category.trim().toLowerCase();
            if (cat.contains("java") || cat.contains("spring")) {
                qb.sql.append(" AND (LOWER(tags) LIKE '%java%' OR LOWER(tags) LIKE '%spring%' OR LOWER(title) LIKE '%java%' OR LOWER(title) LIKE '%spring%')");
            } else if (cat.contains("angular")) {
                qb.sql.append(" AND (LOWER(tags) LIKE '%angular%' OR LOWER(title) LIKE '%angular%')");
            } else if (cat.contains("react") || cat.contains("frontend")) {
                qb.sql.append(" AND (LOWER(tags) LIKE '%react%' OR LOWER(tags) LIKE '%next%' OR LOWER(tags) LIKE '%css%' OR LOWER(tags) LIKE '%html%' OR LOWER(tags) LIKE '%javascript%' OR LOWER(tags) LIKE '%typescript%' OR LOWER(tags) LIKE '%vue%' OR LOWER(tags) LIKE '%bootstrap%' OR LOWER(title) LIKE '%react%')");
            } else if (cat.contains("dsa") || cat.contains("algorithm")) {
                qb.sql.append(" AND (LOWER(tags) LIKE '%algorithm%' OR LOWER(tags) LIKE '%data structures%' OR LOWER(tags) LIKE '%dsa%' OR LOWER(title) LIKE '%dsa%' OR LOWER(title) LIKE '%algorithm%' OR LOWER(title) LIKE '%data structure%')");
            } else if (cat.contains("python") || cat.contains("ai")) {
                qb.sql.append(" AND (LOWER(tags) LIKE '%python%' OR LOWER(tags) LIKE '%django%' OR LOWER(tags) LIKE '%fastapi%' OR LOWER(tags) LIKE '%machine learning%' OR LOWER(tags) LIKE '%deep learning%' OR LOWER(tags) LIKE '%pytorch%' OR LOWER(tags) LIKE '%scikit%' OR LOWER(tags) LIKE '%nlp%' OR LOWER(tags) LIKE '%numpy%' OR LOWER(tags) LIKE '%matplotlib%' OR LOWER(title) LIKE '%python%')");
            } else if (cat.contains("sql") || cat.contains("database") || cat.contains("dbms")) {
                qb.sql.append(" AND (LOWER(tags) LIKE '%sql%' OR LOWER(tags) LIKE '%mysql%' OR LOWER(tags) LIKE '%postgres%' OR LOWER(tags) LIKE '%mongodb%' OR LOWER(tags) LIKE '%redis%' OR LOWER(tags) LIKE '%database%' OR LOWER(tags) LIKE '%dbms%' OR LOWER(tags) LIKE '%sqlite%' OR LOWER(tags) LIKE '%cassandra%' OR LOWER(tags) LIKE '%dynamodb%' OR question_type = 'SQL')");
            } else if (cat.contains("system design") || cat.contains("devops") || cat.contains("cloud") || cat.contains("security")) {
                qb.sql.append(" AND (LOWER(tags) LIKE '%system design%' OR LOWER(tags) LIKE '%devops%' OR LOWER(tags) LIKE '%docker%' OR LOWER(tags) LIKE '%kubernetes%' OR LOWER(tags) LIKE '%linux%' OR LOWER(tags) LIKE '%cloud%' OR LOWER(tags) LIKE '%aws%' OR LOWER(tags) LIKE '%azure%' OR LOWER(tags) LIKE '%google cloud%' OR LOWER(tags) LIKE '%jenkins%' OR LOWER(tags) LIKE '%git%' OR LOWER(tags) LIKE '%cybersecurity%' OR LOWER(tags) LIKE '%wireshark%' OR LOWER(tags) LIKE '%burp%' OR LOWER(tags) LIKE '%kafka%' OR LOWER(title) LIKE '%system design%')");
            } else if (cat.contains("mobile") || cat.contains("flutter")) {
                qb.sql.append(" AND (LOWER(tags) LIKE '%flutter%' OR LOWER(tags) LIKE '%react native%' OR LOWER(tags) LIKE '%mobile%' OR LOWER(tags) LIKE '%android%' OR LOWER(tags) LIKE '%ios%')");
            } else {
                qb.sql.append(" AND (LOWER(tags) LIKE ? OR LOWER(title) LIKE ?)");
                qb.params.add("%" + cat + "%");
                qb.params.add("%" + cat + "%");
            }
        }
        if (search != null && !search.isBlank()) {
            String term = "%" + search.toLowerCase().trim() + "%";
            qb.sql.append(" AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)");
            qb.params.add(term);
            qb.params.add(term);
            qb.params.add(term);
        }
        return qb;
    }

    public List<Question> getQuestions(UUID skillId, UUID topicId, String difficulty, String category, String search, int page, int size) {
        QueryBuilder qb = buildQuestionsQuery(skillId, topicId, difficulty, category, search);
        String sql = "SELECT id FROM questions " + qb.sql.toString() + " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        List<Object> queryParams = new java.util.ArrayList<>(qb.params);
        int limit = Math.max(1, Math.min(size, 500));
        int offset = Math.max(0, page) * limit;
        queryParams.add(limit);
        queryParams.add(offset);

        List<String> ids = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("id"), queryParams.toArray());
        if (ids.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<UUID> uuids = ids.stream().map(UUID::fromString).toList();
        List<Question> questions = questionRepository.findAllById(uuids);
        java.util.Map<UUID, Question> qMap = questions.stream().collect(java.util.stream.Collectors.toMap(Question::getId, q -> q));
        List<Question> ordered = new java.util.ArrayList<>();
        for (UUID u : uuids) {
            Question q = qMap.get(u);
            if (q != null) ordered.add(q);
        }
        populateOptions(ordered);
        return ordered;
    }

    public List<Question> getQuestions(UUID skillId, UUID topicId, String difficulty, int page, int size) {
        return getQuestions(skillId, topicId, difficulty, null, null, page, size);
    }

    public long getQuestionsCount(UUID skillId, UUID topicId, String difficulty, String category, String search) {
        QueryBuilder qb = buildQuestionsQuery(skillId, topicId, difficulty, category, search);
        String sql = "SELECT COUNT(*) FROM questions " + qb.sql.toString();
        Long count;
        if (qb.params.isEmpty()) {
            count = jdbcTemplate.queryForObject(sql, Long.class);
        } else {
            count = jdbcTemplate.queryForObject(sql, Long.class, qb.params.toArray());
        }
        return count != null ? count : 0L;
    }

    public java.util.Map<String, Long> getBankStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", questionRepository.countPublished());
        stats.put("easy", questionRepository.countPublishedByDifficultyIn(List.of("EASY", "BEGINNER")));
        stats.put("medium", questionRepository.countPublishedByDifficultyIn(List.of("MEDIUM", "INTERMEDIATE")));
        stats.put("hard", questionRepository.countPublishedByDifficultyIn(List.of("HARD", "ADVANCED", "EXPERT")));
        return stats;
    }

    public Question getQuestion(UUID questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        question.setOptions(optionRepository.findByQuestionIdOrderByDisplayOrder(question.getId()));
        return question;
    }

    private void populateOptions(List<Question> questions) {
        if (questions == null || questions.isEmpty()) return;
        List<UUID> qIds = questions.stream().map(Question::getId).toList();
        List<QuestionOption> allOptions = optionRepository.findByQuestionIdIn(qIds);
        java.util.Map<UUID, List<QuestionOption>> grouped = allOptions.stream()
                .collect(java.util.stream.Collectors.groupingBy(QuestionOption::getQuestionId));
        for (Question q : questions) {
            List<QuestionOption> opts = grouped.getOrDefault(q.getId(), java.util.Collections.emptyList());
            opts.sort(java.util.Comparator.comparingInt(QuestionOption::getDisplayOrder));
            q.setOptions(opts);
        }
    }

    @Transactional
    public StudentQuestionAttempt submitAnswer(UUID studentId, UUID questionId, String answer, Integer timeSpent) {
        Question question = getQuestion(questionId);

        List<StudentQuestionAttempt> previousAttempts = attemptRepository.findByStudentAndQuestion(studentId, questionId);
        int attemptNumber = previousAttempts.size() + 1;

        boolean isCorrect = evaluateAnswer(question, answer);

        StudentQuestionAttempt attempt = new StudentQuestionAttempt();
        attempt.setStudentId(studentId);
        attempt.setQuestionId(questionId);
        attempt.setAttemptNumber(attemptNumber);
        attempt.setUserAnswer(answer);
        attempt.setCorrect(isCorrect);
        attempt.setTimeSpentSeconds(timeSpent);
        attempt.setStatus("EVALUATED");
        attempt.setFeedback(isCorrect ? "Correct! Well done." : "Incorrect. Try again or check the hints.");

        if (isCorrect) {
            switch (question.getDifficulty() != null ? question.getDifficulty() : "EASY") {
                case "EASY" -> attempt.setScore(new BigDecimal("10"));
                case "MEDIUM" -> attempt.setScore(new BigDecimal("25"));
                case "HARD" -> attempt.setScore(new BigDecimal("50"));
                default -> attempt.setScore(new BigDecimal("10"));
            }
        } else {
            attempt.setScore(BigDecimal.ZERO);
        }

        StudentQuestionAttempt saved = attemptRepository.save(attempt);
        updateStats(studentId, question, isCorrect, timeSpent);

        if (isCorrect) {
            String ruleAction = switch (question.getDifficulty() != null ? question.getDifficulty() : "EASY") {
                case "HARD" -> "QUESTION_SOLVED_HARD";
                case "MEDIUM" -> "QUESTION_SOLVED_MEDIUM";
                default -> "QUESTION_SOLVED_EASY";
            };
            coinService.earnCoins(studentId, ruleAction, "QUESTION", questionId);
            if (attemptNumber == 1) {
                coinService.earnCoins(studentId, "FIRST_SOLVE", "QUESTION", questionId);
            }

            int xpAmount = switch (question.getDifficulty() != null ? question.getDifficulty() : "EASY") {
                case "HARD" -> 50;
                case "MEDIUM" -> 25;
                default -> 10;
            };
            if (question.getSkillId() != null) {
                skillXpService.earnXp(studentId, question.getSkillId(), xpAmount, "PRACTICE", saved.getId(), "Solved " + question.getDifficulty() + " question");
            }
        }

        return saved;
    }

    private boolean evaluateAnswer(Question question, String answer) {
        if (answer == null || answer.isBlank()) return false;
        String trimmed = answer.trim();

        List<QuestionOption> options = optionRepository.findByQuestionIdOrderByDisplayOrder(question.getId());
        if (!options.isEmpty()) {
            List<QuestionOption> correctOptions = options.stream().filter(QuestionOption::isCorrect).toList();
            if (correctOptions.size() > 1 || "MULTI_CHOICE".equalsIgnoreCase(question.getQuestionType()) || "MULTIPLE_SELECT".equalsIgnoreCase(question.getQuestionType())) {
                java.util.Set<String> correctLetters = new java.util.HashSet<>();
                java.util.Set<String> correctTexts = new java.util.HashSet<>();
                java.util.Set<String> correctIds = new java.util.HashSet<>();

                for (int i = 0; i < options.size(); i++) {
                    QuestionOption opt = options.get(i);
                    if (opt.isCorrect()) {
                        correctLetters.add(String.valueOf((char) ('A' + i)).toUpperCase());
                        correctTexts.add(opt.getOptionText().trim().toLowerCase());
                        correctIds.add(opt.getId().toString().toLowerCase());
                    }
                }

                String[] rawTokens = trimmed.replace("[", "").replace("]", "").replace("\"", "").split("[,;\\s]+");
                java.util.Set<String> userTokens = Arrays.stream(rawTokens)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toUpperCase)
                        .collect(java.util.stream.Collectors.toSet());

                java.util.Set<String> userTexts = Arrays.stream(trimmed.split("[,;]+"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toLowerCase)
                        .collect(java.util.stream.Collectors.toSet());

                if (!correctLetters.isEmpty() && userTokens.equals(correctLetters)) {
                    return true;
                }
                if (!correctTexts.isEmpty() && userTexts.equals(correctTexts)) {
                    return true;
                }
                if (!correctIds.isEmpty()) {
                    java.util.Set<String> userIds = Arrays.stream(rawTokens)
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .map(String::toLowerCase)
                            .collect(java.util.stream.Collectors.toSet());
                    if (userIds.equals(correctIds)) {
                        return true;
                    }
                }
            } else {
                for (int i = 0; i < options.size(); i++) {
                    QuestionOption opt = options.get(i);
                    if (opt.isCorrect()) {
                        if (trimmed.equalsIgnoreCase(opt.getId().toString())
                                || trimmed.equalsIgnoreCase(opt.getOptionText().trim())
                                || trimmed.equalsIgnoreCase(String.valueOf((char) ('A' + i)))
                                || trimmed.equalsIgnoreCase(String.valueOf(i))) {
                            return true;
                        }
                    }
                }
            }
        }

        String expected = question.getExpectedOutput() != null ? question.getExpectedOutput().trim() : "";
        if (expected.isEmpty()) {
            return false;
        }

        String evalMethod = question.getEvaluationMethod() != null ? question.getEvaluationMethod() : "EXACT_MATCH";
        return switch (evalMethod) {
            case "EXACT_MATCH" -> trimmed.equalsIgnoreCase(expected);
            case "FUZZY_MATCH" -> trimmed.toLowerCase().contains(expected.toLowerCase()) || expected.toLowerCase().contains(trimmed.toLowerCase());
            default -> trimmed.equalsIgnoreCase(expected);
        };
    }

    @Transactional
    void updateStats(UUID studentId, Question question, boolean isCorrect, Integer timeSpent) {
        StudentPracticeStats stats = statsRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    StudentPracticeStats s = new StudentPracticeStats();
                    s.setStudentId(studentId);
                    return s;
                });

        stats.setTotalAttempted(stats.getTotalAttempted() + 1);
        if (isCorrect) {
            stats.setTotalSolved(stats.getTotalSolved() + 1);
            switch (question.getDifficulty()) {
                case "EASY" -> stats.setEasySolved(stats.getEasySolved() + 1);
                case "MEDIUM" -> stats.setMediumSolved(stats.getMediumSolved() + 1);
                case "HARD" -> stats.setHardSolved(stats.getHardSolved() + 1);
            }
        }

        LocalDate today = LocalDate.now();
        if (stats.getLastPracticeDate() == null) {
            stats.setCurrentStreak(1);
        } else if (stats.getLastPracticeDate().plusDays(1).equals(today)) {
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
        } else if (!stats.getLastPracticeDate().equals(today)) {
            stats.setCurrentStreak(1);
        }
        stats.setLastPracticeDate(today);
        if (stats.getCurrentStreak() > stats.getLongestStreak()) {
            stats.setLongestStreak(stats.getCurrentStreak());
        }

        if (timeSpent != null) {
            stats.setTotalTimeSeconds(stats.getTotalTimeSeconds() + timeSpent);
        }

        statsRepository.save(stats);
    }

    public StudentPracticeStats getStats(UUID studentId) {
        return statsRepository.findByStudentId(studentId).orElse(null);
    }

    public List<StudentQuestionAttempt> getAttemptHistory(UUID studentId) {
        return attemptRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<StudentQuestionAttempt> getAttemptsForQuestion(UUID studentId, UUID questionId) {
        return attemptRepository.findByStudentAndQuestion(studentId, questionId);
    }
}

