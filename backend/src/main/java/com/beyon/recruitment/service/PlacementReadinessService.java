package com.beyon.recruitment.service;

import com.beyon.recruitment.model.PlacementReadinessScore;
import com.beyon.recruitment.repository.PlacementReadinessScoreRepository;
import com.beyon.intelligence.model.StudentSkillGraph;
import com.beyon.intelligence.repository.StudentSkillGraphRepository;
import com.beyon.intelligence.model.StudentPortfolioItem;
import com.beyon.intelligence.repository.StudentPortfolioItemRepository;
import com.beyon.recruitment.model.InterviewFeedbackIntelligence;
import com.beyon.recruitment.repository.InterviewFeedbackIntelligenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class PlacementReadinessService {

    private final PlacementReadinessScoreRepository readinessRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final StudentPortfolioItemRepository portfolioRepo;
    private final InterviewFeedbackIntelligenceRepository feedbackRepo;

    public PlacementReadinessService(PlacementReadinessScoreRepository readinessRepo,
                                      StudentSkillGraphRepository graphRepo,
                                      StudentPortfolioItemRepository portfolioRepo,
                                      InterviewFeedbackIntelligenceRepository feedbackRepo) {
        this.readinessRepo = readinessRepo;
        this.graphRepo = graphRepo;
        this.portfolioRepo = portfolioRepo;
        this.feedbackRepo = feedbackRepo;
    }

    public Map<String, Object> calculateAndSave(UUID studentId) {
        PlacementReadinessScore score = readinessRepo.findByStudentId(studentId)
            .orElseGet(() -> {
                PlacementReadinessScore s = new PlacementReadinessScore();
                s.setStudentId(studentId);
                return s;
            });

        // Skills score (from skill graph)
        List<StudentSkillGraph> skills = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);
        BigDecimal skillsScore = BigDecimal.ZERO;
        if (!skills.isEmpty()) {
            double avg = skills.stream().mapToDouble(s -> s.getProficiencyPct().doubleValue()).average().orElse(0);
            long verified = skills.stream().filter(StudentSkillGraph::getVerified).count();
            double verifiedBonus = Math.min(20, verified * 5);
            skillsScore = BigDecimal.valueOf(Math.min(100, avg + verifiedBonus)).setScale(2, RoundingMode.HALF_UP);
        }
        score.setSkillsScore(skillsScore);

        // Practice score (from evidence count)
        int totalEvidence = skills.stream().mapToInt(StudentSkillGraph::getEvidenceCount).sum();
        BigDecimal practiceScore = BigDecimal.valueOf(Math.min(100, totalEvidence * 2)).setScale(2, RoundingMode.HALF_UP);
        score.setPracticeScore(practiceScore);

        // Projects score
        List<StudentPortfolioItem> items = portfolioRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        long projectCount = items.stream().filter(i -> "PROJECT".equals(i.getItemType())).count();
        long certCount = items.stream().filter(i -> "CERTIFICATION".equals(i.getItemType())).count();
        long verifiedItems = items.stream().filter(StudentPortfolioItem::getVerified).count();
        BigDecimal projectsScore = BigDecimal.valueOf(Math.min(100, projectCount * 20 + verifiedItems * 10)).setScale(2, RoundingMode.HALF_UP);
        score.setProjectsScore(projectsScore);

        BigDecimal certScore = BigDecimal.valueOf(Math.min(100, certCount * 25)).setScale(2, RoundingMode.HALF_UP);
        score.setCertificationsScore(certScore);

        // Interview score (from feedback)
        List<InterviewFeedbackIntelligence> feedbacks = feedbackRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        BigDecimal interviewScore = BigDecimal.ZERO;
        if (!feedbacks.isEmpty()) {
            double avg = feedbacks.stream().mapToInt(InterviewFeedbackIntelligence::getOverallRating).average().orElse(0);
            interviewScore = BigDecimal.valueOf(avg * 20).setScale(2, RoundingMode.HALF_UP);
        }
        score.setInterviewScore(interviewScore);

        // Assessments score (placeholder)
        BigDecimal assessmentsScore = skills.isEmpty() ? BigDecimal.ZERO : BigDecimal.valueOf(60).setScale(2, RoundingMode.HALF_UP);
        score.setAssessmentsScore(assessmentsScore);

        // Overall: weighted average
        BigDecimal overall = skillsScore.multiply(new BigDecimal("0.25"))
            .add(practiceScore.multiply(new BigDecimal("0.15")))
            .add(projectsScore.multiply(new BigDecimal("0.20")))
            .add(certScore.multiply(new BigDecimal("0.10")))
            .add(interviewScore.multiply(new BigDecimal("0.15")))
            .add(assessmentsScore.multiply(new BigDecimal("0.15")))
            .setScale(2, RoundingMode.HALF_UP);
        score.setOverallScore(overall);

        // Recommendations
        List<Map<String, String>> recs = new ArrayList<>();
        if (skillsScore.doubleValue() < 60) recs.add(Map.of("area", "Skills", "action", "Practice more questions to strengthen your skill graph"));
        if (projectsScore.doubleValue() < 40) recs.add(Map.of("area", "Projects", "action", "Add projects to your portfolio"));
        if (certScore.doubleValue() < 40) recs.add(Map.of("area", "Certifications", "action", "Take certification assessments"));
        if (interviewScore.doubleValue() < 40) recs.add(Map.of("area", "Interview", "action", "Practice mock interviews"));
        score.setRecommendations(new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(recs).toString());
        score.setCalculatedAt(OffsetDateTime.now());
        score.setUpdatedAt(OffsetDateTime.now());
        readinessRepo.save(score);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("overallScore", score.getOverallScore());
        result.put("skillsScore", score.getSkillsScore());
        result.put("practiceScore", score.getPracticeScore());
        result.put("projectsScore", score.getProjectsScore());
        result.put("certificationsScore", score.getCertificationsScore());
        result.put("interviewScore", score.getInterviewScore());
        result.put("assessmentsScore", score.getAssessmentsScore());
        result.put("recommendations", recs);
        result.put("calculatedAt", score.getCalculatedAt());
        return result;
    }

    public Optional<PlacementReadinessScore> getMyScore(UUID studentId) {
        return readinessRepo.findByStudentId(studentId);
    }
}
