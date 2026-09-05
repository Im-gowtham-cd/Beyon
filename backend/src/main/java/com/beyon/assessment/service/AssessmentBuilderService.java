package com.beyon.assessment.service;

import com.beyon.assessment.model.AssessmentConfiguration;
import com.beyon.assessment.model.QuestionBankItem;
import com.beyon.assessment.repository.AssessmentConfigurationRepository;
import com.beyon.assessment.repository.QuestionBankItemRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class AssessmentBuilderService {
    private final AssessmentConfigurationRepository configRepo;
    private final QuestionBankItemRepository questionRepo;
    private final JdbcTemplate jdbcTemplate;

    public AssessmentBuilderService(AssessmentConfigurationRepository configRepo,
                                    QuestionBankItemRepository questionRepo,
                                    JdbcTemplate jdbcTemplate) {
        this.configRepo = configRepo;
        this.questionRepo = questionRepo;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initTable() {
        try {
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS assessment_configurations (
                    id BINARY(16) PRIMARY KEY,
                    company_id BINARY(16) NOT NULL,
                    title VARCHAR(300) NOT NULL,
                    description TEXT,
                    duration_minutes INT NOT NULL DEFAULT 60,
                    total_questions INT NOT NULL DEFAULT 0,
                    passing_score DECIMAL(5,2) NOT NULL DEFAULT 60.00,
                    negative_marking BOOLEAN NOT NULL DEFAULT FALSE,
                    negative_marks DECIMAL(3,2),
                    randomize_questions BOOLEAN NOT NULL DEFAULT TRUE,
                    randomize_options BOOLEAN NOT NULL DEFAULT FALSE,
                    section_wise_time BOOLEAN NOT NULL DEFAULT FALSE,
                    attempt_limit INT NOT NULL DEFAULT 1,
                    coin_cost INT NOT NULL DEFAULT 0,
                    adaptive_enabled BOOLEAN NOT NULL DEFAULT FALSE,
                    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """);

            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS question_bank (
                    id BINARY(16) PRIMARY KEY,
                    creator_id BINARY(16) NOT NULL,
                    creator_role VARCHAR(30) NOT NULL,
                    topic_id BINARY(16),
                    skill_id BINARY(16),
                    question_type VARCHAR(30) NOT NULL,
                    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
                    question_text TEXT NOT NULL,
                    options TEXT,
                    correct_answer TEXT,
                    explanation TEXT,
                    expected_time_seconds INT DEFAULT 60,
                    score DECIMAL(5,2) NOT NULL DEFAULT 1.00,
                    tags TEXT,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    version INT NOT NULL DEFAULT 1,
                    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """);
        } catch (Exception e) {
            System.err.println("[AssessmentBuilderService] Note on table init: " + e.getMessage());
        }
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
        if (updates.containsKey("title") && updates.get("title") != null) config.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) config.setDescription((String) updates.get("description"));
        if (updates.containsKey("durationMinutes") && updates.get("durationMinutes") != null) {
            config.setDurationMinutes(((Number) updates.get("durationMinutes")).intValue());
        }
        if (updates.containsKey("totalQuestions") && updates.get("totalQuestions") != null) {
            config.setTotalQuestions(((Number) updates.get("totalQuestions")).intValue());
        }
        if (updates.containsKey("passingScore") && updates.get("passingScore") != null) {
            config.setPassingScore(new BigDecimal(updates.get("passingScore").toString()));
        }
        if (updates.containsKey("coinCost") && updates.get("coinCost") != null) {
            config.setCoinCost(((Number) updates.get("coinCost")).intValue());
        }
        if (updates.containsKey("adaptiveEnabled") && updates.get("adaptiveEnabled") != null) {
            config.setAdaptiveEnabled((Boolean) updates.get("adaptiveEnabled"));
        }
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

    public QuestionBankItem updateQuestion(UUID id, Map<String, Object> updates) {
        QuestionBankItem q = questionRepo.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        if (updates.containsKey("questionText") && updates.get("questionText") != null) {
            q.setQuestionText((String) updates.get("questionText"));
        }
        if (updates.containsKey("options") && updates.get("options") != null) {
            q.setOptions((String) updates.get("options"));
        }
        if (updates.containsKey("correctAnswer") && updates.get("correctAnswer") != null) {
            q.setCorrectAnswer((String) updates.get("correctAnswer"));
        }
        if (updates.containsKey("explanation")) {
            q.setExplanation((String) updates.get("explanation"));
        }
        if (updates.containsKey("difficulty") && updates.get("difficulty") != null) {
            q.setDifficulty((String) updates.get("difficulty"));
        }
        if (updates.containsKey("score") && updates.get("score") != null) {
            q.setScore(new BigDecimal(updates.get("score").toString()));
        }
        return questionRepo.save(q);
    }

    public void deleteQuestion(UUID id) {
        questionRepo.findById(id).ifPresent(q -> {
            q.setIsActive(false);
            questionRepo.save(q);
        });
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
