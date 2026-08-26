package com.beyon.recruitment.service;

import com.beyon.recruitment.model.RecruitmentPipeline;
import com.beyon.recruitment.model.PlacementOffer;
import com.beyon.recruitment.repository.RecruitmentPipelineRepository;
import com.beyon.recruitment.repository.PlacementOfferRepository;
import com.beyon.community.service.SmartNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class RecruitmentPipelineService {
    private final RecruitmentPipelineRepository pipelineRepo;
    private final PlacementOfferRepository offerRepo;
    private final SmartNotificationService notifService;

    public RecruitmentPipelineService(RecruitmentPipelineRepository pipelineRepo, PlacementOfferRepository offerRepo, SmartNotificationService notifService) {
        this.pipelineRepo = pipelineRepo;
        this.offerRepo = offerRepo;
        this.notifService = notifService;
    }

    public RecruitmentPipeline apply(UUID opportunityId, UUID companyId, UUID studentId) {
        RecruitmentPipeline pipeline = new RecruitmentPipeline();
        pipeline.setOpportunityId(opportunityId);
        pipeline.setCompanyId(companyId);
        pipeline.setStudentId(studentId);
        pipeline.setCurrentStage("APPLIED");
        return pipelineRepo.save(pipeline);
    }

    public RecruitmentPipeline moveToStage(UUID pipelineId, String stage) {
        RecruitmentPipeline pipeline = pipelineRepo.findById(pipelineId).orElseThrow();
        pipeline.setCurrentStage(stage);
        pipeline.setUpdatedAt(OffsetDateTime.now());

        notifService.send(pipeline.getStudentId(), "RECRUITMENT", "HIGH",
            "Application Update",
            "Your application has been moved to: " + stage.replace("_", " "),
            "/my-applications", "APPLICATION", pipeline.getId());

        return pipelineRepo.save(pipeline);
    }

    public RecruitmentPipeline shortlist(UUID pipelineId, String notes) {
        RecruitmentPipeline pipeline = moveToStage(pipelineId, "SHORTLISTED");
        if (notes != null) pipeline.setNotes(notes);
        return pipelineRepo.save(pipeline);
    }

    public RecruitmentPipeline reject(UUID pipelineId, String notes) {
        RecruitmentPipeline pipeline = moveToStage(pipelineId, "REJECTED");
        if (notes != null) pipeline.setNotes(notes);
        return pipelineRepo.save(pipeline);
    }

    public PlacementOffer generateOffer(UUID pipelineId, String jobRole, BigDecimal packageAmount, String companyTier) {
        RecruitmentPipeline pipeline = pipelineRepo.findById(pipelineId).orElseThrow();
        pipeline.setCurrentStage("OFFERED");
        pipeline.setUpdatedAt(OffsetDateTime.now());
        pipelineRepo.save(pipeline);

        PlacementOffer offer = new PlacementOffer();
        offer.setPipelineId(pipelineId);
        offer.setStudentId(pipeline.getStudentId());
        offer.setCompanyId(pipeline.getCompanyId());
        offer.setJobRole(jobRole);
        offer.setPackageAmount(packageAmount);
        offer.setCompanyTier(companyTier);
        offer.setOfferStatus("SENT");
        offer.setOfferDate(OffsetDateTime.now());

        notifService.send(pipeline.getStudentId(), "PLACEMENT", "CRITICAL",
            "🎉 Offer Received!",
            "You've received an offer for " + jobRole,
            "/my-applications", "OFFER", offer.getId());

        return offerRepo.save(offer);
    }

    public PlacementOffer acceptOffer(UUID offerId, UUID studentId) {
        PlacementOffer offer = offerRepo.findById(offerId).orElseThrow();
        if (!offer.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        offer.setOfferStatus("ACCEPTED");
        offer.setAcceptanceDate(OffsetDateTime.now());

        RecruitmentPipeline pipeline = pipelineRepo.findById(offer.getPipelineId()).orElseThrow();
        pipeline.setCurrentStage("SELECTED");
        pipelineRepo.save(pipeline);

        return offerRepo.save(offer);
    }

    public List<RecruitmentPipeline> getCompanyPipeline(UUID companyId) {
        return pipelineRepo.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    public List<RecruitmentPipeline> getStudentApplications(UUID studentId) {
        return pipelineRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<RecruitmentPipeline> getByOpportunity(UUID opportunityId) {
        return pipelineRepo.findByOpportunityIdOrderByCreatedAtDesc(opportunityId);
    }

    public PlacementOffer getOffer(UUID offerId) {
        return offerRepo.findById(offerId).orElseThrow();
    }

    public List<PlacementOffer> getStudentOffers(UUID studentId) {
        return offerRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public Map<String, Object> getPipelineStats(UUID opportunityId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("applied", pipelineRepo.countByOpportunityIdAndCurrentStage(opportunityId, "APPLIED"));
        stats.put("shortlisted", pipelineRepo.countByOpportunityIdAndCurrentStage(opportunityId, "SHORTLISTED"));
        stats.put("interviewing", pipelineRepo.countByOpportunityIdAndCurrentStage(opportunityId, "INTERVIEW"));
        stats.put("selected", pipelineRepo.countByOpportunityIdAndCurrentStage(opportunityId, "SELECTED"));
        stats.put("rejected", pipelineRepo.countByOpportunityIdAndCurrentStage(opportunityId, "REJECTED"));
        return stats;
    }
}
