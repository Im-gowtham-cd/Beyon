package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.InterviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, UUID> {
    List<InterviewSchedule> findByApplicationId(UUID applicationId);
    List<InterviewSchedule> findByInterviewerIdAndStatus(UUID interviewerId, String status);
}
