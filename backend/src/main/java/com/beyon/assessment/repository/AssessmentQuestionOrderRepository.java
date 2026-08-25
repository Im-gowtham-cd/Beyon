package com.beyon.assessment.repository;

import com.beyon.assessment.model.AssessmentQuestionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AssessmentQuestionOrderRepository extends JpaRepository<AssessmentQuestionOrder, UUID> {
    List<AssessmentQuestionOrder> findBySessionIdOrderBySortOrder(UUID sessionId);
    void deleteBySessionId(UUID sessionId);
}
