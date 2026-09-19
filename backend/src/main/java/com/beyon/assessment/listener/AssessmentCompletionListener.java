package com.beyon.assessment.listener;

import com.beyon.common.event.AssessmentCompletedEvent;
import com.beyon.notification.service.NotificationService;
import com.beyon.platform.service.RealtimeService;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.model.OpportunityApplication;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import com.beyon.practice.repository.OpportunityApplicationRepository;
import com.beyon.practice.service.CoinService;
import com.beyon.practice.service.SkillXpService;
import com.beyon.practice.service.StreakService;
import com.beyon.recruitment.model.RecruitmentApplication;
import com.beyon.recruitment.model.RecruitmentPipeline;
import com.beyon.recruitment.model.RecruitmentStatusHistory;
import com.beyon.recruitment.repository.RecruitmentApplicationRepository;
import com.beyon.recruitment.repository.RecruitmentPipelineRepository;
import com.beyon.recruitment.repository.RecruitmentStatusHistoryRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
public class AssessmentCompletionListener {

    private final RecruitmentApplicationRepository recruitmentAppRepo;
    private final RecruitmentStatusHistoryRepository statusHistoryRepo;
    private final RecruitmentPipelineRepository pipelineRepo;
    private final OpportunityApplicationRepository oppAppRepo;
    private final CompanyOpportunityRepository oppRepo;
    private final CoinService coinService;
    private final StreakService streakService;
    private final SkillXpService skillXpService;
    private final NotificationService notificationService;
    private final RealtimeService realtimeService;

    public AssessmentCompletionListener(
            RecruitmentApplicationRepository recruitmentAppRepo,
            RecruitmentStatusHistoryRepository statusHistoryRepo,
            RecruitmentPipelineRepository pipelineRepo,
            OpportunityApplicationRepository oppAppRepo,
            CompanyOpportunityRepository oppRepo,
            CoinService coinService,
            StreakService streakService,
            SkillXpService skillXpService,
            NotificationService notificationService,
            RealtimeService realtimeService) {
        this.recruitmentAppRepo = recruitmentAppRepo;
        this.statusHistoryRepo = statusHistoryRepo;
        this.pipelineRepo = pipelineRepo;
        this.oppAppRepo = oppAppRepo;
        this.oppRepo = oppRepo;
        this.coinService = coinService;
        this.streakService = streakService;
        this.skillXpService = skillXpService;
        this.notificationService = notificationService;
        this.realtimeService = realtimeService;
    }

    @EventListener
    @Transactional
    public void onAssessmentCompleted(AssessmentCompletedEvent event) {
        UUID studentId = event.studentId();
        UUID oppId = event.opportunityId();
        BigDecimal score = event.score() != null ? event.score() : BigDecimal.ZERO;

        coinService.earnCoins(studentId, "ASSESSMENT_COMPLETED", "ASSESSMENT", event.sessionId());

        UUID skillId = UUID.nameUUIDFromBytes("TECHNICAL_ASSESSMENT".getBytes());
        skillXpService.earnXp(studentId, skillId, 100, "ASSESSMENT", event.sessionId(), "Completed assessment with score " + score + "%");

        RecruitmentApplication app = null;
        if (event.applicationId() != null) {
            app = recruitmentAppRepo.findById(event.applicationId()).orElse(null);
        }
        if (app == null && oppId != null) {
            var apps = recruitmentAppRepo.findByOpportunityId(oppId);
            for (var a : apps) {
                if (studentId.equals(a.getStudentId())) {
                    app = a;
                    break;
                }
            }
        }

        String nextStatus = score.compareTo(BigDecimal.valueOf(50)) >= 0 ? "ASSESSMENT_COMPLETED" : "REVIEW_REQUIRED";
        if (app != null) {
            String oldStatus = app.getStatus();
            app.setAssessmentScore(score);
            app.setStatus(nextStatus);
            recruitmentAppRepo.save(app);

            RecruitmentStatusHistory history = new RecruitmentStatusHistory();
            history.setApplicationId(app.getId());
            history.setFromStatus(oldStatus);
            history.setToStatus(nextStatus);
            history.setNotes("Assessment completed. Score: " + score + "%, Accuracy: " + event.accuracy() + "%");
            statusHistoryRepo.save(history);
        }

        if (oppId != null) {
            Optional<OpportunityApplication> oppAppOpt = oppAppRepo.findByOpportunityIdAndStudentId(oppId, studentId);
            if (oppAppOpt.isPresent()) {
                OpportunityApplication oppApp = oppAppOpt.get();
                oppApp.setAssessmentScore(score);
                oppApp.setStatus(nextStatus);
                oppAppRepo.save(oppApp);
            }
        }

        if (oppId != null) {
            var pipelines = pipelineRepo.findByCompanyIdOrderByCreatedAtDesc(oppId);

            for (RecruitmentPipeline p : pipelineRepo.findAll()) {
                if (studentId.equals(p.getStudentId()) && oppId.equals(p.getOpportunityId())) {
                    p.setCurrentStage(nextStatus);
                    p.setUpdatedAt(OffsetDateTime.now());
                    pipelineRepo.save(p);
                    break;
                }
            }
        }

        CompanyOpportunity opp = oppId != null ? oppRepo.findById(oppId).orElse(null) : null;
        String oppTitle = opp != null ? opp.getTitle() : "Technical Assessment";
        notificationService.send(studentId,
                "Assessment Completed",
                "Your assessment for " + oppTitle + " has been evaluated. Score: " + score + "%. You earned 50 Beyon Coins!",
                "ASSESSMENT", "ASSESSMENT_SESSION", event.sessionId());

        if (opp != null && opp.getCompanyUserId() != null) {
            notificationService.send(opp.getCompanyUserId(),
                    "Candidate Assessment Completed",
                    "A candidate has completed the assessment for " + oppTitle + " with score " + score + "% (" + nextStatus + ").",
                    "RECRUITMENT", "ASSESSMENT_SESSION", event.sessionId());
        }

        try {
            realtimeService.sendEvent(studentId, "ASSESSMENT_EVALUATED", Map.of(
                    "sessionId", event.sessionId(),
                    "score", score,
                    "accuracy", event.accuracy() != null ? event.accuracy() : BigDecimal.ZERO,
                    "status", nextStatus
            ));
        } catch (Exception ignored) {}
    }
}

