package com.beyon.recruitment.service;

import com.beyon.recruitment.model.RecruitmentInterview;
import com.beyon.recruitment.repository.RecruitmentInterviewRepository;
import com.beyon.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class InterviewService {

    private final RecruitmentInterviewRepository interviewRepo;
    private final NotificationService notificationService;

    public InterviewService(RecruitmentInterviewRepository interviewRepo,
                             NotificationService notificationService) {
        this.interviewRepo = interviewRepo;
        this.notificationService = notificationService;
    }

    public RecruitmentInterview scheduleInterview(RecruitmentInterview interview) {
        RecruitmentInterview saved = interviewRepo.save(interview);
        notificationService.send(interview.getStudentId(),
            "Interview Scheduled",
            "You have a " + interview.getInterviewType() + " interview scheduled.",
            "INTERVIEW_SCHEDULED", "RECRUITMENT", saved.getId());
        return saved;
    }

    public List<RecruitmentInterview> getDriveInterviews(UUID driveId) {
        return interviewRepo.findByDriveIdOrderByRoundNumber(driveId);
    }

    public List<RecruitmentInterview> getMyInterviews(UUID studentId) {
        return interviewRepo.findByStudentIdOrderByScheduledAtDesc(studentId);
    }

    public List<RecruitmentInterview> getPipelineInterviews(UUID pipelineId) {
        return interviewRepo.findByPipelineIdOrderByRoundNumber(pipelineId);
    }

    public RecruitmentInterview submitFeedback(UUID interviewId, String feedback, BigDecimal score, String recommendation) {
        RecruitmentInterview interview = interviewRepo.findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setFeedback(feedback);
        interview.setScore(score);
        interview.setRecommendation(recommendation);
        interview.setStatus("COMPLETED");
        interview.setUpdatedAt(OffsetDateTime.now());
        return interviewRepo.save(interview);
    }

    public RecruitmentInterview reschedule(UUID interviewId, OffsetDateTime newTime) {
        RecruitmentInterview interview = interviewRepo.findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setScheduledAt(newTime);
        interview.setStatus("RESCHEDULED");
        interview.setUpdatedAt(OffsetDateTime.now());
        RecruitmentInterview saved = interviewRepo.save(interview);
        notificationService.send(interview.getStudentId(),
            "Interview Rescheduled",
            "Your interview has been rescheduled.",
            "INTERVIEW_RESCHEDULED", "RECRUITMENT", saved.getId());
        return saved;
    }

    public RecruitmentInterview cancel(UUID interviewId) {
        RecruitmentInterview interview = interviewRepo.findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setStatus("CANCELLED");
        interview.setUpdatedAt(OffsetDateTime.now());
        return interviewRepo.save(interview);
    }

    public Map<String, Object> getUpcoming(UUID studentId) {
        List<RecruitmentInterview> upcoming = interviewRepo.findByStudentIdOrderByScheduledAtDesc(studentId)
            .stream()
            .filter(i -> "SCHEDULED".equals(i.getStatus()) || "RESCHEDULED".equals(i.getStatus()))
            .limit(10)
            .toList();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("upcoming", upcoming);
        result.put("count", upcoming.size());
        return result;
    }
}
