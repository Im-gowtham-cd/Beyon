package com.beyon.community.repository;

import com.beyon.community.model.FeedbackStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FeedbackStatusHistoryRepository extends JpaRepository<FeedbackStatusHistory, UUID> {
    List<FeedbackStatusHistory> findByReportIdOrderByCreatedAtAsc(UUID reportId);
}
