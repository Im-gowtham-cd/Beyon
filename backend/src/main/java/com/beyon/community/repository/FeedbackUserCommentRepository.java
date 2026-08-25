package com.beyon.community.repository;

import com.beyon.community.model.FeedbackUserComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FeedbackUserCommentRepository extends JpaRepository<FeedbackUserComment, UUID> {
    List<FeedbackUserComment> findByReportIdOrderByCreatedAtAsc(UUID reportId);
}
