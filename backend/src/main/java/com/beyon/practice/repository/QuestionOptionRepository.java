package com.beyon.practice.repository;

import com.beyon.practice.model.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionOptionRepository extends JpaRepository<QuestionOption, UUID> {
    List<QuestionOption> findByQuestionId(UUID questionId);
    List<QuestionOption> findByQuestionIdOrderByDisplayOrder(UUID questionId);
    List<QuestionOption> findByQuestionIdIn(List<UUID> questionIds);
}
