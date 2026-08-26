package com.beyon.practice.service;

import com.beyon.practice.model.WeeklyTest;
import com.beyon.practice.model.WeeklyTestAttempt;
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

    private final WeeklyTestRepository testRepo;
    private final WeeklyTestAttemptRepository attemptRepo;
    private final CoinService coinService;
    private final SkillXpService skillXpService;

    public WeeklyTestService(WeeklyTestRepository testRepo, WeeklyTestAttemptRepository attemptRepo,
                              CoinService coinService, SkillXpService skillXpService) {
        this.testRepo = testRepo;
        this.attemptRepo = attemptRepo;
        this.coinService = coinService;
        this.skillXpService = skillXpService;
    }

    public List<WeeklyTest> getRecentTests() {
        return testRepo.findTop5ByOrderByCreatedAtDesc();
    }

    public WeeklyTest getTest(UUID testId) {
        return testRepo.findById(testId).orElseThrow(() -> new RuntimeException("Weekly test not found"));
    }

    public Map<String, Object> startTest(UUID studentId, UUID testId) {
        WeeklyTest test = getTest(testId);
        if (attemptRepo.findByStudentIdAndWeeklyTestId(studentId, testId).isPresent()) {
            throw new RuntimeException("Already attempted this test");
        }
        WeeklyTestAttempt attempt = new WeeklyTestAttempt();
        attempt.setStudentId(studentId);
        attempt.setWeeklyTestId(testId);
        attempt.setTotalQuestions(test.getTotalQuestions());
        attemptRepo.save(attempt);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("attempt", attempt);
        result.put("test", test);
        return result;
    }

    @Transactional
    public WeeklyTestAttempt submitTest(UUID studentId, UUID testId, int correctAnswers, int timeTakenSeconds) {
        WeeklyTest test = getTest(testId);
        WeeklyTestAttempt attempt = attemptRepo.findByStudentIdAndWeeklyTestId(studentId, testId)
                .orElseThrow(() -> new RuntimeException("No attempt found"));
        attempt.setCorrectAnswers(correctAnswers);
        attempt.setScore(correctAnswers);
        attempt.setTimeTakenSeconds(timeTakenSeconds);
        attempt.setStatus("COMPLETED");
        attempt.setCompletedAt(OffsetDateTime.now());
        boolean passed = correctAnswers >= test.getPassingScore();
        if (passed) {
            attempt.setCoinsEarned(test.getCoinReward());
            attempt.setXpEarned(test.getXpReward());
            coinService.earnCoins(studentId, "WEEKEND_TEST_PASSED", "WEEKEND_TEST", testId);
        }
        List<WeeklyTestAttempt> allAttempts = attemptRepo.findByWeeklyTestIdOrderByScoreDesc(testId);
        int rank = allAttempts.indexOf(attempt) + 1;
        attempt.setPercentile(BigDecimal.valueOf(rank)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(allAttempts.size()), 1, RoundingMode.HALF_UP));
        return attemptRepo.save(attempt);
    }

    public List<Map<String, Object>> getLeaderboard(UUID testId) {
        List<WeeklyTestAttempt> attempts = attemptRepo.findByWeeklyTestIdOrderByScoreDesc(testId);
        List<Map<String, Object>> board = new ArrayList<>();
        int rank = 1;
        for (WeeklyTestAttempt a : attempts) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rank", rank++);
            entry.put("studentId", a.getStudentId());
            entry.put("score", a.getScore());
            entry.put("correctAnswers", a.getCorrectAnswers());
            entry.put("timeTaken", a.getTimeTakenSeconds());
            entry.put("percentile", a.getPercentile());
            board.add(entry);
        }
        return board;
    }

    public Map<String, Object> getStudentHistory(UUID studentId) {
        List<WeeklyTestAttempt> attempts = attemptRepo.findByStudentIdOrderByStartedAtDesc(studentId);
        int totalPassed = 0;
        int totalXp = 0;
        for (WeeklyTestAttempt a : attempts) {
            if ("COMPLETED".equals(a.getStatus()) && a.getCorrectAnswers() >= 40) totalPassed++;
            totalXp += a.getXpEarned();
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("attempts", attempts);
        result.put("totalAttempts", attempts.size());
        result.put("totalPassed", totalPassed);
        result.put("totalXpEarned", totalXp);
        return result;
    }
}
