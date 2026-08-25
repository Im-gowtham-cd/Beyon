package com.beyon.assessment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.assessment.service.EvaluationEngineService;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/evaluation")
public class EvaluationController {
    private final EvaluationEngineService evalService;
    private final JwtUtil jwtUtil;

    public EvaluationController(EvaluationEngineService evalService, JwtUtil jwtUtil) {
        this.evalService = evalService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluate(@RequestBody Map<String, Object> body) {
        UUID sessionId = UUID.fromString((String) body.get("sessionId"));
        UUID studentId = UUID.fromString((String) body.get("studentId"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answers = (List<Map<String, Object>>) body.get("answers");
        BigDecimal maxScore = body.get("maxScore") != null ? new BigDecimal(body.get("maxScore").toString()) : BigDecimal.valueOf(100);
        return ResponseEntity.ok(ApiResponse.ok(evalService.evaluate(sessionId, studentId, answers, maxScore)));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getResult(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(evalService.getResultReport(sessionId)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentResults(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.ok(evalService.getStudentResults(studentId)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
