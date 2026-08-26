package com.beyon.practice.repository;

import com.beyon.practice.model.StudentAchievementBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentAchievementBadgeRepository extends JpaRepository<StudentAchievementBadge, UUID> {
    List<StudentAchievementBadge> findByStudentIdOrderByEarnedAtDesc(UUID studentId);
    Optional<StudentAchievementBadge> findByStudentIdAndAchievementKey(UUID studentId, String achievementKey);
    boolean existsByStudentIdAndAchievementKey(UUID studentId, String achievementKey);
}
