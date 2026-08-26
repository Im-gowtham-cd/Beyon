package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.CareerPathSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CareerPathSkillRepository extends JpaRepository<CareerPathSkill, UUID> {
    List<CareerPathSkill> findByCareerPathIdOrderBySortOrder(UUID careerPathId);
    List<CareerPathSkill> findByCareerPathIdAndRequiredTrue(UUID careerPathId);
}
