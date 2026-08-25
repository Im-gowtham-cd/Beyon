package com.beyon.practice.repository;

import com.beyon.practice.model.Question;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.status = 'PUBLISHED' AND q.skillId = :skillId ORDER BY q.createdAt DESC")
    List<Question> findBySkillIdPublished(@Param("skillId") UUID skillId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.status = 'PUBLISHED' AND q.topicId = :topicId ORDER BY q.createdAt DESC")
    List<Question> findByTopicIdPublished(@Param("topicId") UUID topicId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.status = 'PUBLISHED' AND q.difficulty = :difficulty ORDER BY q.createdAt DESC")
    List<Question> findByDifficultyPublished(@Param("difficulty") String difficulty, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.status = 'PUBLISHED' AND LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY q.createdAt DESC")
    List<Question> searchPublished(@Param("search") String search, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.status = 'PUBLISHED' AND q.skillId = :skillId AND q.difficulty = :difficulty")
    List<Question> findBySkillAndDifficulty(@Param("skillId") UUID skillId, @Param("difficulty") String difficulty, Pageable pageable);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.status = 'PUBLISHED'")
    long countPublished();

    @Query("SELECT COUNT(q) FROM Question q WHERE q.status = 'PUBLISHED' AND q.difficulty = :difficulty")
    long countPublishedByDifficulty(@Param("difficulty") String difficulty);

    @Query("SELECT q FROM Question q WHERE q.status = 'PUBLISHED' AND q.id NOT IN (SELECT a.questionId FROM StudentQuestionAttempt a WHERE a.studentId = :studentId) ORDER BY FUNCTION('RANDOM')")
    List<Question> findUnsolvedForStudent(@Param("studentId") UUID studentId, Pageable pageable);
}
