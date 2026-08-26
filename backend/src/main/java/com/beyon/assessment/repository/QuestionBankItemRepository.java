package com.beyon.assessment.repository;

import com.beyon.assessment.model.QuestionBankItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface QuestionBankItemRepository extends JpaRepository<QuestionBankItem, UUID> {
    List<QuestionBankItem> findByCreatorIdAndIsActiveTrueOrderByCreatedAtDesc(UUID creatorId);
    List<QuestionBankItem> findByIsActiveTrueOrderByCreatedAtDesc();
    List<QuestionBankItem> findByDifficultyAndIsActiveTrue(String difficulty);
    List<QuestionBankItem> findBySkillIdAndIsActiveTrue(UUID skillId);
    List<QuestionBankItem> findByQuestionTypeAndIsActiveTrue(String questionType);
    long countByCreatorIdAndIsActiveTrue(UUID creatorId);
    long countByIsActiveTrue();
}
