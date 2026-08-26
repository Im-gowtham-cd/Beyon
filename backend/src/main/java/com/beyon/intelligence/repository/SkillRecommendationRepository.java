package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.SkillRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SkillRecommendationRepository extends JpaRepository<SkillRecommendation, UUID> {
    List<SkillRecommendation> findByStudentIdOrderByScoreDesc(UUID studentId);
    List<SkillRecommendation> findByStudentIdAndStatusOrderByScoreDesc(UUID studentId, String status);
    long countByStudentIdAndStatus(UUID studentId, String status);
}
