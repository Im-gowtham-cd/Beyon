package com.beyon.assessment.service;

import com.beyon.assessment.model.AssessmentConfiguration;
import com.beyon.assessment.model.QuestionBankItem;
import com.beyon.assessment.repository.AssessmentConfigurationRepository;
import com.beyon.assessment.repository.QuestionBankItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class AssessmentBuilderService {
    private final AssessmentConfigurationRepository configRepo;
    private final QuestionBankItemRepository questionRepo;

    public AssessmentBuilderService(AssessmentConfigurationRepository configRepo, QuestionBankItemRepository questionRepo) {
        this.configRepo = configRepo;
        this.questionRepo = questionRepo;
    }

    public AssessmentConfiguration create(UUID companyId, String title, String description, Integer duration,
                                           Integer totalQuestions, BigDecimal passingScore, Boolean negativeMarking,
                                           BigDecimal negativeMarks, Integer attemptLimit, Integer coinCost,
                                           Boolean adaptiveEnabled) {
        AssessmentConfiguration config = new AssessmentConfiguration();
        config.setCompanyId(companyId);
        config.setTitle(title);
        config.setDescription(description);
        if (duration != null) config.setDurationMinutes(duration);
        if (totalQuestions != null) config.setTotalQuestions(totalQuestions);
        if (passingScore != null) config.setPassingScore(passingScore);
        if (negativeMarking != null) config.setNegativeMarking(negativeMarking);
        if (negativeMarks != null) config.setNegativeMarks(negativeMarks);
        if (attemptLimit != null) config.setAttemptLimit(attemptLimit);
        if (coinCost != null) config.setCoinCost(coinCost);
        if (adaptiveEnabled != null) config.setAdaptiveEnabled(adaptiveEnabled);
        return configRepo.save(config);
    }

    public AssessmentConfiguration update(UUID id, Map<String, Object> updates) {
        AssessmentConfiguration config = configRepo.findById(id).orElseThrow();
        if (updates.containsKey("title")) config.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) config.setDescription((String) updates.get("description"));
        if (updates.containsKey("durationMinutes")) config.setDurationMinutes((Integer) updates.get("durationMinutes"));
        if (updates.containsKey("totalQuestions")) config.setTotalQuestions((Integer) updates.get("totalQuestions"));
        if (updates.containsKey("passingScore")) config.setPassingScore(new BigDecimal(updates.get("passingScore").toString()));
        if (updates.containsKey("coinCost")) config.setCoinCost((Integer) updates.get("coinCost"));
        if (updates.containsKey("adaptiveEnabled")) config.setAdaptiveEnabled((Boolean) updates.get("adaptiveEnabled"));
        return configRepo.save(config);
    }

    public AssessmentConfiguration publish(UUID id) {
        AssessmentConfiguration config = configRepo.findById(id).orElseThrow();
        config.setStatus("PUBLISHED");
        return configRepo.save(config);
    }

    public AssessmentConfiguration unpublish(UUID id) {
        AssessmentConfiguration config = configRepo.findById(id).orElseThrow();
        config.setStatus("DRAFT");
        return configRepo.save(config);
    }

    public List<AssessmentConfiguration> getByCompany(UUID companyId) {
        return configRepo.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    public AssessmentConfiguration getById(UUID id) {
        return configRepo.findById(id).orElseThrow();
    }

    public List<QuestionBankItem> getCompanyQuestions(UUID companyId) {
        return questionRepo.findByCreatorIdAndIsActiveTrueOrderByCreatedAtDesc(companyId);
    }

    public QuestionBankItem createQuestion(UUID creatorId, String creatorRole, String questionType, String difficulty,
                                            String questionText, String options, String correctAnswer, String explanation,
                                            BigDecimal score, UUID skillId) {
        QuestionBankItem q = new QuestionBankItem();
        q.setCreatorId(creatorId);
        q.setCreatorRole(creatorRole);
        q.setQuestionType(questionType);
        q.setDifficulty(difficulty != null ? difficulty : "MEDIUM");
        q.setQuestionText(questionText);
        q.setOptions(options);
        q.setCorrectAnswer(correctAnswer);
        q.setExplanation(explanation);
        if (score != null) q.setScore(score);
        if (skillId != null) q.setSkillId(skillId);
        return questionRepo.save(q);
    }

    public List<QuestionBankItem> searchQuestions(String difficulty, String type, UUID skillId) {
        if (difficulty != null) return questionRepo.findByDifficultyAndIsActiveTrue(difficulty);
        if (type != null) return questionRepo.findByQuestionTypeAndIsActiveTrue(type);
        if (skillId != null) return questionRepo.findBySkillIdAndIsActiveTrue(skillId);
        return questionRepo.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public Map<String, Object> getQuestionBankStats(UUID companyId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", questionRepo.countByCreatorIdAndIsActiveTrue(companyId));
        stats.put("active", questionRepo.countByIsActiveTrue());
        return stats;
    }
}
