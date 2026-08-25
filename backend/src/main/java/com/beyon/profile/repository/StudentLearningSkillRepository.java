package com.beyon.profile.repository;

import com.beyon.profile.model.StudentLearningSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentLearningSkillRepository extends JpaRepository<StudentLearningSkill, UUID> {
    List<StudentLearningSkill> findByUserIdOrderByCreatedAtDesc(UUID userId);
    boolean existsByUserIdAndSkillNameIgnoreCase(UUID userId, String skillName);
}
