package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.AssessmentSkillScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AssessmentSkillScoreRepository extends JpaRepository<AssessmentSkillScore, UUID> {
    List<AssessmentSkillScore> findBySessionId(UUID sessionId);
    List<AssessmentSkillScore> findByStudentIdAndSkillIdOrderByCreatedAtDesc(UUID studentId, UUID skillId);
    List<AssessmentSkillScore> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
