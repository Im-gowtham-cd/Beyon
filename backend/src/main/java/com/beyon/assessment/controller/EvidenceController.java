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

    @GetMapping("/**")
    public ResponseEntity<Resource> getEvidence(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String prefix = "/api/v1/evidence/";
        int idx = uri.indexOf(prefix);
        if (idx == -1) {
            return ResponseEntity.notFound().build();
        }
        String relativeSubpath = uri.substring(idx + prefix.length());

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.status(401).build();
            }
        }

        File file = evidenceStorageService.resolveStoragePath(relativeSubpath);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        try {
            String contentType = Files.probeContentType(file.toPath());
            if (contentType == null) contentType = "image/jpeg";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new FileSystemResource(file));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

