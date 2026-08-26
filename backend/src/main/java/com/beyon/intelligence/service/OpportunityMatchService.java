package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import com.beyon.profile.model.Skill;
import com.beyon.profile.repository.SkillRepository;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class OpportunityMatchService {

    private final OpportunityMatchDetailRepository matchRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final CompanyOpportunityRepository opportunityRepo;
    private final SkillRepository skillRepo;

    public OpportunityMatchService(OpportunityMatchDetailRepository matchRepo,
                                    StudentSkillGraphRepository graphRepo,
                                    CompanyOpportunityRepository opportunityRepo,
                                    SkillRepository skillRepo) {
        this.matchRepo = matchRepo;
        this.graphRepo = graphRepo;
        this.opportunityRepo = opportunityRepo;
        this.skillRepo = skillRepo;
    }

    public Map<String, Object> calculateMatch(UUID studentId, UUID opportunityId) {
        Optional<OpportunityMatchDetail> existing = matchRepo.findByStudentIdAndOpportunityId(studentId, opportunityId);
        if (existing.isPresent()) {
            return buildMatchResponse(existing.get());
        }

        CompanyOpportunity opportunity = opportunityRepo.findById(opportunityId)
            .orElseThrow(() -> new RuntimeException("Opportunity not found"));
        List<StudentSkillGraph> studentSkills = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);

        // Skill matching
        BigDecimal skillMatch = calculateSkillMatch(studentSkills, opportunity);
        boolean eligibilityMet = true;
        boolean experienceMet = true;
        boolean certificationMet = true;
        boolean coinRequirementMet = true;

        // Build match factors
        List<Map<String, Object>> factors = new ArrayList<>();
        List<Map<String, Object>> strengths = new ArrayList<>();
        List<Map<String, Object>> gaps = new ArrayList<>();

        // Check required skills
        String requiredSkillsStr = opportunity.getRequiredSkills();
        if (requiredSkillsStr != null && !requiredSkillsStr.isEmpty()) {
            String[] required = requiredSkillsStr.split(",");
            for (String req : required) {
                String skillName = req.trim();
                boolean found = studentSkills.stream().anyMatch(s -> {
                    Skill skill = skillRepo.findById(s.getSkillId()).orElse(null);
                    return skill != null && skill.getName().equalsIgnoreCase(skillName);
                });
                Map<String, Object> factor = new LinkedHashMap<>();
                factor.put("skill", skillName);
                factor.put("met", found);
                factors.add(factor);
                if (found) {
                    strengths.add(Map.of("type", "skill", "message", "Strong " + skillName + " skills"));
                } else {
                    gaps.add(Map.of("type", "skill", "message", "Missing " + skillName + " skills"));
                }
            }
        }

        // Calculate overall match
        BigDecimal overall = skillMatch.multiply(new BigDecimal("0.5"))
            .add(BigDecimal.valueOf(eligibilityMet ? 80 : 0))
            .add(BigDecimal.valueOf(experienceMet ? 60 : 0))
            .multiply(new BigDecimal("0.5"))
            .min(BigDecimal.valueOf(100));

        OpportunityMatchDetail detail = new OpportunityMatchDetail();
        detail.setStudentId(studentId);
        detail.setOpportunityId(opportunityId);
        detail.setOverallMatch(overall);
        detail.setSkillMatch(skillMatch);
        detail.setEligibilityMet(eligibilityMet);
        detail.setExperienceMet(experienceMet);
        detail.setCertificationMet(certificationMet);
        detail.setCoinRequirementMet(coinRequirementMet);
        detail = matchRepo.save(detail);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("match", detail);
        result.put("factors", factors);
        result.put("strengths", strengths);
        result.put("gaps", gaps);
        result.put("opportunity", Map.of("title", opportunity.getTitle(), "company", opportunity.getCompanyUserId() != null ? opportunity.getCompanyUserId().toString().substring(0, 8) : "Unknown"));
        return result;
    }

    public List<Map<String, Object>> getMyMatches(UUID studentId) {
        List<StudentSkillGraph> skills = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        List<CompanyOpportunity> opportunities = opportunityRepo.findByStatusOrderByCreatedAtDesc("ACTIVE");

        return opportunities.stream().map(opp -> {
            BigDecimal skillMatch = calculateSkillMatch(skills, opp);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("opportunityId", opp.getId());
            m.put("title", opp.getTitle());
            m.put("company", opp.getCompanyUserId() != null ? opp.getCompanyUserId().toString().substring(0, 8) : "Unknown");
            m.put("skillMatch", skillMatch);
            m.put("overallMatch", skillMatch);
            return m;
        })
        .sorted((a, b) -> ((BigDecimal) b.get("overallMatch")).compareTo((BigDecimal) a.get("overallMatch")))
        .limit(20)
        .collect(Collectors.toList());
    }

    private BigDecimal calculateSkillMatch(List<StudentSkillGraph> studentSkills, CompanyOpportunity opportunity) {
        String requiredSkillsStr = opportunity.getRequiredSkills();
        if (requiredSkillsStr == null || requiredSkillsStr.isEmpty()) return BigDecimal.valueOf(80);

        String[] required = requiredSkillsStr.split(",");
        if (required.length == 0) return BigDecimal.valueOf(80);

        int matched = 0;
        for (String req : required) {
            String skillName = req.trim().toLowerCase();
            boolean found = studentSkills.stream().anyMatch(s -> {
                Skill skill = skillRepo.findById(s.getSkillId()).orElse(null);
                return skill != null && skill.getName().toLowerCase().contains(skillName);
            });
            if (found) matched++;
        }

        return BigDecimal.valueOf(matched * 100 / required.length);
    }

    private Map<String, Object> buildMatchResponse(OpportunityMatchDetail detail) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("match", detail);
        return result;
    }
}
