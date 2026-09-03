package com.beyon.practice.service;

import com.beyon.practice.model.StudentAchievementBadge;
import com.beyon.practice.model.StudentStreak;
import com.beyon.practice.repository.StudentAchievementBadgeRepository;
import com.beyon.practice.repository.StudentStreakRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class StreakService {

    private final StudentStreakRepository streakRepository;
    private final StudentAchievementBadgeRepository badgeRepository;
    private final CoinService coinService;

    public StreakService(StudentStreakRepository streakRepository,
                         StudentAchievementBadgeRepository badgeRepository,
                         CoinService coinService) {
        this.streakRepository = streakRepository;
        this.badgeRepository = badgeRepository;
        this.coinService = coinService;
    }

    @Transactional
    public StudentStreak recordActivity(UUID studentId) {
        StudentStreak streak = streakRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    StudentStreak s = new StudentStreak();
                    s.setStudentId(studentId);
                    return s;
                });

        LocalDate today = LocalDate.now();
        if (streak.getLastActivityDate() == null) {
            streak.setCurrentStreak(1);
        } else if (streak.getLastActivityDate().plusDays(1).equals(today)) {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else if (!streak.getLastActivityDate().equals(today)) {
            streak.setCurrentStreak(1);
        }
        streak.setLastActivityDate(today);
        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }

        StudentStreak saved = streakRepository.save(streak);
        checkAchievements(studentId, saved);
        return saved;
    }

    void checkAchievements(UUID studentId, StudentStreak streak) {
        checkAndAward(studentId, "7_DAY_STREAK", "7-Day Streak", "Maintained a 7-day practice streak", "🔥", streak.getCurrentStreak() >= 7);
        checkAndAward(studentId, "30_DAY_STREAK", "30-Day Streak", "Maintained a 30-day practice streak", "🔥", streak.getCurrentStreak() >= 30);
    }

    void checkAndAward(UUID studentId, String key, String name, String desc, String icon, boolean condition) {
        if (condition && !badgeRepository.existsByStudentIdAndAchievementKey(studentId, key)) {
            StudentAchievementBadge badge = new StudentAchievementBadge();
            badge.setStudentId(studentId);
            badge.setAchievementKey(key);
            badge.setAchievementName(name);
            badge.setDescription(desc);
            badge.setBadgeIcon(icon);
            StudentAchievementBadge savedBadge = badgeRepository.save(badge);
            coinService.earnCoins(studentId, key, "BADGE", savedBadge.getId());
        }
    }

    public StudentStreak getStreak(UUID studentId) {
        return streakRepository.findByStudentId(studentId).orElse(null);
    }

    public List<StudentAchievementBadge> getBadges(UUID studentId) {
        return badgeRepository.findByStudentIdOrderByEarnedAtDesc(studentId);
    }
}
