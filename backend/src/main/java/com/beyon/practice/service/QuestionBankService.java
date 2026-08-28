package com.beyon.practice.service;

import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.practice.model.*;
import com.beyon.practice.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class QuestionBankService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final QuestionTestCaseRepository testCaseRepository;

    public QuestionBankService(QuestionRepository questionRepository,
                                QuestionOptionRepository optionRepository,
                                QuestionTestCaseRepository testCaseRepository) {
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.testCaseRepository = testCaseRepository;
    }

    public List<Question> getPublishedQuestions(int page, int size) {
        return questionRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", PageRequest.of(page, size));
    }

    public List<Question> getQuestionsBySkill(UUID skillId, int limit) {
        return questionRepository.findBySkillIdPublished(skillId, PageRequest.of(0, limit));
    }

    public List<Question> getQuestionsByTopic(UUID topicId, int limit) {
        return questionRepository.findByTopicIdPublished(topicId, PageRequest.of(0, limit));
    }

    public List<Question> getQuestionsByDifficulty(String difficulty, int limit) {
        return questionRepository.findByDifficultyPublished(difficulty, PageRequest.of(0, limit));
    }

    public List<Question> searchQuestions(String query, int limit) {
        return questionRepository.searchPublished(query, PageRequest.of(0, limit));
    }

    public List<Question> getQuestionsBySkillAndDifficulty(UUID skillId, String difficulty, int limit) {
        return questionRepository.findBySkillAndDifficulty(skillId, difficulty, PageRequest.of(0, limit));
    }

    public Question getQuestion(UUID id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
    }

    public List<QuestionOption> getOptions(UUID questionId) {
        return optionRepository.findByQuestionIdOrderByDisplayOrder(questionId);
    }

    public List<QuestionTestCase> getTestCases(UUID questionId) {
        return testCaseRepository.findByQuestionIdAndHiddenFalse(questionId);
    }

    public List<QuestionTestCase> getSampleTestCases(UUID questionId) {
        return testCaseRepository.findByQuestionIdAndSampleTrue(questionId);
    }

    public List<Question> getUnsolvedForStudent(UUID studentId, int limit) {
        return questionRepository.findUnsolvedForStudent(studentId, PageRequest.of(0, limit));
    }

    @Transactional
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    @Transactional
    public Question createFullQuestion(Question question, List<QuestionOption> options, List<QuestionTestCase> testCases) {
        if (question.getStatus() == null) question.setStatus("ACTIVE");
        Question saved = questionRepository.save(question);
        if (options != null) {
            int order = 1;
            for (QuestionOption opt : options) {
                opt.setQuestionId(saved.getId());
                opt.setDisplayOrder(order++);
                optionRepository.save(opt);
            }
        }
        if (testCases != null) {
            for (QuestionTestCase tc : testCases) {
                tc.setQuestionId(saved.getId());
                testCaseRepository.save(tc);
            }
        }
        return saved;
    }

    @Transactional
    public Question updateQuestion(UUID id, Question update, UUID userId) {
        Question question = getQuestion(id);
        if (question.getCreatedBy() != null && !question.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("Cannot modify another user's question");
        }
        if (update.getTitle() != null) question.setTitle(update.getTitle());
        if (update.getDescription() != null) question.setDescription(update.getDescription());
        if (update.getQuestionType() != null) question.setQuestionType(update.getQuestionType());
        if (update.getDifficulty() != null) question.setDifficulty(update.getDifficulty());
        if (update.getExpectedOutput() != null) question.setExpectedOutput(update.getExpectedOutput());
        if (update.getCodeTemplate() != null) question.setCodeTemplate(update.getCodeTemplate());
        if (update.getSolution() != null) question.setSolution(update.getSolution());
        if (update.getExplanation() != null) question.setExplanation(update.getExplanation());
        if (update.getTags() != null) question.setTags(update.getTags());
        if (update.getStatus() != null) question.setStatus(update.getStatus());
        question.setVersion(question.getVersion() + 1);
        return questionRepository.save(question);
    }

    public long countPublished() {
        return questionRepository.countPublished();
    }

    public long countByDifficulty(String difficulty) {
        return questionRepository.countPublishedByDifficulty(difficulty);
    }
}
