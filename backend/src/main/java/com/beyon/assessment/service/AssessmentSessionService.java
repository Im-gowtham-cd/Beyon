package com.beyon.assessment.service;

import com.beyon.assessment.model.*;
import com.beyon.assessment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssessmentSessionService {

    private final AssessmentSessionRepository sessionRepository;
    private final AssessmentPolicyRepository policyRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final AssessmentQuestionOrderRepository questionOrderRepository;
    private final ProctoringEventRepository proctoringEventRepository;
    private final AssessmentAuditEventRepository auditEventRepository;
    private final IdentityVerificationRepository identityVerificationRepository;
    private final SystemCheckResultRepository systemCheckResultRepository;
    private final AssessmentResultRepository resultRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final com.beyon.practice.repository.QuestionOptionRepository questionOptionRepository;
    private final com.beyon.practice.repository.CompanyOpportunityRepository opportunityRepository;
    private final com.beyon.assessment.repository.AssessmentConfigurationRepository assessmentConfigRepository;
    private final com.beyon.practice.repository.QuestionRepository questionRepository;
    private final com.beyon.practice.repository.OpportunityApplicationRepository applicationRepository;
    private final com.beyon.recruitment.repository.RecruitmentApplicationRepository recruitmentApplicationRepository;
    private final com.beyon.institution.repository.PlacementDriveRepository placementDriveRepository;
    private final com.beyon.assessment.repository.AssessmentReattemptRequestRepository reattemptRequestRepository;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.beyon.identity.repository.UserRepository userRepository;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.beyon.profile.repository.StudentProfileRepository studentProfileRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AssessmentSessionService(
            AssessmentSessionRepository sessionRepository,
            AssessmentPolicyRepository policyRepository,
            AssessmentAnswerRepository answerRepository,
            AssessmentQuestionOrderRepository questionOrderRepository,
            ProctoringEventRepository proctoringEventRepository,
            AssessmentAuditEventRepository auditEventRepository,
            IdentityVerificationRepository identityVerificationRepository,
            SystemCheckResultRepository systemCheckResultRepository,
            AssessmentResultRepository resultRepository,
            org.springframework.context.ApplicationEventPublisher eventPublisher,
            com.beyon.practice.repository.QuestionOptionRepository questionOptionRepository,
            com.beyon.practice.repository.CompanyOpportunityRepository opportunityRepository,
            com.beyon.assessment.repository.AssessmentConfigurationRepository assessmentConfigRepository,
            com.beyon.practice.repository.QuestionRepository questionRepository,
            com.beyon.practice.repository.OpportunityApplicationRepository applicationRepository,
            com.beyon.recruitment.repository.RecruitmentApplicationRepository recruitmentApplicationRepository,
            com.beyon.institution.repository.PlacementDriveRepository placementDriveRepository,
            @org.springframework.beans.factory.annotation.Autowired(required = false) com.beyon.assessment.repository.AssessmentReattemptRequestRepository reattemptRequestRepository) {
        this.sessionRepository = sessionRepository;
        this.policyRepository = policyRepository;
        this.answerRepository = answerRepository;
        this.questionOrderRepository = questionOrderRepository;
        this.proctoringEventRepository = proctoringEventRepository;
        this.auditEventRepository = auditEventRepository;
        this.identityVerificationRepository = identityVerificationRepository;
        this.systemCheckResultRepository = systemCheckResultRepository;
        this.resultRepository = resultRepository;
        this.eventPublisher = eventPublisher;
        this.questionOptionRepository = questionOptionRepository;
        this.opportunityRepository = opportunityRepository;
        this.assessmentConfigRepository = assessmentConfigRepository;
        this.questionRepository = questionRepository;
        this.applicationRepository = applicationRepository;
        this.recruitmentApplicationRepository = recruitmentApplicationRepository;
        this.placementDriveRepository = placementDriveRepository;
        this.reattemptRequestRepository = reattemptRequestRepository;
    }

    public AssessmentSession createSession(UUID applicationId, UUID studentId, UUID opportunityId, int questionCount, int durationMinutes) {

        if (opportunityId != null && studentId != null) {
            boolean isApprovedForReattempt = reattemptRequestRepository != null &&
                    reattemptRequestRepository.findFirstByStudentIdAndOpportunityIdAndStatusOrderByCreatedAtDesc(studentId, opportunityId, "APPROVED").isPresent();

            if (isApprovedForReattempt) {

                reattemptRequestRepository.findFirstByStudentIdAndOpportunityIdAndStatusOrderByCreatedAtDesc(studentId, opportunityId, "APPROVED")
                        .ifPresent(req -> {
                            req.setStatus("CONSUMED");
                            req.setReviewedAt(OffsetDateTime.now());
                            reattemptRequestRepository.save(req);
                        });
            } else {
                List<AssessmentSession> oppSessions = sessionRepository.findByStudentIdAndOpportunityIdOrderByCreatedAtDesc(studentId, opportunityId);
                for (AssessmentSession s : oppSessions) {
                    if ("SUBMITTED".equals(s.getStatus()) || "COMPLETED".equals(s.getStatus()) || "EVALUATED".equals(s.getStatus()) || "TERMINATED".equals(s.getStatus())) {
                        throw new com.beyon.common.exception.ConflictException("You have already completed or were terminated from this drive assessment. To retake, please submit a Reattempt Request to the company.");
                    }
                    if ("CREATED".equals(s.getStatus()) || "LAUNCHED".equals(s.getStatus()) || "IN_PROGRESS".equals(s.getStatus())) {
                        return s;
                    }
                }

                if (applicationRepository != null) {
                    applicationRepository.findByOpportunityIdAndStudentId(opportunityId, studentId).ifPresent(app -> {
                        if ("ASSESSED".equalsIgnoreCase(app.getStatus()) || app.getAssessmentScore() != null) {
                            throw new com.beyon.common.exception.ConflictException("You have already completed or were terminated from this drive assessment. To retake, please submit a Reattempt Request to the company.");
                        }
                    });
                }
            }
        }

        if (applicationId != null) {
            Optional<AssessmentSession> existing = sessionRepository.findByApplicationId(applicationId);
            if (existing.isPresent()) {
                AssessmentSession s = existing.get();
                if ("SUBMITTED".equals(s.getStatus()) || "COMPLETED".equals(s.getStatus()) || "EVALUATED".equals(s.getStatus()) || "TERMINATED".equals(s.getStatus())) {
                    boolean isApprovedForReattempt = reattemptRequestRepository != null &&
                            reattemptRequestRepository.findFirstByStudentIdAndOpportunityIdAndStatusOrderByCreatedAtDesc(studentId, opportunityId, "APPROVED").isPresent();
                    if (!isApprovedForReattempt) {
                        throw new com.beyon.common.exception.ConflictException("You have already completed or were terminated from this assessment. To retake, please submit a Reattempt Request to the company.");
                    }
                } else {
                    return s;
                }
            }
        }

        int resolvedDuration = durationMinutes;
        int resolvedQuestions = questionCount;

        if (opportunityId != null) {
            if (opportunityRepository != null) {
                opportunityRepository.findById(opportunityId).ifPresent(opp -> {
                    if (opp.getAssessmentId() != null && assessmentConfigRepository != null) {
                        assessmentConfigRepository.findById(opp.getAssessmentId()).ifPresent(cfg -> {
                            if (cfg.getDurationMinutes() > 0) {

                            }
                        });
                    }
                });
            }
            if (questionRepository != null) {
                List<com.beyon.practice.model.Question> customQs = questionRepository.findByTagsContainingOrderByCreatedAtAsc("opportunity:" + opportunityId);
                if (!customQs.isEmpty()) {
                    resolvedQuestions = customQs.size();
                }
            }
            if (opportunityRepository != null) {
                var oppOpt = opportunityRepository.findById(opportunityId);
                if (oppOpt.isPresent() && oppOpt.get().getAssessmentId() != null && assessmentConfigRepository != null) {
                    var cfgOpt = assessmentConfigRepository.findById(oppOpt.get().getAssessmentId());
                    if (cfgOpt.isPresent()) {
                        if (cfgOpt.get().getDurationMinutes() > 0) {
                            resolvedDuration = cfgOpt.get().getDurationMinutes();
                        }
                        if (resolvedQuestions <= 0 && cfgOpt.get().getTotalQuestions() > 0) {
                            resolvedQuestions = cfgOpt.get().getTotalQuestions();
                        }
                    }
                }
            }
        }

        Optional<AssessmentPolicy> policy = opportunityId != null
                ? policyRepository.findByOpportunityId(opportunityId)
                : Optional.empty();

        AssessmentSession session = new AssessmentSession();
        session.setApplicationId(applicationId != null ? applicationId : UUID.randomUUID());
        session.setStudentId(studentId);
        session.setOpportunityId(opportunityId);
        policy.ifPresent(p -> session.setPolicyId(p.getId()));
        session.setSessionToken(generateToken());
        session.setLaunchToken(generateToken());
        session.setTotalQuestions(resolvedQuestions > 0 ? resolvedQuestions : 20);
        session.setDurationMinutes(resolvedDuration > 0 ? resolvedDuration : 60);
        session.setStatus("CREATED");
        session.setExpiresAt(OffsetDateTime.now().plusMinutes(session.getDurationMinutes() + 30));

        audit(session.getId(), studentId, "SESSION", "Session created", null, null, null);
        return sessionRepository.save(session);
    }

    public String generateLaunchToken(UUID sessionId, UUID studentId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getStudentId().equals(studentId)) {
            throw new RuntimeException("Unauthorized");
        }

        String token = generateToken();
        session.setLaunchToken(token);
        session.setLaunchTokenUsed(false);
        session.setUpdatedAt(OffsetDateTime.now());
        return sessionRepository.save(session).getLaunchToken();
    }

    public AssessmentSession launchSession(String launchToken, String deviceFingerprint, String deviceInfo, String ipAddress) {
        AssessmentSession session = sessionRepository.findByLaunchToken(launchToken)
                .orElseThrow(() -> new RuntimeException("Invalid launch token"));

        if (session.getLaunchTokenUsed()) {
            throw new RuntimeException("Launch token already used");
        }
        if (session.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new RuntimeException("Session expired");
        }

        session.setLaunchTokenUsed(true);
        session.setStatus("LAUNCHED");
        session.setDeviceFingerprint(deviceFingerprint);
        session.setDeviceInfo(deviceInfo);
        session.setIpAddress(ipAddress);
        session.setUpdatedAt(OffsetDateTime.now());

        audit(session.getId(), session.getStudentId(), "LAUNCH", "Assessment launched", null, ipAddress, deviceInfo);
        return sessionRepository.save(session);
    }

    public AssessmentSession verifyIdentity(UUID sessionId, String status, String captureUrl, Boolean faceDetected, Integer faceCount, BigDecimal livenessScore) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        IdentityVerification verification = new IdentityVerification();
        verification.setSessionId(sessionId);
        verification.setStudentId(session.getStudentId());
        verification.setStatus(status);
        verification.setCameraCaptureUrl(captureUrl);
        verification.setFaceDetected(faceDetected);
        verification.setFaceCount(faceCount);
        verification.setLivenessScore(livenessScore);
        if ("VERIFIED".equals(status)) {
            verification.setVerifiedAt(OffsetDateTime.now());
        }
        identityVerificationRepository.save(verification);

        if ("VERIFIED".equals(status)) {
            session.setStatus("VERIFYING");
        } else {
            session.setStatus("TERMINATED");
            audit(sessionId, session.getStudentId(), "VERIFY", "Identity verification failed", "{\"status\":\"" + status + "\"}", null, null);
        }
        session.setUpdatedAt(OffsetDateTime.now());
        return sessionRepository.save(session);
    }

    public SystemCheckResult recordSystemCheck(UUID sessionId, String checkType, String status, String details) {
        SystemCheckResult result = new SystemCheckResult();
        result.setSessionId(sessionId);
        result.setCheckType(checkType);
        result.setStatus(status);
        result.setDetails(details);
        return systemCheckResultRepository.save(result);
    }

    public AssessmentSession completeSystemCheck(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        long failCount = systemCheckResultRepository.countBySessionIdAndStatus(sessionId, "FAIL");
        if (failCount > 0) {
            throw new RuntimeException("System check failed. " + failCount + " mandatory requirements not met.");
        }

        session.setStatus("SYSTEM_CHECK");
        session.setUpdatedAt(OffsetDateTime.now());
        return sessionRepository.save(session);
    }

    public AssessmentSession startAssessment(UUID sessionId, List<UUID> questionIds) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if ("IN_PROGRESS".equals(session.getStatus())) {
            return session;
        }

        if (!"CREATED".equals(session.getStatus()) && !"SYSTEM_CHECK".equals(session.getStatus()) && !"LAUNCHED".equals(session.getStatus()) && !"VERIFYING".equals(session.getStatus()) && !"READY".equals(session.getStatus())) {
            throw new RuntimeException("Session not ready to start. Current status: " + session.getStatus());
        }

        session.setStatus("IN_PROGRESS");
        session.setStartedAt(OffsetDateTime.now());
        int duration = (session.getDurationMinutes() != null && session.getDurationMinutes() > 0) ? session.getDurationMinutes() : 60;
        session.setExpiresAt(OffsetDateTime.now().plusMinutes(duration));
        session.setLastHeartbeatAt(OffsetDateTime.now());

        if (questionIds != null && !questionIds.isEmpty()) {
            Set<UUID> uniqueIds = new LinkedHashSet<>(questionIds);
            List<UUID> shuffled = new ArrayList<>(uniqueIds);
            Collections.shuffle(shuffled);

            questionOrderRepository.deleteBySessionId(sessionId);
            questionOrderRepository.flush();

            List<AssessmentQuestionOrder> orderEntities = new ArrayList<>();
            for (int i = 0; i < shuffled.size(); i++) {
                AssessmentQuestionOrder order = new AssessmentQuestionOrder();
                order.setSessionId(sessionId);
                order.setQuestionId(shuffled.get(i));
                order.setSortOrder(i + 1);
                orderEntities.add(order);
            }
            questionOrderRepository.saveAll(orderEntities);
        }

        audit(sessionId, session.getStudentId(), "START", "Assessment started", null, null, null);
        return sessionRepository.save(session);
    }

    public AssessmentAnswer submitAnswer(UUID sessionId, UUID questionId, UUID selectedOptionId, String answerText, String codeAnswer, int timeSpentSeconds, boolean markedForReview) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!"IN_PROGRESS".equals(session.getStatus())) {
            throw new RuntimeException("Session not in progress");
        }
        if (session.getExpiresAt() != null && session.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new RuntimeException("Assessment time expired");
        }

        AssessmentAnswer answer = answerRepository.findBySessionIdAndQuestionId(sessionId, questionId)
                .orElse(new AssessmentAnswer());

        answer.setSessionId(sessionId);
        answer.setQuestionId(questionId);
        answer.setSelectedOptionId(selectedOptionId);
        answer.setAnswerText(answerText);
        answer.setCodeAnswer(codeAnswer);
        answer.setTimeSpentSeconds(timeSpentSeconds);
        answer.setMarkedForReview(markedForReview);
        answer.setAnsweredAt(OffsetDateTime.now());
        answer.setUpdatedAt(OffsetDateTime.now());

        if (selectedOptionId != null) {
            questionOptionRepository.findById(selectedOptionId).ifPresent(opt -> {
                answer.setIsCorrect(opt.isCorrect());
                answer.setMarksAwarded(opt.isCorrect() ? BigDecimal.valueOf(5) : BigDecimal.ZERO);
            });
        }

        session.setLastAutosaveAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);

        return answerRepository.save(answer);
    }

    public Map<String, Object> getRemainingTime(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Map<String, Object> result = new HashMap<>();
        if (session.getExpiresAt() == null) {
            result.put("remainingSeconds", session.getDurationMinutes() * 60);
            result.put("expired", false);
            return result;
        }

        long remaining = java.time.Duration.between(OffsetDateTime.now(), session.getExpiresAt()).getSeconds();
        result.put("remainingSeconds", Math.max(0, remaining));
        result.put("expired", remaining <= 0);
        result.put("serverTime", OffsetDateTime.now().toString());
        return result;
    }

    public void updateHeartbeat(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setLastHeartbeatAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);
    }

    public AssessmentSession terminateSession(UUID sessionId, String reason) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setStatus("TERMINATED");
        session.setCompletedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        audit(sessionId, session.getStudentId(), "TERMINATE", "Session terminated: " + reason, null, null, null);
        return sessionRepository.save(session);
    }

    public AssessmentSession submitAssessment(UUID sessionId) {
        return submitAssessment(sessionId, null);
    }

    public AssessmentSession submitAssessment(UUID sessionId, Map<String, Object> submissionPayload) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if ("SUBMITTED".equals(session.getStatus()) || "TERMINATED".equals(session.getStatus())) {
            return session;
        }

        List<com.beyon.practice.model.Question> questions = new ArrayList<>();
        if (session.getOpportunityId() != null) {
            questions = questionRepository.findByTagsContainingOrderByCreatedAtAsc("opportunity:" + session.getOpportunityId());
        }
        if (questions.isEmpty()) {
            List<AssessmentQuestionOrder> orders = questionOrderRepository.findBySessionIdOrderBySortOrder(sessionId);
            if (!orders.isEmpty()) {
                for (AssessmentQuestionOrder ord : orders) {
                    questionRepository.findById(ord.getQuestionId()).ifPresent(questions::add);
                }
            }
        }
        if (questions.isEmpty()) {
            int qCount = session.getTotalQuestions() > 0 ? session.getTotalQuestions() : 5;
            questions = questionRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", org.springframework.data.domain.PageRequest.of(0, qCount));
        }

        Map<String, Object> submittedAnswers = new HashMap<>();
        if (submissionPayload != null && submissionPayload.get("answers") instanceof Map) {
            submittedAnswers = (Map<String, Object>) submissionPayload.get("answers");
        }

        long attempted = 0;
        long correct = 0;

        for (int i = 0; i < questions.size(); i++) {
            com.beyon.practice.model.Question q = questions.get(i);
            UUID qId = q.getId();
            String qKey = "q-" + (i + 1);

            Object userAnsObj = submittedAnswers.containsKey(qId.toString())
                    ? submittedAnswers.get(qId.toString())
                    : submittedAnswers.get(qKey);

            Set<String> candidateSelectedOptionIds = new HashSet<>();
            String answerText = null;
            boolean markedForReview = false;

            if (userAnsObj instanceof Map) {
                Map<String, Object> userAnsMap = (Map<String, Object>) userAnsObj;
                if (userAnsMap.get("optionId") != null) {
                    candidateSelectedOptionIds.add(userAnsMap.get("optionId").toString().trim());
                }
                if (userAnsMap.get("selectedOptionId") != null) {
                    candidateSelectedOptionIds.add(userAnsMap.get("selectedOptionId").toString().trim());
                }
                if (userAnsMap.get("optionIds") instanceof List) {
                    List<?> list = (List<?>) userAnsMap.get("optionIds");
                    for (Object item : list) {
                        if (item != null) candidateSelectedOptionIds.add(item.toString().trim());
                    }
                }
                if (userAnsMap.get("selectedOptionIds") instanceof List) {
                    List<?> list = (List<?>) userAnsMap.get("selectedOptionIds");
                    for (Object item : list) {
                        if (item != null) candidateSelectedOptionIds.add(item.toString().trim());
                    }
                }
                if (userAnsMap.get("answerText") != null) {
                    answerText = userAnsMap.get("answerText").toString();
                }
                markedForReview = Boolean.TRUE.equals(userAnsMap.get("marked"));
            } else if (userAnsObj instanceof String) {
                candidateSelectedOptionIds.add(((String) userAnsObj).trim());
            }

            if (candidateSelectedOptionIds.isEmpty()) {
                var existingOpt = answerRepository.findBySessionIdAndQuestionId(sessionId, qId);
                if (existingOpt.isPresent()) {
                    AssessmentAnswer existingAns = existingOpt.get();
                    if (existingAns.getSelectedOptionId() != null) {
                        candidateSelectedOptionIds.add(existingAns.getSelectedOptionId().toString());
                    }
                    if (existingAns.getAnswerText() != null && !existingAns.getAnswerText().isBlank()) {
                        String[] parts = existingAns.getAnswerText().split(",");
                        for (String p : parts) {
                            if (!p.isBlank()) candidateSelectedOptionIds.add(p.trim());
                        }
                    }
                }
            }

            List<com.beyon.practice.model.QuestionOption> dbOptions = questionOptionRepository.findByQuestionIdOrderByDisplayOrder(qId);
            Set<String> correctOptionIds = dbOptions.stream()
                    .filter(com.beyon.practice.model.QuestionOption::isCorrect)
                    .map(opt -> opt.getId().toString())
                    .collect(Collectors.toSet());

            boolean isAttemptedThisQ = !candidateSelectedOptionIds.isEmpty() || (answerText != null && !answerText.isBlank());
            if (isAttemptedThisQ) {
                attempted++;
            }

            boolean isCorrect = false;
            if (!correctOptionIds.isEmpty()) {
                isCorrect = candidateSelectedOptionIds.equals(correctOptionIds);
            }
            if (isCorrect) {
                correct++;
            }

            AssessmentAnswer answer = answerRepository.findBySessionIdAndQuestionId(sessionId, qId)
                    .orElse(new AssessmentAnswer());
            answer.setSessionId(sessionId);
            answer.setQuestionId(qId);
            if (!candidateSelectedOptionIds.isEmpty()) {
                try {
                    answer.setSelectedOptionId(UUID.fromString(candidateSelectedOptionIds.iterator().next()));
                } catch (Exception ignored) {}
                answer.setAnswerText(String.join(",", candidateSelectedOptionIds));
            }
            answer.setIsCorrect(isCorrect);
            answer.setMarkedForReview(markedForReview);
            answer.setMarksAwarded(isCorrect ? BigDecimal.valueOf(1) : BigDecimal.ZERO);
            if (isAttemptedThisQ) {
                answer.setAnsweredAt(OffsetDateTime.now());
            }
            answerRepository.save(answer);
        }

        int totalQuestions = questions.isEmpty() ? (session.getTotalQuestions() > 0 ? session.getTotalQuestions() : 1) : questions.size();

        BigDecimal score = BigDecimal.valueOf(correct)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalQuestions), 1, RoundingMode.HALF_UP);

        BigDecimal accuracy = attempted > 0
                ? BigDecimal.valueOf(correct).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(attempted), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        int timeUsed = 0;
        if (session.getStartedAt() != null) {
            timeUsed = (int) java.time.Duration.between(session.getStartedAt(), OffsetDateTime.now()).getSeconds();
        }

        long warningCount = proctoringEventRepository.countBySessionIdAndSeverity(sessionId, "WARNING");
        long criticalCount = proctoringEventRepository.countBySessionIdAndSeverity(sessionId, "CRITICAL");
        String integrityStatus = "CLEAN";
        if (criticalCount > 0) {
            integrityStatus = "REVIEW_REQUIRED";
        } else if (warningCount >= 3) {
            integrityStatus = "FLAGGED";
        } else if (warningCount > 0) {
            integrityStatus = "WARNING";
        }

        session.setStatus("SUBMITTED");
        session.setSubmittedAt(OffsetDateTime.now());
        session.setCompletedAt(OffsetDateTime.now());
        session.setScore(score);
        session.setAccuracy(accuracy);
        session.setQuestionsAttempted((int) attempted);
        session.setQuestionsCorrect((int) correct);
        session.setTimeUsedSeconds(timeUsed);
        session.setWarningCount((int) warningCount);
        session.setCriticalEventCount((int) criticalCount);
        session.setIntegrityStatus(integrityStatus);
        session.setUpdatedAt(OffsetDateTime.now());

        Map<String, Object> proctoringSummary = new HashMap<>();
        proctoringSummary.put("totalEvents", proctoringEventRepository.countBySessionId(sessionId));
        proctoringSummary.put("warningCount", warningCount);
        proctoringSummary.put("criticalCount", criticalCount);
        proctoringSummary.put("integrityStatus", integrityStatus);
        session.setProctoringSummary(mapToJson(proctoringSummary));

        audit(sessionId, session.getStudentId(), "SUBMIT", "Assessment submitted", null, null, null);
        AssessmentSession savedSession = sessionRepository.save(session);

        try {
            AssessmentResult result = new AssessmentResult();
            result.setSessionId(savedSession.getId());
            result.setStudentId(savedSession.getStudentId());
            result.setOverallScore(savedSession.getScore());
            result.setMaxScore(BigDecimal.valueOf(100));
            result.setAccuracy(savedSession.getAccuracy());
            result.setQuestionsAttempted(savedSession.getQuestionsAttempted());
            result.setQuestionsCorrect(savedSession.getQuestionsCorrect());
            result.setTimeTakenSeconds(savedSession.getTimeUsedSeconds());
            result.setStatus("COMPLETED");
            result.setSectionScores("{}");
            result.setSkillScores("{}");
            resultRepository.save(result);
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            eventPublisher.publishEvent(new com.beyon.common.event.AssessmentCompletedEvent(
                    savedSession.getId(),
                    savedSession.getStudentId(),
                    savedSession.getOpportunityId(),
                    savedSession.getApplicationId(),
                    savedSession.getScore(),
                    savedSession.getAccuracy(),
                    savedSession.getTimeUsedSeconds(),
                    savedSession.getIntegrityStatus()
            ));
        } catch (Exception e) {

        }

        try {
            if (savedSession.getOpportunityId() != null && savedSession.getStudentId() != null) {
                if (applicationRepository != null) {
                    applicationRepository.findByOpportunityIdAndStudentId(savedSession.getOpportunityId(), savedSession.getStudentId())
                            .ifPresent(app -> {
                                app.setAssessmentScore(savedSession.getScore());
                                app.setStatus("ASSESSED");
                                applicationRepository.save(app);
                            });
                }
                if (recruitmentApplicationRepository != null) {
                    recruitmentApplicationRepository.findByOpportunityIdAndStudentId(savedSession.getOpportunityId(), savedSession.getStudentId())
                            .ifPresent(recApp -> {
                                recApp.setAssessmentScore(savedSession.getScore());
                                recApp.setStatus("ASSESSED");
                                recruitmentApplicationRepository.save(recApp);
                            });
                }
                if (placementDriveRepository != null) {
                    placementDriveRepository.findByOpportunityId(savedSession.getOpportunityId()).forEach(drive -> {
                        drive.setAssessedCount(drive.getAssessedCount() + 1);
                        placementDriveRepository.save(drive);
                    });
                }
            }
        } catch (Exception ignored) {}

        return savedSession;
    }

    public Map<String, Object> getSessionResults(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Map<String, Object> results = new HashMap<>();
        results.put("sessionId", session.getId());
        results.put("score", session.getScore());
        results.put("accuracy", session.getAccuracy());
        results.put("questionsAttempted", session.getQuestionsAttempted());
        results.put("questionsCorrect", session.getQuestionsCorrect());
        results.put("timeUsedSeconds", session.getTimeUsedSeconds());
        results.put("integrityStatus", session.getIntegrityStatus());
        results.put("warningCount", session.getWarningCount());
        results.put("criticalEventCount", session.getCriticalEventCount());
        results.put("status", session.getStatus());
        results.put("completedAt", session.getCompletedAt());
        results.put("skillPerformance", session.getSkillPerformance());
        results.put("topicPerformance", session.getTopicPerformance());

        List<ProctoringEvent> events = proctoringEventRepository.findBySessionIdOrderByTimestampDesc(sessionId);
        results.put("proctoringEvents", events.stream().map(e -> {
            Map<String, Object> eventMap = new HashMap<>();
            eventMap.put("id", e.getId());
            eventMap.put("eventType", e.getEventType());
            eventMap.put("severity", e.getSeverity());
            eventMap.put("title", e.getTitle());
            eventMap.put("description", e.getDescription());
            eventMap.put("timestamp", e.getTimestamp());
            eventMap.put("confidence", e.getConfidence());
            return eventMap;
        }).collect(Collectors.toList()));

        List<Object[]> typeCounts = proctoringEventRepository.countByEventTypeForSession(sessionId);
        Map<String, Long> eventBreakdown = new HashMap<>();
        typeCounts.forEach(row -> eventBreakdown.put((String) row[0], (Long) row[1]));
        results.put("eventBreakdown", eventBreakdown);

        return results;
    }

    public Map<String, Object> getCompanyResults(UUID sessionId) {
        Map<String, Object> results = getSessionResults(sessionId);
        results.put("summary", results.get("integrityStatus"));
        return results;
    }

    public List<Map<String, Object>> getActiveSessions() {
        List<AssessmentSession> sessions = sessionRepository.findAll();
        sessions.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return sessions.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("sessionId", s.getId());
            map.put("studentId", s.getStudentId());
            map.put("opportunityId", s.getOpportunityId());
            map.put("applicationId", s.getApplicationId());
            map.put("status", s.getStatus());
            map.put("score", s.getScore());
            map.put("accuracy", s.getAccuracy());
            map.put("totalQuestions", s.getTotalQuestions());
            map.put("questionsAttempted", s.getQuestionsAttempted());
            map.put("questionsCorrect", s.getQuestionsCorrect());
            map.put("timeUsedSeconds", s.getTimeUsedSeconds());
            map.put("integrityStatus", s.getIntegrityStatus() != null ? s.getIntegrityStatus() : "CLEAN");
            map.put("warningCount", s.getWarningCount());
            map.put("criticalEventCount", s.getCriticalEventCount());
            map.put("startedAt", s.getStartedAt());
            map.put("expiresAt", s.getExpiresAt());
            map.put("completedAt", s.getCompletedAt());
            map.put("createdAt", s.getCreatedAt());

            String candidateName = null;
            String candidateEmail = null;
            String department = null;
            String college = null;
            if (s.getStudentId() != null) {
                if (userRepository != null) {
                    var uOpt = userRepository.findById(s.getStudentId());
                    if (uOpt.isPresent()) {
                        candidateEmail = uOpt.get().getEmail();
                        candidateName = uOpt.get().getDisplayName();
                        if (candidateName == null || candidateName.trim().isEmpty()) {
                            candidateName = candidateEmail != null ? candidateEmail.split("@")[0] : "Verified Candidate";
                        }
                    }
                }
                if (studentProfileRepository != null) {
                    var pOpt = studentProfileRepository.findByUserId(s.getStudentId());
                    if (pOpt.isPresent()) {
                        department = pOpt.get().getDepartment();
                        college = pOpt.get().getInstitution();
                    }
                }
            }
            map.put("candidateName", candidateName != null && !candidateName.isEmpty() ? candidateName : "Verified Candidate");
            map.put("candidateEmail", candidateEmail != null ? candidateEmail : "candidate@beyon.edu");
            map.put("department", department != null ? department : "Computer Science");
            map.put("college", college != null ? college : "Partner Campus");

            String oppTitle = null;
            String assessmentTitle = null;
            if (s.getOpportunityId() != null && opportunityRepository != null) {
                var oppOpt = opportunityRepository.findById(s.getOpportunityId());
                if (oppOpt.isPresent()) {
                    oppTitle = oppOpt.get().getTitle();
                    if (oppOpt.get().getAssessmentId() != null && assessmentConfigRepository != null) {
                        var cfgOpt = assessmentConfigRepository.findById(oppOpt.get().getAssessmentId());
                        if (cfgOpt.isPresent()) {
                            assessmentTitle = cfgOpt.get().getTitle();
                        }
                    }
                }
            }
            map.put("opportunityTitle", oppTitle != null ? oppTitle : "Campus Recruitment Drive");
            map.put("assessmentTitle", assessmentTitle != null ? assessmentTitle : (oppTitle != null ? oppTitle + " Assessment" : "Technical Benchmark Assessment"));

            return map;
        }).collect(Collectors.toList());
    }

    public void autoSubmitExpiredSessions() {
        List<AssessmentSession> expired = sessionRepository.findExpiredActiveSessions();
        for (AssessmentSession session : expired) {
            if ("IN_PROGRESS".equals(session.getStatus())) {
                submitAssessment(session.getId());
            } else {
                session.setStatus("EXPIRED");
                session.setUpdatedAt(OffsetDateTime.now());
                sessionRepository.save(session);
            }
        }
    }

    private void audit(UUID sessionId, UUID userId, String eventType, String action, String details, String ip, String ua) {
        AuditEvent event = new AuditEvent();
        event.setSessionId(sessionId);
        event.setUserId(userId);
        event.setEventType(eventType);
        event.setAction(action);
        event.setDetails(details);
        event.setIpAddress(ip);
        event.setUserAgent(ua);
        auditEventRepository.save(event);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private String mapToJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(entry.getKey()).append("\":");
            if (entry.getValue() instanceof Number) {
                sb.append(entry.getValue());
            } else {
                sb.append("\"").append(entry.getValue()).append("\"");
            }
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }

    public AssessmentSession getAssessmentSession(UUID sessionId) {
        return sessionRepository.findById(sessionId).orElse(null);
    }
}

