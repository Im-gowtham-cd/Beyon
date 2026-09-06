package com.beyon.assessment.controller;

import com.beyon.assessment.service.EvidenceStorageService;
import com.beyon.assessment.repository.ProctoringEvidenceRepository;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.nio.file.Files;
import java.util.UUID;

/**
 * Serves proctoring evidence files with authorization checks.
 * Only company/institution users who own the proctoring session can access evidence.
 */
@RestController
@RequestMapping("/api/v1/evidence")
public class EvidenceController {

    private final EvidenceStorageService evidenceStorageService;
    private final ProctoringEvidenceRepository evidenceRepo;
    private final JwtUtil jwtUtil;

    public EvidenceController(
            EvidenceStorageService evidenceStorageService,
            ProctoringEvidenceRepository evidenceRepo,
            JwtUtil jwtUtil) {
        this.evidenceStorageService = evidenceStorageService;
        this.evidenceRepo = evidenceRepo;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/{procSessionId}/{incidentId}/{filename:.+}")
    public ResponseEntity<Resource> getEvidence(
            @PathVariable String procSessionId,
            @PathVariable String incidentId,
            @PathVariable String filename,
            HttpServletRequest request) {

        // Authorization: must have a valid JWT (COMPANY or INSTITUTION role)
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            return ResponseEntity.status(401).build();
        }
        String role = jwtUtil.getRole(token);
        if (!"COMPANY".equals(role) && !"INSTITUTION".equals(role) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }

        String relativeUrl = "/api/v1/evidence/" + procSessionId + "/" + incidentId + "/" + filename;
        File file = evidenceStorageService.resolveStoragePath(relativeUrl);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        try {
            String contentType = Files.probeContentType(file.toPath());
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new FileSystemResource(file));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
