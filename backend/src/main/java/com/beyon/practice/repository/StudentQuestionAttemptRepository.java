package com.beyon.practice.repository;

import com.beyon.practice.model.StudentQuestionAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StudentQuestionAttemptRepository extends JpaRepository<StudentQuestionAttempt, UUID> {
    List<StudentQuestionAttempt> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    @Query("SELECT a FROM StudentQuestionAttempt a WHERE a.studentId = :studentId AND a.questionId = :questionId ORDER BY a.attemptNumber DESC")
    List<StudentQuestionAttempt> findByStudentAndQuestion(@Param("studentId") UUID studentId, @Param("questionId") UUID questionId);

    long countByStudentIdAndCorrectTrue(UUID studentId);

    long countByStudentId(UUID studentId);

    @Query("SELECT a FROM StudentQuestionAttempt a WHERE a.studentId = :studentId AND a.correct = true AND a.questionId IN (SELECT q.id FROM Question q WHERE q.difficulty = :difficulty)")
    List<StudentQuestionAttempt> findSolvedByDifficulty(@Param("studentId") UUID studentId, @Param("difficulty") String difficulty);
}
