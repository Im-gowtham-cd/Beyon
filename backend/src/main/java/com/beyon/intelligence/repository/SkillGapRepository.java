package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.SkillGap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SkillGapRepository extends JpaRepository<SkillGap, UUID> {
    List<SkillGap> findByStudentIdAndCareerPathIdOrderByGapSeverityDesc(UUID studentId, UUID careerPathId);
    List<SkillGap> findByStudentIdAndOpportunityIdOrderByGapSeverityDesc(UUID studentId, UUID opportunityId);
    List<SkillGap> findByStudentIdOrderByGapSeverityDesc(UUID studentId);
}
