package com.beyon.community.repository;

import com.beyon.community.model.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserFeedbackRepository extends JpaRepository<UserFeedback, UUID> {
    List<UserFeedback> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<UserFeedback> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatus(String status);
}
