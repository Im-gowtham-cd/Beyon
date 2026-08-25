package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.StudentSkillIntelligence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentSkillIntelligenceRepository extends JpaRepository<StudentSkillIntelligence, UUID> {
    List<StudentSkillIntelligence> findByStudentIdOrderByConfidenceScoreDesc(UUID studentId);
    Optional<StudentSkillIntelligence> findByStudentIdAndSkillId(UUID studentId, UUID skillId);
    List<StudentSkillIntelligence> findByStudentIdAndProficiencyLevel(UUID studentId, String level);
}
