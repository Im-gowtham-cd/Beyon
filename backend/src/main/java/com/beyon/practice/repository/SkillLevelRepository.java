package com.beyon.practice.repository;

import com.beyon.practice.model.SkillLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillLevelRepository extends JpaRepository<SkillLevel, UUID> {
    List<SkillLevel> findByStudentIdOrderByTotalXpDesc(UUID studentId);
    Optional<SkillLevel> findByStudentIdAndSkillId(UUID studentId, UUID skillId);
}
