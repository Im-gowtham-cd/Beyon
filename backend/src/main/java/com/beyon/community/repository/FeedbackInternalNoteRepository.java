package com.beyon.community.repository;

import com.beyon.community.model.FeedbackInternalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FeedbackInternalNoteRepository extends JpaRepository<FeedbackInternalNote, UUID> {
    List<FeedbackInternalNote> findByReportIdOrderByCreatedAtAsc(UUID reportId);
}
