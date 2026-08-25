package com.beyon.profile.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.profile.model.StudentLearningTopic;
import com.beyon.profile.model.StudentSkillProgress;
import com.beyon.profile.repository.StudentLearningTopicRepository;
import com.beyon.profile.repository.StudentSkillProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class StudentLearningService {

    private final StudentLearningTopicRepository learningTopicRepository;
    private final StudentSkillProgressRepository skillProgressRepository;

    public StudentLearningService(StudentLearningTopicRepository learningTopicRepository,
                                  StudentSkillProgressRepository skillProgressRepository) {
        this.learningTopicRepository = learningTopicRepository;
        this.skillProgressRepository = skillProgressRepository;
    }

    public List<StudentLearningTopic> getLearningTopics(UUID studentId) {
        return learningTopicRepository.findByStudentIdOrderByStartedAtDesc(studentId);
    }

    @Transactional
    public StudentLearningTopic addLearningTopic(UUID studentId, UUID topicId) {
        if (learningTopicRepository.existsByStudentIdAndTopicId(studentId, topicId)) {
            throw new ConflictException("Already learning this topic");
        }
        StudentLearningTopic topic = new StudentLearningTopic();
        topic.setStudentId(studentId);
        topic.setTopicId(topicId);
        topic.setStatus("LEARNING");
        return learningTopicRepository.save(topic);
    }

    @Transactional
    public StudentLearningTopic updateLearningStatus(UUID studentId, UUID learningId, String status) {
        StudentLearningTopic topic = learningTopicRepository.findById(learningId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning topic not found"));
        if (!topic.getStudentId().equals(studentId)) {
            throw new ForbiddenException("Cannot modify another student's learning topic");
        }
        topic.setStatus(status);
        return learningTopicRepository.save(topic);
    }

    @Transactional
    public void removeLearningTopic(UUID studentId, UUID learningId) {
        StudentLearningTopic topic = learningTopicRepository.findById(learningId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning topic not found"));
        if (!topic.getStudentId().equals(studentId)) {
            throw new ForbiddenException("Cannot delete another student's learning topic");
        }
        learningTopicRepository.delete(topic);
    }

    public List<StudentSkillProgress> getSkillProgress(UUID studentId) {
        return skillProgressRepository.findByStudentId(studentId);
    }

    public List<StudentSkillProgress> getSkillProgressForSkill(UUID studentId, UUID skillId) {
        return skillProgressRepository.findByStudentIdAndSkillId(studentId, skillId);
    }
}
