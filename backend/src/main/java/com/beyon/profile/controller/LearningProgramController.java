package com.beyon.profile.controller;

import com.beyon.identity.security.JwtUtil;
import com.beyon.profile.service.LearningProgramService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/learning-programs")
public class LearningProgramController {

    private final LearningProgramService programService;
    private final JwtUtil jwtUtil;

    public LearningProgramController(LearningProgramService programService, JwtUtil jwtUtil) {
        this.programService = programService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getAvailablePrograms() {
        return ResponseEntity.ok(programService.getAvailablePrograms());
    }

    @GetMapping("/{programId}")
    public ResponseEntity<?> getProgramDetail(@PathVariable UUID programId) {
        return ResponseEntity.ok(programService.getProgramDetail(programId));
    }

    @PostMapping("/{programId}/enroll")
    public ResponseEntity<?> enroll(@PathVariable UUID programId, HttpServletRequest request) {
        return ResponseEntity.ok(programService.enroll(extractUserId(request), programId));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyEnrollments(HttpServletRequest request) {
        return ResponseEntity.ok(programService.getMyEnrollments(extractUserId(request)));
    }

    @PostMapping("/enrollments/{enrollmentId}/modules/{moduleId}/complete")
    public ResponseEntity<?> completeModule(@PathVariable UUID enrollmentId, @PathVariable UUID moduleId, HttpServletRequest request) {
        return ResponseEntity.ok(programService.completeModule(extractUserId(request), enrollmentId, moduleId));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
