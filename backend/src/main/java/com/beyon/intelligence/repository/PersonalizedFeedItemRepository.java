package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.PersonalizedFeedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PersonalizedFeedItemRepository extends JpaRepository<PersonalizedFeedItem, UUID> {
    List<PersonalizedFeedItem> findByStudentIdAndDismissedFalseOrderByRelevanceScoreDescCreatedAtDesc(UUID studentId);
    long countByStudentIdAndDismissedFalse(UUID studentId);
}
