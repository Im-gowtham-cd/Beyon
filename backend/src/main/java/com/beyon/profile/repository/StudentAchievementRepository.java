package com.beyon.profile.repository;

import com.beyon.profile.model.StudentAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentAchievementRepository extends JpaRepository<StudentAchievement, UUID> {
    List<StudentAchievement> findByUserIdOrderByAchievementDateDesc(UUID userId);
}
