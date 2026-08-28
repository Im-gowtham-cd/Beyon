package com.beyon.practice.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.practice.model.*;
import com.beyon.practice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PracticeService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final QuestionTestCaseRepository testCaseRepository;
    private final StudentQuestionAttemptRepository attemptRepository;
    private final StudentPracticeStatsRepository statsRepository;

    public PracticeService(QuestionRepository questionRepository,
                            QuestionOptionRepository optionRepository,
                            QuestionTestCaseRepository testCaseRepository,
                            StudentQuestionAttemptRepository attemptRepository,
                            StudentPracticeStatsRepository statsRepository) {
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.testCaseRepository = testCaseRepository;
        this.attemptRepository = attemptRepository;
        this.statsRepository = statsRepository;
    }

    public List<Question> getQuestions(UUID skillId, UUID topicId, String difficulty, int page, int size) {
        if (skillId != null && difficulty != null) {
            return questionRepository.findBySkillAndDifficulty(skillId, difficulty, org.springframework.data.domain.PageRequest.of(page, size));
        }
        if (skillId != null) {
            return questionRepository.findBySkillIdPublished(skillId, org.springframework.data.domain.PageRequest.of(page, size));
        }
        if (topicId != null) {
            return questionRepository.findByTopicIdPublished(topicId, org.springframework.data.domain.PageRequest.of(page, size));
        }
        if (difficulty != null) {
            return questionRepository.findByDifficultyPublished(difficulty, org.springframework.data.domain.PageRequest.of(page, size));
        }
        return questionRepository.findByStatusInOrderByCreatedAtDesc(List.of("PUBLISHED", "ACTIVE"), org.springframework.data.domain.PageRequest.of(page, size));
    }

    public Question getQuestion(UUID questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
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

        if (isCorrect) {
            switch (question.getDifficulty()) {
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
        return saved;
    }

    private boolean evaluateAnswer(Question question, String answer) {
        if (answer == null || answer.isBlank()) return false;
        String evalMethod = question.getEvaluationMethod();
        return switch (evalMethod) {
            case "EXACT_MATCH" -> answer.trim().equalsIgnoreCase(question.getExpectedOutput() != null ? question.getExpectedOutput().trim() : "");
            case "FUZZY_MATCH" -> answer.trim().toLowerCase().contains(question.getExpectedOutput() != null ? question.getExpectedOutput().trim().toLowerCase() : "");
            default -> answer.trim().equalsIgnoreCase(question.getExpectedOutput() != null ? question.getExpectedOutput().trim() : "");
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
