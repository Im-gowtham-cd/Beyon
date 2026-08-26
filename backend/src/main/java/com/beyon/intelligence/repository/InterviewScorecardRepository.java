package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.InterviewScorecard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewScorecardRepository extends JpaRepository<InterviewScorecard, UUID> {
    List<InterviewScorecard> findByScheduleId(UUID scheduleId);
    Optional<InterviewScorecard> findByScheduleIdAndInterviewerId(UUID scheduleId, UUID interviewerId);
}
