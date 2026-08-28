package com.beyon.recruitment.service;

import com.beyon.recruitment.model.OpportunityReferral;
import com.beyon.recruitment.repository.OpportunityReferralRepository;
import com.beyon.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class ReferralService {

    private final OpportunityReferralRepository referralRepo;
    private final NotificationService notificationService;

    public ReferralService(OpportunityReferralRepository referralRepo, NotificationService notificationService) {
        this.referralRepo = referralRepo;
        this.notificationService = notificationService;
    }

    public OpportunityReferral createReferral(UUID referrerId, OpportunityReferral referral) {
        referral.setReferrerId(referrerId);
        return referralRepo.save(referral);
    }

    public List<OpportunityReferral> getMyReferrals(UUID referrerId) {
        return referralRepo.findByReferrerIdOrderByCreatedAtDesc(referrerId);
    }

    public List<OpportunityReferral> getActiveReferrals() {
        return referralRepo.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    public OpportunityReferral getReferral(UUID referralId) {
        return referralRepo.findById(referralId)
            .orElseThrow(() -> new RuntimeException("Referral not found"));
    }

    public Map<String, Object> trackClick(UUID referralId, UUID studentId) {
        OpportunityReferral referral = referralRepo.findById(referralId)
            .orElseThrow(() -> new RuntimeException("Referral not found"));
        referral.setReferralCount(referral.getReferralCount() + 1);
        if (referral.getReferralLimit() > 0 && referral.getReferralCount() >= referral.getReferralLimit()) {
            referral.setStatus("LIMIT_REACHED");
        }
        referral.setUpdatedAt(OffsetDateTime.now());
        referralRepo.save(referral);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("referral", referral);
        result.put("clickTracked", true);
        return result;
    }

    public OpportunityReferral closeReferral(UUID referralId, UUID referrerId) {
        OpportunityReferral referral = referralRepo.findById(referralId)
            .orElseThrow(() -> new RuntimeException("Referral not found"));
        if (!referral.getReferrerId().equals(referrerId)) throw new RuntimeException("Forbidden");
        referral.setStatus("CLOSED");
        referral.setUpdatedAt(OffsetDateTime.now());
        return referralRepo.save(referral);
    }
}
