package com.beyon.practice.repository;

import com.beyon.practice.model.QuestionTestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionTestCaseRepository extends JpaRepository<QuestionTestCase, UUID> {
    List<QuestionTestCase> findByQuestionIdOrderByDisplayOrder(UUID questionId);
    List<QuestionTestCase> findByQuestionIdAndSampleTrue(UUID questionId);
    List<QuestionTestCase> findByQuestionIdAndHiddenFalse(UUID questionId);
}
