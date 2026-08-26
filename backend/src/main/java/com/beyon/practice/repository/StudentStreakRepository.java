package com.beyon.practice.repository;

import com.beyon.practice.model.StudentStreak;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentStreakRepository extends JpaRepository<StudentStreak, UUID> {
    Optional<StudentStreak> findByStudentId(UUID studentId);
}
