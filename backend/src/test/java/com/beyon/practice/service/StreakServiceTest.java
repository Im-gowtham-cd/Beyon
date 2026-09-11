package com.beyon.practice.service;

import com.beyon.practice.model.StudentAchievementBadge;
import com.beyon.practice.model.StudentStreak;
import com.beyon.practice.repository.StudentAchievementBadgeRepository;
import com.beyon.practice.repository.StudentStreakRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StreakServiceTest {

    private StudentStreakRepository streakRepository;
    private StudentAchievementBadgeRepository badgeRepository;
    private CoinService coinService;

    private StreakService streakService;

    @BeforeEach
    void setUp() {
        streakRepository = mock(StudentStreakRepository.class);
        badgeRepository = mock(StudentAchievementBadgeRepository.class);
        coinService = mock(CoinService.class);

        streakService = new StreakService(streakRepository, badgeRepository, coinService);
    }

    @Test
    @DisplayName("recordActivity for first-time user initializes streak to 1")
    void testRecordActivityFirstTime() {
        UUID studentId = UUID.randomUUID();

        when(streakRepository.findByStudentId(studentId)).thenReturn(Optional.empty());
        when(streakRepository.save(any(StudentStreak.class))).thenAnswer(inv -> inv.getArgument(0));

        StudentStreak streak = streakService.recordActivity(studentId);

        assertNotNull(streak);
        assertEquals(1, streak.getCurrentStreak());
        assertEquals(1, streak.getLongestStreak());
        assertEquals(LocalDate.now(), streak.getLastActivityDate());
        verify(streakRepository).save(any(StudentStreak.class));
    }

    @Test
    @DisplayName("recordActivity on consecutive day increments streak count")
    void testRecordActivityConsecutiveDay() {
        UUID studentId = UUID.randomUUID();

        StudentStreak existing = new StudentStreak();
        existing.setStudentId(studentId);
        existing.setCurrentStreak(3);
        existing.setLongestStreak(3);
        existing.setLastActivityDate(LocalDate.now().minusDays(1));

        when(streakRepository.findByStudentId(studentId)).thenReturn(Optional.of(existing));
        when(streakRepository.save(any(StudentStreak.class))).thenAnswer(inv -> inv.getArgument(0));

        StudentStreak updated = streakService.recordActivity(studentId);

        assertEquals(4, updated.getCurrentStreak());
        assertEquals(4, updated.getLongestStreak());
        assertEquals(LocalDate.now(), updated.getLastActivityDate());
    }

    @Test
    @DisplayName("recordActivity after a missed day resets streak count to 1")
    void testRecordActivityBrokenStreak() {
        UUID studentId = UUID.randomUUID();

        StudentStreak existing = new StudentStreak();
        existing.setStudentId(studentId);
        existing.setCurrentStreak(5);
        existing.setLongestStreak(10);
        existing.setLastActivityDate(LocalDate.now().minusDays(3)); // Missed 3 days

        when(streakRepository.findByStudentId(studentId)).thenReturn(Optional.of(existing));
        when(streakRepository.save(any(StudentStreak.class))).thenAnswer(inv -> inv.getArgument(0));

        StudentStreak updated = streakService.recordActivity(studentId);

        assertEquals(1, updated.getCurrentStreak());
        assertEquals(10, updated.getLongestStreak()); // Longest remains intact
    }

    @Test
    @DisplayName("recordActivity hitting 7-day milestone awards 7_DAY_STREAK badge and coins")
    void testAwardMilestoneBadge() {
        UUID studentId = UUID.randomUUID();

        StudentStreak existing = new StudentStreak();
        existing.setStudentId(studentId);
        existing.setCurrentStreak(6);
        existing.setLongestStreak(6);
        existing.setLastActivityDate(LocalDate.now().minusDays(1));

        when(streakRepository.findByStudentId(studentId)).thenReturn(Optional.of(existing));
        when(streakRepository.save(any(StudentStreak.class))).thenAnswer(inv -> inv.getArgument(0));
        when(badgeRepository.existsByStudentIdAndAchievementKey(studentId, "7_DAY_STREAK")).thenReturn(false);

        UUID badgeId = UUID.randomUUID();
        when(badgeRepository.save(any(StudentAchievementBadge.class))).thenAnswer(inv -> {
            StudentAchievementBadge b = inv.getArgument(0);
            b.setId(badgeId);
            return b;
        });

        StudentStreak updated = streakService.recordActivity(studentId);

        assertEquals(7, updated.getCurrentStreak());

        ArgumentCaptor<StudentAchievementBadge> badgeCaptor = ArgumentCaptor.forClass(StudentAchievementBadge.class);
        verify(badgeRepository).save(badgeCaptor.capture());
        assertEquals("7_DAY_STREAK", badgeCaptor.getValue().getAchievementKey());
        verify(coinService).earnCoins(eq(studentId), eq("7_DAY_STREAK"), eq("BADGE"), eq(badgeId));
    }

    @Test
    @DisplayName("getStreak resets current streak to 0 if user missed yesterday")
    void testGetStreakInactiveReset() {
        UUID studentId = UUID.randomUUID();

        StudentStreak existing = new StudentStreak();
        existing.setStudentId(studentId);
        existing.setCurrentStreak(4);
        existing.setLongestStreak(10);
        existing.setLastActivityDate(LocalDate.now().minusDays(2)); // Missed yesterday

        when(streakRepository.findByStudentId(studentId)).thenReturn(Optional.of(existing));

        StudentStreak result = streakService.getStreak(studentId);

        assertEquals(0, result.getCurrentStreak());
        assertEquals(10, result.getLongestStreak());
        verify(streakRepository).save(existing);
    }
}
