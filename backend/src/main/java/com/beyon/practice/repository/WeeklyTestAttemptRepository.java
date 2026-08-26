package com.beyon.practice.repository;

import com.beyon.practice.model.WeeklyTestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeeklyTestAttemptRepository extends JpaRepository<WeeklyTestAttempt, UUID> {
    List<WeeklyTestAttempt> findByStudentIdOrderByStartedAtDesc(UUID studentId);
    Optional<WeeklyTestAttempt> findByStudentIdAndWeeklyTestId(UUID studentId, UUID weeklyTestId);
    List<WeeklyTestAttempt> findByWeeklyTestIdOrderByScoreDesc(UUID weeklyTestId);
}
