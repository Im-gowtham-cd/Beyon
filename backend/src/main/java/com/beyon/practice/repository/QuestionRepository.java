package com.beyon.practice.repository;

import com.beyon.practice.model.Question;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findByStatusInOrderByCreatedAtDesc(List<String> statuses, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.status = :status ORDER BY q.createdAt DESC")
    List<Question> findByStatusOrderByCreatedAtDesc(@Param("status") String status, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.skillId = :skillId ORDER BY q.createdAt DESC")
    List<Question> findBySkillIdPublished(@Param("skillId") UUID skillId, Pageable pageable);

    List<Question> findBySkillId(UUID skillId);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.topicId = :topicId ORDER BY q.createdAt DESC")
    List<Question> findByTopicIdPublished(@Param("topicId") UUID topicId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.difficulty = :difficulty ORDER BY q.createdAt DESC")
    List<Question> findByDifficultyPublished(@Param("difficulty") String difficulty, Pageable pageable);

    List<Question> findByStatusInAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(List<String> statuses, String title, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.skillId = :skillId AND q.difficulty = :difficulty")
    List<Question> findBySkillAndDifficulty(@Param("skillId") UUID skillId, @Param("difficulty") String difficulty, Pageable pageable);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.status = 'PUBLISHED' OR q.status = 'ACTIVE'")
    long countPublished();

    @Query("SELECT COUNT(q) FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.difficulty = :difficulty")
    long countPublishedByDifficulty(@Param("difficulty") String difficulty);

    @Query("SELECT COUNT(q) FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.difficulty IN :difficulties")
    long countPublishedByDifficultyIn(@Param("difficulties") List<String> difficulties);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.id NOT IN (SELECT a.questionId FROM StudentQuestionAttempt a WHERE a.studentId = :studentId) ORDER BY FUNCTION('RAND')")
    List<Question> findUnsolvedForStudent(@Param("studentId") UUID studentId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.skillId = :skillId AND q.id NOT IN (SELECT a.questionId FROM StudentQuestionAttempt a WHERE a.studentId = :studentId)")
    List<Question> findUnattemptedBySkillIdForStudent(@Param("skillId") UUID skillId, @Param("studentId") UUID studentId);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.skillId = :skillId")
    List<Question> findBySkillIdActive(@Param("skillId") UUID skillId);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.id NOT IN (SELECT a.questionId FROM StudentQuestionAttempt a WHERE a.studentId = :studentId)")
    List<Question> findUnattemptedGeneralForStudent(@Param("studentId") UUID studentId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.topicId = :topicId AND q.id NOT IN (SELECT a.questionId FROM StudentQuestionAttempt a WHERE a.studentId = :studentId)")
    List<Question> findUnattemptedByTopicIdForStudent(@Param("topicId") UUID topicId, @Param("studentId") UUID studentId);

    @Query("SELECT q FROM Question q WHERE (q.status = 'PUBLISHED' OR q.status = 'ACTIVE') AND q.skillId = :skillId AND (LOWER(q.tags) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(q.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND q.id NOT IN (SELECT a.questionId FROM StudentQuestionAttempt a WHERE a.studentId = :studentId)")
    List<Question> findUnattemptedBySkillIdAndKeywordForStudent(@Param("skillId") UUID skillId, @Param("keyword") String keyword, @Param("studentId") UUID studentId);

    List<Question> findByTagsContainingOrderByCreatedAtAsc(String tag);
    List<Question> findByCreatedByOrderByCreatedAtDesc(UUID createdBy);
}

