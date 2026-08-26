package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.CareerRoadmapItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CareerRoadmapItemRepository extends JpaRepository<CareerRoadmapItem, UUID> {
    List<CareerRoadmapItem> findByStudentIdAndCareerPathIdOrderBySortOrder(UUID studentId, UUID careerPathId);
    List<CareerRoadmapItem> findByStudentIdOrderBySortOrder(UUID studentId);
    long countByStudentIdAndCareerPathIdAndState(UUID studentId, UUID careerPathId, String state);
}
