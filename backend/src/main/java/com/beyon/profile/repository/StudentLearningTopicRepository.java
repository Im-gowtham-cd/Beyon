package com.beyon.profile.repository;

import com.beyon.profile.model.StudentLearningTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentLearningTopicRepository extends JpaRepository<StudentLearningTopic, UUID> {
    List<StudentLearningTopic> findByStudentIdOrderByStartedAtDesc(UUID studentId);
    boolean existsByStudentIdAndTopicId(UUID studentId, UUID topicId);
    Optional<StudentLearningTopic> findByStudentIdAndTopicId(UUID studentId, UUID topicId);
}
