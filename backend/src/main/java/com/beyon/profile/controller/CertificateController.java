package com.beyon.profile.controller;

import com.beyon.identity.security.JwtUtil;
import com.beyon.profile.service.CertificateService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

    private final CertificateService certService;
    private final JwtUtil jwtUtil;

    public CertificateController(CertificateService certService, JwtUtil jwtUtil) {
        this.certService = certService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyCertificates(HttpServletRequest request) {
        return ResponseEntity.ok(certService.getStudentCertificates(extractUserId(request)));
    }

    @GetMapping("/verify/{certificateId}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String certificateId) {
        return ResponseEntity.ok(certService.verifyCertificate(certificateId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCertificate(@PathVariable UUID id) {
        return ResponseEntity.ok(certService.getCertificate(id));
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueCertificate(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID programId = UUID.fromString((String) body.get("programId"));
        String studentName = (String) body.get("studentName");
        String programName = (String) body.get("programName");
        String issuerName = (String) body.get("issuerName");
        Integer score = body.get("score") != null ? (Integer) body.get("score") : null;
        String skillsCovered = (String) body.get("skillsCovered");
        return ResponseEntity.ok(certService.issueCertificate(extractUserId(request), programId, studentName, programName, issuerName, score, skillsCovered));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
