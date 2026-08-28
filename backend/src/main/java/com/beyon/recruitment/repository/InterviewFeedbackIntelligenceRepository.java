package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.InterviewFeedbackIntelligence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewFeedbackIntelligenceRepository extends JpaRepository<InterviewFeedbackIntelligence, UUID> {
    List<InterviewFeedbackIntelligence> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    Optional<InterviewFeedbackIntelligence> findByInterviewId(UUID interviewId);
    List<InterviewFeedbackIntelligence> findByStudentIdAndIsCandidateVisibleTrue(UUID studentId);
}
