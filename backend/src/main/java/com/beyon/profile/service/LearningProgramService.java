package com.beyon.profile.service;

import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.practice.service.SkillXpService;
import com.beyon.intelligence.model.LearningProgram;
import com.beyon.intelligence.model.LearningProgramEnrollment;
import com.beyon.intelligence.model.LearningProgramModule;
import com.beyon.intelligence.model.LearningProgramModuleProgress;
import com.beyon.intelligence.repository.LearningProgramEnrollmentRepository;
import com.beyon.intelligence.repository.LearningProgramModuleRepository;
import com.beyon.intelligence.repository.LearningProgramModuleProgressRepository;
import com.beyon.intelligence.repository.LearningProgramRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class LearningProgramService {

    private final LearningProgramRepository programRepo;
    private final LearningProgramEnrollmentRepository enrollmentRepo;
    private final LearningProgramModuleRepository moduleRepo;
    private final LearningProgramModuleProgressRepository progressRepo;
    private final SkillXpService skillXpService;

    public LearningProgramService(LearningProgramRepository programRepo,
                                   LearningProgramEnrollmentRepository enrollmentRepo,
                                   LearningProgramModuleRepository moduleRepo,
                                   LearningProgramModuleProgressRepository progressRepo,
                                   SkillXpService skillXpService) {
        this.programRepo = programRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.moduleRepo = moduleRepo;
        this.progressRepo = progressRepo;
        this.skillXpService = skillXpService;
    }

    public List<LearningProgram> getAvailablePrograms() {
        return programRepo.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public Map<String, Object> getProgramDetail(UUID programId) {
        LearningProgram program = programRepo.findById(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
        List<LearningProgramModule> modules = moduleRepo.findByProgramIdOrderBySortOrder(programId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("program", program);
        result.put("modules", modules);
        return result;
    }

    @Transactional
    public LearningProgramEnrollment enroll(UUID studentId, UUID programId) {
        if (enrollmentRepo.findByStudentIdAndProgramId(studentId, programId).isPresent()) {
            throw new RuntimeException("Already enrolled");
        }
        LearningProgramEnrollment enrollment = new LearningProgramEnrollment();
        enrollment.setStudentId(studentId);
        enrollment.setProgramId(programId);
        enrollment.setStatus("ENROLLED");
        enrollment.setModulesCompleted(0);
        enrollment.setProgressPercent(0);
        return enrollmentRepo.save(enrollment);
    }

    public List<Map<String, Object>> getMyEnrollments(UUID studentId) {
        List<LearningProgramEnrollment> enrollments = enrollmentRepo.findByStudentIdOrderByEnrolledAtDesc(studentId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (LearningProgramEnrollment e : enrollments) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("enrollment", e);
            LearningProgram program = programRepo.findById(e.getProgramId()).orElse(null);
            map.put("program", program);
            List<LearningProgramModule> modules = moduleRepo.findByProgramIdOrderBySortOrder(e.getProgramId());
            map.put("totalModules", modules.size());
            result.add(map);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> completeModule(UUID studentId, UUID enrollmentId, UUID moduleId) {
        LearningProgramEnrollment enrollment = enrollmentRepo.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        if (!enrollment.getStudentId().equals(studentId)) {
            throw new RuntimeException("Not your enrollment");
        }
        LearningProgramModuleProgress progress = progressRepo.findByEnrollmentIdAndModuleId(enrollmentId, moduleId)
                .orElseGet(() -> {
                    LearningProgramModuleProgress p = new LearningProgramModuleProgress();
                    p.setEnrollmentId(enrollmentId);
                    p.setModuleId(moduleId);
                    return p;
                });
        if ("COMPLETED".equals(progress.getStatus())) {
            throw new RuntimeException("Module already completed");
        }
        progress.setStatus("COMPLETED");
        progress.setCompletedAt(OffsetDateTime.now());
        progressRepo.save(progress);
        int completed = (int) progressRepo.countByEnrollmentIdAndStatus(enrollmentId, "COMPLETED");
        List<LearningProgramModule> allModules = moduleRepo.findByProgramIdOrderBySortOrder(enrollment.getProgramId());
        enrollment.setModulesCompleted(completed);
        enrollment.setProgressPercent((int) (completed * 100.0 / allModules.size()));
        if (completed == allModules.size()) {
            enrollment.setStatus("COMPLETED");
            enrollment.setCompletedAt(OffsetDateTime.now());
        } else {
            enrollment.setStatus("IN_PROGRESS");
        }
        enrollmentRepo.save(enrollment);
        LearningProgramModule mod = moduleRepo.findById(moduleId).orElse(null);
        if (mod != null && "ASSESSMENT".equals(mod.getModuleType())) {
            skillXpService.earnXp(studentId, enrollment.getProgramId(), 100, "LEARNING_PROGRAM", enrollmentId, "Completed module: " + mod.getTitle());
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("enrollment", enrollment);
        result.put("progressPercent", enrollment.getProgressPercent());
        result.put("completedModules", completed);
        result.put("totalModules", allModules.size());
        return result;
    }
}
