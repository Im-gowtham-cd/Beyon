package com.beyon.recruitment.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.notification.service.NotificationService;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import com.beyon.recruitment.model.RecruitmentApplication;
import com.beyon.recruitment.model.RecruitmentStatusHistory;
import com.beyon.recruitment.repository.RecruitmentApplicationRepository;
import com.beyon.recruitment.repository.RecruitmentStatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class RecruitmentService {

    private final RecruitmentApplicationRepository applicationRepository;
    private final RecruitmentStatusHistoryRepository historyRepository;
    private final CompanyOpportunityRepository opportunityRepository;
    private final NotificationService notificationService;

    public RecruitmentService(RecruitmentApplicationRepository applicationRepository,
                              RecruitmentStatusHistoryRepository historyRepository,
                              CompanyOpportunityRepository opportunityRepository,
                              NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.opportunityRepository = opportunityRepository;
        this.notificationService = notificationService;
    }

    public List<RecruitmentApplication> getStudentApplications(UUID studentId) {
        return applicationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<RecruitmentApplication> getOpportunityApplications(UUID opportunityId) {
        return applicationRepository.findByOpportunityId(opportunityId);
    }

    public List<RecruitmentApplication> getDriveApplications(UUID driveId) {
        return applicationRepository.findByDriveId(driveId);
    }

    public List<RecruitmentApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Transactional
    public RecruitmentApplication updateStatus(UUID applicationId, String newStatus, UUID changedBy, String notes) {
        RecruitmentApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        String oldStatus = app.getStatus();
        app.setStatus(newStatus);

        RecruitmentStatusHistory history = new RecruitmentStatusHistory();
        history.setApplicationId(applicationId);
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        history.setChangedBy(changedBy);
        history.setNotes(notes);
        historyRepository.save(history);

        CompanyOpportunity opp = opportunityRepository.findById(app.getOpportunityId()).orElse(null);
        if (opp != null) {
            notificationService.send(app.getStudentId(),
                    "Application Status Updated",
                    "Your application for " + opp.getTitle() + " is now: " + newStatus,
                    "APPLICATION_STATUS", "RECRUITMENT_APPLICATION", applicationId);
        }

        return applicationRepository.save(app);
    }

    @Transactional
    public RecruitmentApplication withdraw(UUID studentId, UUID applicationId) {
        RecruitmentApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!app.getStudentId().equals(studentId)) {
            throw new ConflictException("Not your application");
        }
        return updateStatus(applicationId, "WITHDRAWN", studentId, "Student withdrew application");
    }

    public Map<String, Long> getPipelineStats(UUID opportunityId) {
        Map<String, Long> stats = new HashMap<>();
        for (String status : List.of("ELIGIBLE","APPLIED","ASSESSMENT_PENDING","ASSESSMENT_COMPLETED","SHORTLISTED","INTERVIEW","SELECTED","REJECTED")) {
            stats.put(status, applicationRepository.countByOpportunityIdAndStatus(opportunityId, status));
        }
        return stats;
    }

    public List<RecruitmentStatusHistory> getStatusHistory(UUID applicationId) {
        return historyRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId);
    }
}
