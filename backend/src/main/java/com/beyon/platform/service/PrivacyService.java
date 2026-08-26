package com.beyon.platform.service;

import com.beyon.platform.model.ConsentRecord;
import com.beyon.platform.model.UserPrivacySettings;
import com.beyon.platform.repository.ConsentRecordRepository;
import com.beyon.platform.repository.UserPrivacySettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class PrivacyService {
    private final UserPrivacySettingsRepository privacyRepo;
    private final ConsentRecordRepository consentRepo;
    private final AuditService auditService;

    public PrivacyService(UserPrivacySettingsRepository privacyRepo, ConsentRecordRepository consentRepo, AuditService auditService) {
        this.privacyRepo = privacyRepo;
        this.consentRepo = consentRepo;
        this.auditService = auditService;
    }

    public UserPrivacySettings getOrCreateSettings(UUID userId) {
        return privacyRepo.findByUserId(userId).orElseGet(() -> {
            UserPrivacySettings s = new UserPrivacySettings();
            s.setUserId(userId);
            return privacyRepo.save(s);
        });
    }

    public UserPrivacySettings updateSettings(UUID userId, Map<String, Object> updates) {
        UserPrivacySettings s = getOrCreateSettings(userId);
        if (updates.containsKey("profileVisibility")) s.setProfileVisibility((String) updates.get("profileVisibility"));
        if (updates.containsKey("portfolioVisibility")) s.setPortfolioVisibility((String) updates.get("portfolioVisibility"));
        if (updates.containsKey("companyVisibility")) s.setCompanyVisibility((String) updates.get("companyVisibility"));
        if (updates.containsKey("institutionVisibility")) s.setInstitutionVisibility((String) updates.get("institutionVisibility"));
        if (updates.containsKey("assessmentDataSharing")) s.setAssessmentDataSharing((Boolean) updates.get("assessmentDataSharing"));
        s.setUpdatedAt(OffsetDateTime.now());
        return privacyRepo.save(s);
    }

    public void recordConsent(UUID userId, String consentType, boolean granted, String ipAddress, String userAgent) {
        ConsentRecord record = new ConsentRecord();
        record.setUserId(userId);
        record.setConsentType(consentType);
        record.setGranted(granted);
        record.setIpAddress(ipAddress);
        record.setUserAgent(userAgent);
        consentRepo.save(record);
    }

    public boolean hasConsent(UUID userId, String consentType) {
        return consentRepo.findByUserIdAndConsentType(userId, consentType)
            .map(ConsentRecord::getGranted).orElse(false);
    }

    public Map<String, Object> exportUserData(UUID userId) {
        auditService.logDataExport(userId, "FULL_EXPORT");
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("privacySettings", getOrCreateSettings(userId));
        data.put("consentRecords", consentRepo.findByUserId(userId));
        data.put("exportedAt", OffsetDateTime.now().toString());
        return data;
    }

    public void requestDataDeletion(UUID userId, String ipAddress) {
        auditService.logAccountDeletion(userId, ipAddress);
    }
}
