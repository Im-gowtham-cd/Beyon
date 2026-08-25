package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import com.beyon.assessment.model.AssessmentSession;
import com.beyon.assessment.model.AssessmentAnswer;
import com.beyon.assessment.repository.AssessmentSessionRepository;
import com.beyon.assessment.repository.AssessmentAnswerRepository;
import com.beyon.profile.model.Skill;
import com.beyon.profile.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class EvaluationService {

    private final AssessmentSkillScoreRepository skillScoreRepo;
    private final StudentSkillIntelligenceRepository skillIntelRepo;
    private final AssessmentSessionRepository sessionRepo;
    private final AssessmentAnswerRepository answerRepo;
    private final SkillRepository skillRepo;

    public EvaluationService(AssessmentSkillScoreRepository skillScoreRepo, StudentSkillIntelligenceRepository skillIntelRepo,
                             AssessmentSessionRepository sessionRepo, AssessmentAnswerRepository answerRepo, SkillRepository skillRepo) {
        this.skillScoreRepo = skillScoreRepo;
        this.skillIntelRepo = skillIntelRepo;
        this.sessionRepo = sessionRepo;
        this.answerRepo = answerRepo;
        this.skillRepo = skillRepo;
    }

    public List<AssessmentSkillScore> evaluateSession(UUID sessionId) {
        AssessmentSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        List<AssessmentAnswer> answers = answerRepo.findBySessionIdOrderByCreatedAt(sessionId);
        if (answers.isEmpty()) return List.of();

        Map<UUID, List<AssessmentAnswer>> bySkill = new LinkedHashMap<>();
        for (AssessmentAnswer a : answers) {
            UUID skillId = a.getQuestionId();
            bySkill.computeIfAbsent(skillId, k -> new ArrayList<>()).add(a);
        }

        List<AssessmentSkillScore> scores = new ArrayList<>();
        for (Map.Entry<UUID, List<AssessmentAnswer>> entry : bySkill.entrySet()) {
            List<AssessmentAnswer> skillAnswers = entry.getValue();
            long attempted = skillAnswers.size();
            long correct = skillAnswers.stream().filter(a -> Boolean.TRUE.equals(a.getIsCorrect())).count();
            int totalTime = skillAnswers.stream().mapToInt(a -> a.getTimeSpentSeconds() != null ? a.getTimeSpentSeconds() : 0).sum();
            BigDecimal accuracy = attempted > 0
                ? BigDecimal.valueOf(correct).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(attempted), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
            BigDecimal score = accuracy.multiply(new BigDecimal("0.8")).add(new BigDecimal("0.2").multiply(BigDecimal.valueOf(Math.max(0, 100 - totalTime / Math.max(1, (int)attempted)))));
            score = score.min(new BigDecimal("100")).max(BigDecimal.ZERO);

            AssessmentSkillScore ss = new AssessmentSkillScore();
            ss.setSessionId(sessionId);
            ss.setStudentId(session.getStudentId());
            ss.setSkillId(entry.getKey());
            ss.setScore(score.setScale(2, RoundingMode.HALF_UP));
            ss.setAccuracy(accuracy);
            ss.setQuestionsAttempted((int) attempted);
            ss.setQuestionsCorrect((int) correct);
            ss.setTimeSpentSeconds(totalTime);
            scores.add(skillScoreRepo.save(ss));
        }
        return scores;
    }

    public void updateSkillIntelligence(UUID studentId, UUID skillId) {
        List<AssessmentSkillScore> scores = skillScoreRepo.findByStudentIdAndSkillIdOrderByCreatedAtDesc(studentId, skillId);
        StudentSkillIntelligence intel = skillIntelRepo.findByStudentIdAndSkillId(studentId, skillId)
                .orElseGet(() -> {
                    StudentSkillIntelligence i = new StudentSkillIntelligence();
                    i.setStudentId(studentId);
                    i.setSkillId(skillId);
                    return i;
                });

        int totalAttempted = scores.stream().mapToInt(AssessmentSkillScore::getQuestionsAttempted).sum();
        int totalCorrect = scores.stream().mapToInt(AssessmentSkillScore::getQuestionsCorrect).sum();
        BigDecimal avgAccuracy = totalAttempted > 0
            ? BigDecimal.valueOf(totalCorrect).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(totalAttempted), 1, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        BigDecimal avgScore = scores.isEmpty() ? BigDecimal.ZERO
            : scores.stream().map(AssessmentSkillScore::getScore).reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP);

        String level;
        if (avgScore.compareTo(new BigDecimal("90")) >= 0) level = "EXPERT";
        else if (avgScore.compareTo(new BigDecimal("75")) >= 0) level = "ADVANCED";
        else if (avgScore.compareTo(new BigDecimal("55")) >= 0) level = "INTERMEDIATE";
        else if (avgScore.compareTo(new BigDecimal("30")) >= 0) level = "ELEMENTARY";
        else level = "BEGINNER";

        BigDecimal confidence = avgScore.multiply(new BigDecimal("0.6"))
            .add(avgAccuracy.multiply(new BigDecimal("0.2")))
            .add(BigDecimal.valueOf(Math.min(100, scores.size() * 10)).multiply(new BigDecimal("0.2")))
            .setScale(2, RoundingMode.HALF_UP);

        intel.setProficiencyLevel(level);
        intel.setConfidenceScore(confidence);
        intel.setTotalQuestionsSolved(totalAttempted);
        intel.setAccuracy(avgAccuracy);
        intel.setAssessmentCount(scores.size());
        intel.setEvidenceCount(scores.size());
        intel.setLastAssessedAt(OffsetDateTime.now());
        intel.setUpdatedAt(OffsetDateTime.now());
        skillIntelRepo.save(intel);
    }
}
