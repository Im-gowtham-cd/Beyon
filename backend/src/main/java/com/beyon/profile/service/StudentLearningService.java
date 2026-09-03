package com.beyon.profile.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.profile.model.SkillTopic;
import com.beyon.profile.model.StudentLearningSkill;
import com.beyon.profile.model.StudentLearningTopic;
import com.beyon.profile.model.StudentSkillProgress;
import com.beyon.profile.repository.SkillTopicRepository;
import com.beyon.profile.repository.StudentLearningSkillRepository;
import com.beyon.profile.repository.StudentLearningTopicRepository;
import com.beyon.profile.repository.StudentSkillProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentLearningService {

    private final StudentLearningTopicRepository learningTopicRepository;
    private final StudentSkillProgressRepository skillProgressRepository;
    private final StudentLearningSkillRepository learningSkillRepository;
    private final SkillTopicRepository skillTopicRepository;

    public StudentLearningService(StudentLearningTopicRepository learningTopicRepository,
                                  StudentSkillProgressRepository skillProgressRepository,
                                  StudentLearningSkillRepository learningSkillRepository,
                                  SkillTopicRepository skillTopicRepository) {
        this.learningTopicRepository = learningTopicRepository;
        this.skillProgressRepository = skillProgressRepository;
        this.learningSkillRepository = learningSkillRepository;
        this.skillTopicRepository = skillTopicRepository;
    }

    public List<StudentLearningTopic> getLearningTopics(UUID studentId) {
        List<StudentLearningTopic> topics = learningTopicRepository.findByStudentIdOrderByStartedAtDesc(studentId);
        if (topics.isEmpty()) {
            return topics;
        }

        List<UUID> topicIds = topics.stream().map(StudentLearningTopic::getTopicId).distinct().toList();
        Map<UUID, SkillTopic> topicMap = skillTopicRepository.findAllById(topicIds).stream()
                .collect(Collectors.toMap(SkillTopic::getId, t -> t, (a, b) -> a));

        for (StudentLearningTopic lt : topics) {
            SkillTopic st = topicMap.get(lt.getTopicId());
            if (st != null) {
                lt.setTopicName(st.getName());
                lt.setSkillId(st.getSkillId());
            }
        }
        return topics;
    }

    public List<StudentLearningSkill> getLearningSkills(UUID studentId) {
        return learningSkillRepository.findByUserIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public StudentLearningSkill addLearningSkill(UUID studentId, UUID skillId, String skillName) {
        StudentLearningSkill skill = new StudentLearningSkill();
        skill.setUserId(studentId);
        skill.setSkillId(skillId);
        skill.setSkillName(skillName != null && !skillName.isBlank() ? skillName : "Technical Skill Track");
        skill.setStatus("LEARNING");

        StudentLearningSkill saved = learningSkillRepository.save(skill);

        if (skillId != null) {
            List<SkillTopic> topics = skillTopicRepository.findBySkillIdAndActiveTrueOrderByDisplayOrder(skillId);
            for (SkillTopic t : topics) {
                if (!learningTopicRepository.existsByStudentIdAndTopicId(studentId, t.getId())) {
                    StudentLearningTopic lt = new StudentLearningTopic();
                    lt.setStudentId(studentId);
                    lt.setTopicId(t.getId());
                    lt.setStatus("LEARNING");
                    learningTopicRepository.save(lt);
                }
            }
        }

        return saved;
    }

    @Transactional
    public void removeLearningSkill(UUID studentId, UUID skillId) {
        List<StudentLearningSkill> list = learningSkillRepository.findByUserIdOrderByCreatedAtDesc(studentId);
        for (StudentLearningSkill s : list) {
            if (s.getSkillId() != null && s.getSkillId().equals(skillId)) {
                learningSkillRepository.delete(s);
            }
        }
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
        StudentLearningTopic saved = learningTopicRepository.save(topic);

        skillTopicRepository.findById(topicId).ifPresent(st -> {
            saved.setTopicName(st.getName());
            saved.setSkillId(st.getSkillId());
        });

        return saved;
    }

    @Transactional
    public StudentLearningTopic updateLearningStatus(UUID studentId, UUID learningId, String status) {
        StudentLearningTopic topic = learningTopicRepository.findById(learningId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning topic not found"));
        if (!topic.getStudentId().equals(studentId)) {
            throw new ForbiddenException("Cannot modify another student's learning topic");
        }
        topic.setStatus(status);
        StudentLearningTopic saved = learningTopicRepository.save(topic);

        skillTopicRepository.findById(saved.getTopicId()).ifPresent(st -> {
            saved.setTopicName(st.getName());
            saved.setSkillId(st.getSkillId());
        });

        return saved;
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
