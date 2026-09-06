package com.beyon.assessment.service;

import com.beyon.assessment.model.AssessmentReattemptRequest;
import com.beyon.assessment.model.AssessmentSession;
import com.beyon.assessment.repository.AssessmentReattemptRequestRepository;
import com.beyon.assessment.repository.AssessmentSessionRepository;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.model.OpportunityApplication;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import com.beyon.practice.repository.OpportunityApplicationRepository;
import com.beyon.profile.model.StudentProfile;
import com.beyon.notification.service.NotificationService;
import com.beyon.profile.model.CompanyProfile;
import com.beyon.profile.repository.CompanyProfileRepository;
import com.beyon.profile.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssessmentReattemptService {

    private final AssessmentReattemptRequestRepository reattemptRepo;
    private final CompanyOpportunityRepository opportunityRepo;
    private final OpportunityApplicationRepository applicationRepo;
    private final AssessmentSessionRepository sessionRepo;
    private final UserRepository userRepo;
    private final StudentProfileRepository profileRepo;
    private final CompanyProfileRepository companyProfileRepo;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final NotificationService notificationService;

    public AssessmentReattemptService(
            AssessmentReattemptRequestRepository reattemptRepo,
            CompanyOpportunityRepository opportunityRepo,
            OpportunityApplicationRepository applicationRepo,
            AssessmentSessionRepository sessionRepo,
            UserRepository userRepo,
            StudentProfileRepository profileRepo,
            CompanyProfileRepository companyProfileRepo,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate,
            NotificationService notificationService) {
        this.reattemptRepo = reattemptRepo;
        this.opportunityRepo = opportunityRepo;
        this.applicationRepo = applicationRepo;
        this.sessionRepo = sessionRepo;
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
        this.companyProfileRepo = companyProfileRepo;
        this.jdbcTemplate = jdbcTemplate;
        this.notificationService = notificationService;
    }

    @jakarta.annotation.PostConstruct
    public void initTable() {
        try {
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS assessment_reattempt_requests (
                    id                  VARCHAR(36) NOT NULL PRIMARY KEY,
                    student_id          VARCHAR(36) NOT NULL,
                    opportunity_id      VARCHAR(36) NOT NULL,
                    session_id          VARCHAR(36),
                    company_id          VARCHAR(36),
                    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                    termination_reason  TEXT,
                    student_reason      TEXT NOT NULL,
                    review_notes        TEXT,
                    reviewed_by         VARCHAR(36),
                    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    reviewed_at         DATETIME(6),
                    INDEX idx_arr_student (student_id),
                    INDEX idx_arr_opportunity (opportunity_id),
                    INDEX idx_arr_company (company_id),
                    INDEX idx_arr_status (status)
                )
            """);
        } catch (Exception e) {
            System.err.println("[AssessmentReattemptService] Table check: " + e.getMessage());
        }
    }

    public Map<String, Object> submitReattemptRequest(
            UUID studentId,
            UUID opportunityId,
            String studentReason,
            String terminationReason) {

        CompanyOpportunity opp = opportunityRepo.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity", opportunityId.toString()));

        Optional<AssessmentReattemptRequest> existing = reattemptRepo
                .findFirstByStudentIdAndOpportunityIdOrderByCreatedAtDesc(studentId, opportunityId);

        if (existing.isPresent() && "PENDING".equals(existing.get().getStatus())) {
            AssessmentReattemptRequest req = existing.get();
            if (studentReason != null && !studentReason.isBlank()) {
                req.setStudentReason(studentReason);
            }
            if (terminationReason != null && !terminationReason.isBlank()) {
                req.setTerminationReason(terminationReason);
            }
            reattemptRepo.save(req);
            return toDto(req, opp, null, null);
        }

        List<AssessmentSession> sessions = sessionRepo.findByStudentIdAndOpportunityIdOrderByCreatedAtDesc(studentId, opportunityId);
        AssessmentSession session = sessions.isEmpty() ? null : sessions.get(0);

        AssessmentReattemptRequest req = new AssessmentReattemptRequest();
        req.setStudentId(studentId);
        req.setOpportunityId(opportunityId);
        req.setCompanyId(opp.getCompanyUserId());
        req.setSessionId(session != null ? session.getId() : null);
        req.setStatus("PENDING");
        req.setStudentReason(studentReason != null && !studentReason.isBlank() ? studentReason : "Candidate requested reassessment opportunity.");
        req.setTerminationReason(terminationReason != null ? terminationReason : (session != null ? session.getProctoringSummary() : "Proctoring violations / Session terminated"));
        req.setCreatedAt(OffsetDateTime.now());

        AssessmentReattemptRequest saved = reattemptRepo.save(req);

        try {
            if (opp.getCompanyUserId() != null) {
                User student = userRepo.findById(studentId).orElse(null);
                String studentName = student != null ? student.getDisplayName() : "A candidate";
                notificationService.send(
                        opp.getCompanyUserId(),
                        "New Assessment Reattempt Request",
                        studentName + " requested a reattempt for " + opp.getTitle() + ": \"" + req.getStudentReason() + "\"",
                        "REATTEMPT_REQUEST",
                        "OPPORTUNITY",
                        opp.getId()
                );
            }
        } catch (Exception ignored) {}

        return toDto(saved, opp, null, session);
    }

    public List<Map<String, Object>> getStudentReattemptRequests(UUID studentId) {
        List<AssessmentReattemptRequest> list = reattemptRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        return list.stream().map(req -> {
            CompanyOpportunity opp = opportunityRepo.findById(req.getOpportunityId()).orElse(null);
            AssessmentSession sess = req.getSessionId() != null
                    ? sessionRepo.findById(req.getSessionId()).orElse(null)
                    : null;
            return toDto(req, opp, null, sess);
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getCompanyReattemptRequests(UUID companyUserId) {

        List<CompanyOpportunity> companyOpps = opportunityRepo.findByCompanyUserIdOrderByCreatedAtDesc(companyUserId);
        Map<UUID, CompanyOpportunity> oppMap = companyOpps.stream()
                .collect(Collectors.toMap(CompanyOpportunity::getId, o -> o, (a, b) -> a));

        List<AssessmentReattemptRequest> requests = reattemptRepo.findByCompanyIdOrderByCreatedAtDesc(companyUserId);
        if (requests.isEmpty() && !companyOpps.isEmpty()) {

            for (CompanyOpportunity opp : companyOpps) {
                requests.addAll(reattemptRepo.findByOpportunityIdOrderByCreatedAtDesc(opp.getId()));
            }
        }

        Map<UUID, AssessmentReattemptRequest> distinctMap = new LinkedHashMap<>();
        for (AssessmentReattemptRequest r : requests) {
            distinctMap.putIfAbsent(r.getId(), r);
        }

        return distinctMap.values().stream().map(req -> {
            CompanyOpportunity opp = oppMap.getOrDefault(req.getOpportunityId(),
                    opportunityRepo.findById(req.getOpportunityId()).orElse(null));
            User student = userRepo.findById(req.getStudentId()).orElse(null);
            StudentProfile profile = profileRepo.findByUserId(req.getStudentId()).orElse(null);
            AssessmentSession sess = req.getSessionId() != null
                    ? sessionRepo.findById(req.getSessionId()).orElse(null)
                    : null;
            return toCompanyDto(req, opp, student, profile, sess);
        }).collect(Collectors.toList());
    }

    public Map<String, Object> approveReattemptRequest(UUID requestId, UUID companyUserId, String reviewNotes) {
        AssessmentReattemptRequest req = reattemptRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ReattemptRequest", requestId.toString()));

        req.setStatus("APPROVED");
        req.setReviewNotes(reviewNotes != null ? reviewNotes : "Reattempt request approved by company recruiter.");
        req.setReviewedBy(companyUserId);
        req.setReviewedAt(OffsetDateTime.now());
        AssessmentReattemptRequest saved = reattemptRepo.save(req);

        Optional<OpportunityApplication> appOpt = applicationRepo.findByOpportunityIdAndStudentId(req.getOpportunityId(), req.getStudentId());
        if (appOpt.isPresent()) {
            OpportunityApplication app = appOpt.get();
            app.setStatus("SHORTLISTED");
            app.setAssessmentScore(null);
            applicationRepo.save(app);
        }

        CompanyOpportunity opp = opportunityRepo.findById(req.getOpportunityId()).orElse(null);
        User student = userRepo.findById(req.getStudentId()).orElse(null);
        StudentProfile profile = profileRepo.findByUserId(req.getStudentId()).orElse(null);

        try {
            notificationService.send(
                    req.getStudentId(),
                    "Reattempt Approved: " + (opp != null ? opp.getTitle() : "Placement Assessment"),
                    "Your reattempt request has been approved by the recruiter! You can now start a fresh assessment attempt.",
                    "REATTEMPT_APPROVED",
                    "OPPORTUNITY",
                    req.getOpportunityId()
            );
        } catch (Exception ignored) {}

        return toCompanyDto(saved, opp, student, profile, null);
    }

    public Map<String, Object> rejectReattemptRequest(UUID requestId, UUID companyUserId, String reviewNotes) {
        AssessmentReattemptRequest req = reattemptRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ReattemptRequest", requestId.toString()));

        req.setStatus("REJECTED");
        req.setReviewNotes(reviewNotes != null ? reviewNotes : "Reattempt request rejected by company recruiter.");
        req.setReviewedBy(companyUserId);
        req.setReviewedAt(OffsetDateTime.now());
        AssessmentReattemptRequest saved = reattemptRepo.save(req);

        CompanyOpportunity opp = opportunityRepo.findById(req.getOpportunityId()).orElse(null);
        User student = userRepo.findById(req.getStudentId()).orElse(null);
        StudentProfile profile = profileRepo.findByUserId(req.getStudentId()).orElse(null);

        try {
            notificationService.send(
                    req.getStudentId(),
                    "Reattempt Appeal Declined: " + (opp != null ? opp.getTitle() : "Placement Assessment"),
                    "Your reattempt appeal was reviewed and declined. Reason: " + req.getReviewNotes(),
                    "REATTEMPT_REJECTED",
                    "OPPORTUNITY",
                    req.getOpportunityId()
            );
        } catch (Exception ignored) {}

        return toCompanyDto(saved, opp, student, profile, null);
    }

    public boolean hasApprovedReattempt(UUID studentId, UUID opportunityId) {
        return reattemptRepo.findFirstByStudentIdAndOpportunityIdAndStatusOrderByCreatedAtDesc(studentId, opportunityId, "APPROVED").isPresent();
    }

    public void consumeApprovedReattempt(UUID studentId, UUID opportunityId) {
        reattemptRepo.findFirstByStudentIdAndOpportunityIdAndStatusOrderByCreatedAtDesc(studentId, opportunityId, "APPROVED")
                .ifPresent(req -> {
                    req.setStatus("CONSUMED");
                    req.setReviewedAt(OffsetDateTime.now());
                    reattemptRepo.save(req);
                });
    }

    private Map<String, Object> toDto(AssessmentReattemptRequest req, CompanyOpportunity opp, User student, AssessmentSession sess) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", req.getId());
        m.put("studentId", req.getStudentId());
        m.put("opportunityId", req.getOpportunityId());
        m.put("opportunityTitle", opp != null ? opp.getTitle() : "Placement Drive");
        String compName = "Recruiter";
        if (opp != null && opp.getCompanyUserId() != null) {
            compName = companyProfileRepo.findByUserId(opp.getCompanyUserId())
                    .map(CompanyProfile::getCompanyName)
                    .orElse("Recruiter");
        }
        m.put("companyName", compName);
        m.put("status", req.getStatus());
        m.put("studentReason", req.getStudentReason());
        m.put("terminationReason", req.getTerminationReason());
        m.put("reviewNotes", req.getReviewNotes());
        m.put("createdAt", req.getCreatedAt());
        m.put("reviewedAt", req.getReviewedAt());
        if (sess != null) {
            m.put("sessionId", sess.getId());
            m.put("sessionStatus", sess.getStatus());
            m.put("warningCount", sess.getWarningCount());
        }
        return m;
    }

    private Map<String, Object> toCompanyDto(
            AssessmentReattemptRequest req,
            CompanyOpportunity opp,
            User student,
            StudentProfile profile,
            AssessmentSession sess) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", req.getId());
        m.put("studentId", req.getStudentId());
        m.put("candidateName", student != null ? student.getDisplayName() : "Candidate");
        m.put("candidateEmail", student != null ? student.getEmail() : "");
        m.put("registrationNumber", profile != null ? profile.getRegistrationNumber() : "");
        m.put("department", profile != null ? profile.getDepartment() : "");
        m.put("opportunityId", req.getOpportunityId());
        m.put("opportunityTitle", opp != null ? opp.getTitle() : "Placement Drive");
        m.put("status", req.getStatus());
        m.put("studentReason", req.getStudentReason());
        m.put("terminationReason", req.getTerminationReason());
        m.put("reviewNotes", req.getReviewNotes());
        m.put("createdAt", req.getCreatedAt());
        m.put("reviewedAt", req.getReviewedAt());
        if (sess != null) {
            m.put("sessionId", sess.getId());
            m.put("sessionStatus", sess.getStatus());
            m.put("warningCount", sess.getWarningCount());
            m.put("accuracy", sess.getAccuracy());
            m.put("score", sess.getScore());
            m.put("integrityStatus", sess.getIntegrityStatus());
        }
        return m;
    }
}

