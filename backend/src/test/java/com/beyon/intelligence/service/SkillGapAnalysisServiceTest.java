package com.beyon.intelligence.service;

import com.beyon.intelligence.model.CareerPath;
import com.beyon.intelligence.model.CareerPathSkill;
import com.beyon.intelligence.model.StudentSkillGraph;
import com.beyon.intelligence.repository.CareerPathRepository;
import com.beyon.intelligence.repository.CareerPathSkillRepository;
import com.beyon.intelligence.repository.StudentSkillGraphRepository;
import com.beyon.profile.model.Skill;
import com.beyon.profile.repository.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SkillGapAnalysisServiceTest {

    private CareerPathRepository careerPathRepo;
    private CareerPathSkillRepository pathSkillRepo;
    private StudentSkillGraphRepository graphRepo;
    private SkillRepository skillRepo;

    private SkillGapAnalysisService skillGapAnalysisService;

    @BeforeEach
    void setUp() {
        careerPathRepo = mock(CareerPathRepository.class);
        pathSkillRepo = mock(CareerPathSkillRepository.class);
        graphRepo = mock(StudentSkillGraphRepository.class);
        skillRepo = mock(SkillRepository.class);

        skillGapAnalysisService = new SkillGapAnalysisService(
                careerPathRepo,
                pathSkillRepo,
                graphRepo,
                skillRepo
        );
    }

    @Test
    @DisplayName("analyze computes STRONG status and readiness score when student meets skill criteria")
    void testAnalyzeStrongAndGapSkills() {
        UUID studentId = UUID.randomUUID();
        UUID careerPathId = UUID.randomUUID();

        CareerPath path = new CareerPath();
        path.setId(careerPathId);
        path.setName("Full Stack Engineer");

        UUID skill1Id = UUID.randomUUID();
        UUID skill2Id = UUID.randomUUID();

        CareerPathSkill req1 = new CareerPathSkill();
        req1.setCareerPathId(careerPathId);
        req1.setSkillId(skill1Id);
        req1.setProficiencyLevel("INTERMEDIATE");
        req1.setRequired(true);

        CareerPathSkill req2 = new CareerPathSkill();
        req2.setCareerPathId(careerPathId);
        req2.setSkillId(skill2Id);
        req2.setProficiencyLevel("ADVANCED");
        req2.setRequired(true);

        // Student has skill1 at ADVANCED (>= INTERMEDIATE -> STRONG)
        StudentSkillGraph studentSkill1 = new StudentSkillGraph();
        studentSkill1.setStudentId(studentId);
        studentSkill1.setSkillId(skill1Id);
        studentSkill1.setLevel("ADVANCED");
        studentSkill1.setProficiencyPct(new BigDecimal("88.00"));

        // Student has skill2 at BEGINNER (< ADVANCED -> NEEDS_IMPROVEMENT)
        StudentSkillGraph studentSkill2 = new StudentSkillGraph();
        studentSkill2.setStudentId(studentId);
        studentSkill2.setSkillId(skill2Id);
        studentSkill2.setLevel("BEGINNER");
        studentSkill2.setProficiencyPct(new BigDecimal("35.00"));

        when(careerPathRepo.findById(careerPathId)).thenReturn(Optional.of(path));
        when(pathSkillRepo.findByCareerPathIdOrderBySortOrder(careerPathId)).thenReturn(List.of(req1, req2));
        when(graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId)).thenReturn(List.of(studentSkill1, studentSkill2));

        Skill s1 = new Skill();
        s1.setId(skill1Id);
        s1.setName("Java");

        Skill s2 = new Skill();
        s2.setId(skill2Id);
        s2.setName("Kubernetes");

        when(skillRepo.findById(skill1Id)).thenReturn(Optional.of(s1));
        when(skillRepo.findById(skill2Id)).thenReturn(Optional.of(s2));

        Map<String, Object> analysis = skillGapAnalysisService.analyze(studentId, careerPathId);

        assertNotNull(analysis);
        assertEquals(2, analysis.get("totalSkills"));
        assertEquals(1, analysis.get("acquiredSkills"));
        assertEquals(50, analysis.get("readinessScore")); // 1 of 2 = 50%

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skills = (List<Map<String, Object>>) analysis.get("skills");
        assertEquals(2, skills.size());
    }

    @Test
    @DisplayName("analyze flags CRITICAL status when student possesses zero knowledge of required skill")
    void testAnalyzeCriticalGap() {
        UUID studentId = UUID.randomUUID();
        UUID careerPathId = UUID.randomUUID();
        UUID missingSkillId = UUID.randomUUID();

        CareerPath path = new CareerPath();
        path.setId(careerPathId);

        CareerPathSkill req = new CareerPathSkill();
        req.setCareerPathId(careerPathId);
        req.setSkillId(missingSkillId);
        req.setProficiencyLevel("INTERMEDIATE");

        when(careerPathRepo.findById(careerPathId)).thenReturn(Optional.of(path));
        when(pathSkillRepo.findByCareerPathIdOrderBySortOrder(careerPathId)).thenReturn(List.of(req));
        when(graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId)).thenReturn(List.of()); // No skills recorded

        Map<String, Object> analysis = skillGapAnalysisService.analyze(studentId, careerPathId);

        assertEquals(0, analysis.get("readinessScore"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skills = (List<Map<String, Object>>) analysis.get("skills");
        assertEquals("CRITICAL", skills.get(0).get("status"));
        assertEquals(40, skills.get(0).get("estimatedHours"));
    }

    @Test
    @DisplayName("analyze throws exception when career path is not found")
    void testAnalyzePathNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(careerPathRepo.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                skillGapAnalysisService.analyze(UUID.randomUUID(), unknownId));
    }
}
