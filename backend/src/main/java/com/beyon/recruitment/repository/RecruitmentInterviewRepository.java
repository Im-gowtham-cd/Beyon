package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.RecruitmentInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RecruitmentInterviewRepository extends JpaRepository<RecruitmentInterview, UUID> {
    List<RecruitmentInterview> findByDriveIdOrderByRoundNumber(UUID driveId);
    List<RecruitmentInterview> findByStudentIdOrderByScheduledAtDesc(UUID studentId);
    List<RecruitmentInterview> findByPipelineIdOrderByRoundNumber(UUID pipelineId);
    List<RecruitmentInterview> findByInterviewerIdAndStatus(UUID interviewerId, String status);
}
