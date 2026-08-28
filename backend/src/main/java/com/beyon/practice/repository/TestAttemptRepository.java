package com.beyon.practice.repository;

import com.beyon.practice.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, UUID> {
    List<TestAttempt> findByStudentIdOrderByStartedAtDesc(UUID studentId);
    List<TestAttempt> findByTestIdOrderByScoreDesc(UUID testId);
    Optional<TestAttempt> findByStudentIdAndTestId(UUID studentId, UUID testId);
}
