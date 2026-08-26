package com.beyon.intelligence.service;

import com.beyon.intelligence.model.CompanyRequirement;
import com.beyon.intelligence.repository.CompanyRequirementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class CompanyRequirementService {
    private final CompanyRequirementRepository reqRepo;

    public CompanyRequirementService(CompanyRequirementRepository reqRepo) {
        this.reqRepo = reqRepo;
    }

    public CompanyRequirement create(UUID companyId, UUID opportunityId, String title, String description,
                                      String requiredSkills, String preferredSkills, BigDecimal minCgpa,
                                      Integer minExperience, Integer coinCost) {
        CompanyRequirement req = new CompanyRequirement();
        req.setCompanyId(companyId);
        req.setOpportunityId(opportunityId);
        req.setTitle(title);
        req.setDescription(description);
        req.setRequiredSkills(requiredSkills != null ? requiredSkills : "[]");
        req.setPreferredSkills(preferredSkills != null ? preferredSkills : "[]");
        req.setMinCgpa(minCgpa);
        req.setMinExperienceYears(minExperience != null ? minExperience : 0);
        req.setCoinCost(coinCost != null ? coinCost : 0);
        req.setStatus("PUBLISHED");
        return reqRepo.save(req);
    }

    public List<CompanyRequirement> getByCompany(UUID companyId) {
        return reqRepo.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    public CompanyRequirement getById(UUID id) {
        return reqRepo.findById(id).orElseThrow();
    }

    public CompanyRequirement getByOpportunity(UUID opportunityId) {
        return reqRepo.findByOpportunityId(opportunityId).stream().findFirst().orElse(null);
    }

    public Map<String, Object> checkEligibility(UUID requirementId, BigDecimal studentCgpa, int experienceYears, List<String> studentSkills) {
        CompanyRequirement req = getById(requirementId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("eligible", true);
        result.put("checks", new ArrayList<>());

        List<Map<String, Object>> checks = new ArrayList<>();

        if (req.getMinCgpa() != null) {
            boolean cgpaMet = studentCgpa != null && studentCgpa.compareTo(req.getMinCgpa()) >= 0;
            checks.add(Map.of("rule", "CGPA", "required", req.getMinCgpa(), "actual", studentCgpa != null ? studentCgpa : "N/A", "met", cgpaMet));
            if (!cgpaMet) result.put("eligible", false);
        }

        if (req.getMinExperienceYears() > 0) {
            boolean expMet = experienceYears >= req.getMinExperienceYears();
            checks.add(Map.of("rule", "Experience", "required", req.getMinExperienceYears(), "actual", experienceYears, "met", expMet));
            if (!expMet) result.put("eligible", false);
        }

        result.put("checks", checks);
        return result;
    }
}
