package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import com.beyon.profile.repository.StudentProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class PortfolioAnalysisService {

    private final PortfolioAnalysisRepository analysisRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final StudentPortfolioItemRepository portfolioRepo;
    private final StudentProjectRepository projectRepo;

    public PortfolioAnalysisService(PortfolioAnalysisRepository analysisRepo,
                                     StudentSkillGraphRepository graphRepo,
                                     StudentPortfolioItemRepository portfolioRepo,
                                     StudentProjectRepository projectRepo) {
        this.analysisRepo = analysisRepo;
        this.graphRepo = graphRepo;
        this.portfolioRepo = portfolioRepo;
        this.projectRepo = projectRepo;
    }

    public Map<String, Object> analyze(UUID studentId) {
        List<StudentSkillGraph> skills = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        List<StudentPortfolioItem> items = portfolioRepo.findByStudentIdOrderByCreatedAtDesc(studentId);

        long projectCount = items.stream().filter(i -> "PROJECT".equals(i.getItemType())).count();
        long certCount = items.stream().filter(i -> "CERTIFICATION".equals(i.getItemType())).count();
        long verifiedCount = items.stream().filter(StudentPortfolioItem::getVerified).count();

        BigDecimal skillCoverage = calculateSkillCoverage(skills);
        BigDecimal projectStrength = calculateProjectStrength(projectCount);
        BigDecimal certStrength = calculateCertStrength(certCount);
        BigDecimal completeness = calculateCompleteness(skills, items);
        BigDecimal overall = skillCoverage.multiply(new BigDecimal("0.35"))
            .add(projectStrength.multiply(new BigDecimal("0.30")))
            .add(certStrength.multiply(new BigDecimal("0.20")))
            .add(completeness.multiply(new BigDecimal("0.15")));

        List<Map<String, Object>> recommendations = new ArrayList<>();
        List<Map<String, Object>> missing = new ArrayList<>();

        if (projectCount == 0) {
            missing.add(Map.of("type", "PROJECT", "message", "Add at least one project to your portfolio"));
            recommendations.add(Map.of("type", "PROJECT", "priority", "HIGH", "action", "Create a project showcasing your skills"));
        }
        if (certCount == 0) {
            missing.add(Map.of("type", "CERTIFICATION", "message", "Earn a certification to verify your skills"));
            recommendations.add(Map.of("type", "CERTIFICATION", "priority", "HIGH", "action", "Take a certification assessment"));
        }
        if (verifiedCount == 0) {
            missing.add(Map.of("type", "VERIFICATION", "message", "Get your skills verified through assessments"));
            recommendations.add(Map.of("type", "VERIFICATION", "priority", "MEDIUM", "action", "Complete skill assessments"));
        }
        long weakSkills = skills.stream().filter(s -> s.getProficiencyPct().doubleValue() < 50).count();
        if (weakSkills > 2) {
            missing.add(Map.of("type", "SKILL_STRENGTH", "message", "Strengthen your weaker skills"));
            recommendations.add(Map.of("type", "SKILL_STRENGTH", "priority", "MEDIUM", "action", "Practice daily to improve weak areas"));
        }

        PortfolioAnalysis analysis = new PortfolioAnalysis();
        analysis.setStudentId(studentId);
        analysis.setOverallScore(overall);
        analysis.setCompleteness(completeness);
        analysis.setSkillCoverage(skillCoverage);
        analysis.setProjectStrength(projectStrength);
        analysis.setCertificationStrength(certStrength);
        analysis.setAnalyzedAt(OffsetDateTime.now());
        analysis = analysisRepo.save(analysis);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("analysis", analysis);
        result.put("skillCount", skills.size());
        result.put("projectCount", projectCount);
        result.put("certificationCount", certCount);
        result.put("verifiedCount", verifiedCount);
        result.put("portfolioItemCount", items.size());
        result.put("recommendations", recommendations);
        result.put("missingItems", missing);
        return result;
    }

    private BigDecimal calculateSkillCoverage(List<StudentSkillGraph> skills) {
        if (skills.isEmpty()) return BigDecimal.ZERO;
        long strong = skills.stream().filter(s -> s.getProficiencyPct().doubleValue() >= 60).count();
        return BigDecimal.valueOf(strong * 100 / Math.max(1, skills.size()));
    }

    private BigDecimal calculateProjectStrength(long count) {
        if (count >= 5) return BigDecimal.valueOf(100);
        if (count >= 3) return BigDecimal.valueOf(75);
        if (count >= 1) return BigDecimal.valueOf(50);
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateCertStrength(long count) {
        if (count >= 3) return BigDecimal.valueOf(100);
        if (count >= 1) return BigDecimal.valueOf(60);
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateCompleteness(List<StudentSkillGraph> skills, List<StudentPortfolioItem> items) {
        int score = 0;
        if (!skills.isEmpty()) score += 25;
        if (skills.stream().anyMatch(s -> s.getVerified())) score += 25;
        if (items.stream().anyMatch(i -> "PROJECT".equals(i.getItemType()))) score += 25;
        if (items.stream().anyMatch(i -> "CERTIFICATION".equals(i.getItemType()))) score += 25;
        return BigDecimal.valueOf(score);
    }
}
