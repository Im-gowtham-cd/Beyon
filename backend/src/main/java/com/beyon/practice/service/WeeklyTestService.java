package com.beyon.practice.service;

import com.beyon.practice.model.WeeklyTest;
import com.beyon.practice.model.WeeklyTestAttempt;
import com.beyon.practice.repository.TestRepository;
import com.beyon.practice.repository.TestAttemptRepository;
import com.beyon.practice.repository.WeeklyTestRepository;
import com.beyon.practice.repository.WeeklyTestAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class WeeklyTestService {

    private final TestRepository testRepo;
    private final TestAttemptRepository attemptRepo;
    private final CoinService coinService;
    private final SkillXpService skillXpService;
    private final StreakService streakService;

    public WeeklyTestService(TestRepository testRepo, TestAttemptRepository attemptRepo,
                              CoinService coinService, SkillXpService skillXpService,
                              StreakService streakService) {
        this.testRepo = testRepo;
        this.attemptRepo = attemptRepo;
        this.coinService = coinService;
        this.skillXpService = skillXpService;
        this.streakService = streakService;
    }

    public List<Map<String, Object>> getRecentTests() {
        List<com.beyon.practice.model.Test> tests = testRepo.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> list = new ArrayList<>();
        for (com.beyon.practice.model.Test t : tests) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", t.getId());
            map.put("title", t.getTitle());
            map.put("description", t.getDescription());
            map.put("durationMinutes", t.getDurationMinutes());
            map.put("totalQuestions", t.getTotalQuestions());
            map.put("passingMarks", t.getPassingScore() != null ? t.getPassingScore().intValue() : 60);
            map.put("totalMarks", 100);
            map.put("coinReward", 100);
            map.put("xpReward", 250);
            map.put("status", t.getStatus() != null ? t.getStatus() : "PUBLISHED");
            list.add(map);
        }
        return list;
    }

    public com.beyon.practice.model.Test getTest(UUID testId) {
        return testRepo.findById(testId).orElseThrow(() -> new RuntimeException("Assessment test not found"));
    }

    public Map<String, Object> startTest(UUID studentId, UUID testId) {
        com.beyon.practice.model.Test test = getTest(testId);
        com.beyon.practice.model.TestAttempt attempt = attemptRepo.findByStudentIdAndTestId(studentId, testId)
                .orElseGet(() -> {
                    com.beyon.practice.model.TestAttempt a = new com.beyon.practice.model.TestAttempt();
                    a.setStudentId(studentId);
                    a.setTestId(testId);
                    a.setStatus("IN_PROGRESS");
                    return a;
                });
        attempt.setStartedAt(java.time.Instant.now());
        attemptRepo.save(attempt);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("attempt", attempt);
        result.put("test", test);
        return result;
    }

    @Transactional
    public com.beyon.practice.model.TestAttempt submitTest(UUID studentId, UUID testId, int correctAnswers, int timeTakenSeconds) {
        com.beyon.practice.model.Test test = getTest(testId);
        com.beyon.practice.model.TestAttempt attempt = attemptRepo.findByStudentIdAndTestId(studentId, testId)
                .orElseGet(() -> {
                    com.beyon.practice.model.TestAttempt a = new com.beyon.practice.model.TestAttempt();
                    a.setStudentId(studentId);
                    a.setTestId(testId);
                    return a;
                });
        attempt.setStatus("COMPLETED");
        attempt.setSubmittedAt(java.time.Instant.now());
        attempt.setTimeSpentSeconds(timeTakenSeconds);
        attempt.setScore(BigDecimal.valueOf(correctAnswers));
        attempt.setAccuracy(BigDecimal.valueOf(correctAnswers));
        com.beyon.practice.model.TestAttempt saved = attemptRepo.save(attempt);

        // Award rewards
        coinService.earnCoins(studentId, "WEEKEND_TEST_COMPLETED", "TEST", testId);
        streakService.recordActivity(studentId);

        return saved;
    }

    public List<Map<String, Object>> getLeaderboard(UUID testId) {
        List<com.beyon.practice.model.TestAttempt> attempts = attemptRepo.findByTestIdOrderByScoreDesc(testId);
        List<Map<String, Object>> board = new ArrayList<>();
        int rank = 1;
        for (com.beyon.practice.model.TestAttempt a : attempts) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rank", rank++);
            entry.put("studentId", a.getStudentId());
            entry.put("score", a.getScore());
            entry.put("accuracy", a.getAccuracy());
            entry.put("timeTaken", a.getTimeSpentSeconds());
            board.add(entry);
        }
        return board;
    }

    public Map<String, Object> getStudentHistory(UUID studentId) {
        List<com.beyon.practice.model.TestAttempt> attempts = attemptRepo.findByStudentIdOrderByStartedAtDesc(studentId);
        int totalPassed = 0;
        int totalXp = 0;
        for (com.beyon.practice.model.TestAttempt a : attempts) {
            if ("COMPLETED".equals(a.getStatus()) && a.getScore() != null && a.getScore().compareTo(BigDecimal.valueOf(50)) >= 0) {
                totalPassed++;
            }
            if (a.getScore() != null) {
                totalXp += a.getScore().intValue() * 2;
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("attempts", attempts);
        result.put("totalAttempts", attempts.size());
        result.put("totalPassed", totalPassed);
        result.put("totalXpEarned", totalXp);
        return result;
    }
}
