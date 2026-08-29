package com.beyon.institution.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.institution.model.*;
import com.beyon.institution.service.InstitutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/institution")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(InstitutionService institutionService) {
        this.institutionService = institutionService;
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<InstitutionStudent>>> getStudents(
            Authentication auth,
            @RequestParam(required = false) String status) {
        UUID instId = extractUserId(auth);
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(institutionService.getStudentsByStatus(instId, status)));
        }
        return ResponseEntity.ok(ApiResponse.ok(institutionService.getStudents(instId)));
    }

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<InstitutionStudent>> addStudent(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        UUID instId = extractUserId(auth);
        UUID studentId = UUID.fromString(body.get("studentId"));
        return ResponseEntity.ok(ApiResponse.ok(institutionService.addStudent(instId, studentId, body.get("department"), body.get("batch"))));
    }

    @PutMapping("/students/{studentId}/status")
    public ResponseEntity<ApiResponse<InstitutionStudent>> updateStatus(
            Authentication auth,
            @PathVariable UUID studentId,
            @RequestBody Map<String, String> body) {
        UUID instId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(institutionService.updatePlacementStatus(instId, studentId, body.get("status"))));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics(Authentication auth) {
        UUID instId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(institutionService.getInstitutionMetrics(instId)));
    }

    @PostMapping("/rating/calculate")
    public ResponseEntity<ApiResponse<InstitutionRatingSnapshot>> calculateRating(Authentication auth) {
        UUID instId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(institutionService.calculateAndSaveRating(instId)));
    }

    @GetMapping("/rating")
    public ResponseEntity<ApiResponse<InstitutionRatingSnapshot>> getRating(Authentication auth) {
        UUID instId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(institutionService.getLatestRating(instId)));
    }

    @GetMapping("/drives")
    public ResponseEntity<ApiResponse<List<PlacementDrive>>> getDrives(Authentication auth) {
        UUID instId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(institutionService.getDrives(instId)));
    }

    @PostMapping("/drives")
    public ResponseEntity<ApiResponse<PlacementDrive>> createDrive(Authentication auth, @RequestBody PlacementDrive drive) {
        UUID instId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(institutionService.createDrive(drive, instId)));
    }

    @PostMapping("/drives/{driveId}/approve")
    public ResponseEntity<ApiResponse<PlacementDrive>> approveDrive(Authentication auth, @PathVariable UUID driveId) {
        UUID instId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(institutionService.approveDrive(driveId, instId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
