package com.beyon.practice.repository;

import com.beyon.practice.model.StudentPracticeStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentPracticeStatsRepository extends JpaRepository<StudentPracticeStats, UUID> {
    Optional<StudentPracticeStats> findByStudentId(UUID studentId);
}
