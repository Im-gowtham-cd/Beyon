package com.beyon.recruitment.service;

import com.beyon.recruitment.model.CompanyTierProfile;
import com.beyon.recruitment.model.PlacementRecord;
import com.beyon.recruitment.repository.CompanyTierProfileRepository;
import com.beyon.recruitment.repository.PlacementRecordRepository;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class CompanyTierService {

    private final CompanyTierProfileRepository tierRepo;
    private final PlacementRecordRepository recordRepo;
    private final CompanyOpportunityRepository opportunityRepo;

    public CompanyTierService(CompanyTierProfileRepository tierRepo,
                               PlacementRecordRepository recordRepo,
                               CompanyOpportunityRepository opportunityRepo) {
        this.tierRepo = tierRepo;
        this.recordRepo = recordRepo;
        this.opportunityRepo = opportunityRepo;
    }

    public Map<String, Object> calculateAndSave(UUID companyId) {
        CompanyTierProfile profile = tierRepo.findByCompanyUserId(companyId)
            .orElseGet(() -> {
                CompanyTierProfile p = new CompanyTierProfile();
                p.setCompanyUserId(companyId);
                return p;
            });

        List<PlacementRecord> records = recordRepo.findByCompanyUserIdAndPlacementYear(companyId, OffsetDateTime.now().getYear());
        long placed = records.stream().filter(r -> "PLACED".equals(r.getStatus()) && r.getVerified()).count();
        profile.setHiringCount((int) placed);

        // Average package
        BigDecimal avgPkg = records.stream()
            .filter(r -> r.getCtcAmount() != null)
            .map(PlacementRecord::getCtcAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (placed > 0) {
            profile.setAveragePackage(avgPkg.divide(BigDecimal.valueOf(placed), 2, RoundingMode.HALF_UP));
        }

        // Tier calculation
        String tier = calculateTier(profile);
        profile.setTier(tier);
        profile.setCalculationVersion(profile.getCalculationVersion() + 1);
        profile.setLastCalculatedAt(OffsetDateTime.now());
        profile.setUpdatedAt(OffsetDateTime.now());
        tierRepo.save(profile);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("companyUserId", companyId);
        result.put("tier", tier);
        result.put("hiringCount", profile.getHiringCount());
        result.put("averagePackage", profile.getAveragePackage());
        result.put("calculationVersion", profile.getCalculationVersion());
        return result;
    }

    public Optional<CompanyTierProfile> getProfile(UUID companyId) {
        return tierRepo.findByCompanyUserId(companyId);
    }

    private String calculateTier(CompanyTierProfile profile) {
        int score = 0;
        if (profile.getAveragePackage() != null) {
            if (profile.getAveragePackage().compareTo(new BigDecimal("15")) >= 0) score += 4;
            else if (profile.getAveragePackage().compareTo(new BigDecimal("8")) >= 0) score += 3;
            else if (profile.getAveragePackage().compareTo(new BigDecimal("4")) >= 0) score += 2;
            else score += 1;
        }
        if (profile.getHiringCount() >= 50) score += 3;
        else if (profile.getHiringCount() >= 10) score += 2;
        else if (profile.getHiringCount() >= 1) score += 1;

        if (score >= 6) return "TIER_1";
        if (score >= 4) return "TIER_2";
        if (score >= 2) return "TIER_3";
        return "STARTUP";
    }
}
