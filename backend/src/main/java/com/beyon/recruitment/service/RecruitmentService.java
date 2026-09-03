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
    private final com.beyon.identity.repository.UserRepository userRepository;
    private final com.beyon.profile.repository.StudentProfileRepository studentProfileRepository;
    private final com.beyon.assessment.repository.AssessmentResultRepository assessmentResultRepository;

    public RecruitmentService(RecruitmentApplicationRepository applicationRepository,
                              RecruitmentStatusHistoryRepository historyRepository,
                              CompanyOpportunityRepository opportunityRepository,
                              NotificationService notificationService,
                              com.beyon.identity.repository.UserRepository userRepository,
                              com.beyon.profile.repository.StudentProfileRepository studentProfileRepository,
                              com.beyon.assessment.repository.AssessmentResultRepository assessmentResultRepository) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.opportunityRepository = opportunityRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.assessmentResultRepository = assessmentResultRepository;
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

    public List<Map<String, Object>> getEnrichedApplications(UUID userId, String role) {
        List<RecruitmentApplication> apps;
        if ("COMPANY".equalsIgnoreCase(role)) {
            List<CompanyOpportunity> opps = opportunityRepository.findByCompanyUserIdOrderByCreatedAtDesc(userId);
            if (opps.isEmpty()) {
                return Collections.emptyList();
            }
            Set<UUID> oppIds = new HashSet<>();
            for (CompanyOpportunity opp : opps) {
                oppIds.add(opp.getId());
            }
            apps = new ArrayList<>();
            for (RecruitmentApplication a : applicationRepository.findAll()) {
                if (a.getOpportunityId() != null && oppIds.contains(a.getOpportunityId())) {
                    apps.add(a);
                }
            }
        } else if ("STUDENT".equalsIgnoreCase(role)) {
            apps = applicationRepository.findByStudentIdOrderByCreatedAtDesc(userId);
        } else {
            apps = applicationRepository.findAll();
        }

        List<Map<String, Object>> enriched = new ArrayList<>();
        for (RecruitmentApplication app : apps) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", app.getId());
            map.put("studentId", app.getStudentId());
            map.put("opportunityId", app.getOpportunityId());
            map.put("status", app.getStatus() != null ? app.getStatus() : "APPLIED");
            map.put("appliedAt", app.getCreatedAt() != null ? app.getCreatedAt().toString() : Instant.now().toString());

            if (app.getOpportunityId() != null) {
                opportunityRepository.findById(app.getOpportunityId()).ifPresent(opp -> {
                    map.put("opportunityTitle", opp.getTitle());
                    map.put("role", opp.getTitle());
                    map.put("opportunityType", opp.getOpportunityType());
                });
            }

            if (app.getStudentId() != null) {
                userRepository.findById(app.getStudentId()).ifPresent(u -> {
                    map.put("studentName", u.getDisplayName());
                    map.put("name", u.getDisplayName());
                    map.put("studentEmail", u.getEmail());
                });

                studentProfileRepository.findByUserId(app.getStudentId()).ifPresent(prof -> {
                    map.put("institutionName", prof.getInstitution());
                    map.put("college", prof.getInstitution());
                    map.put("degree", prof.getDegree());
                    map.put("department", prof.getDepartment());
                    map.put("batch", prof.getAcademicYear());
                    map.put("cgpa", prof.getCgpa());
                });

                List<com.beyon.assessment.model.AssessmentResult> results = assessmentResultRepository.findByStudentIdOrderByCreatedAtDesc(app.getStudentId());
                if (!results.isEmpty()) {
                    map.put("assessmentScore", results.get(0).getOverallScore());
                }
            }

            enriched.add(map);
        }
        return enriched;
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
