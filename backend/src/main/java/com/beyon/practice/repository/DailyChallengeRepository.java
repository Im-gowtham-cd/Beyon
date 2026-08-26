package com.beyon.practice.repository;

import com.beyon.practice.model.DailyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, UUID> {
    Optional<DailyChallenge> findByStudentIdAndChallengeDate(UUID studentId, LocalDate date);
    List<DailyChallenge> findByStudentIdOrderByChallengeDateDesc(UUID studentId);
    long countByStudentIdAndStatus(UUID studentId, String status);
}
