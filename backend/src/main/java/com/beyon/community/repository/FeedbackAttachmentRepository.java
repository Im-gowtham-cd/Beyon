package com.beyon.community.repository;

import com.beyon.community.model.FeedbackAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FeedbackAttachmentRepository extends JpaRepository<FeedbackAttachment, UUID> {
    List<FeedbackAttachment> findByReportIdOrderByCreatedAt(UUID reportId);
}
