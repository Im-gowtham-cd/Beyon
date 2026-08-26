package com.beyon.recruitment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.recruitment.model.DriveInstitutionTarget;
import com.beyon.recruitment.model.RecruitmentDrive;
import com.beyon.recruitment.service.RecruitmentDriveService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/drives")
public class RecruitmentDriveController {

    private final RecruitmentDriveService driveService;

    public RecruitmentDriveController(RecruitmentDriveService driveService) {
        this.driveService = driveService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecruitmentDrive>> createDrive(@RequestBody RecruitmentDrive drive, Authentication auth) {
        UUID companyId = extractUserId(auth);
        drive.setCompanyUserId(companyId);
        return ResponseEntity.ok(ApiResponse.ok(driveService.createDrive(drive)));
    }

    @PutMapping("/{driveId}")
    public ResponseEntity<ApiResponse<RecruitmentDrive>> updateDrive(
            @PathVariable UUID driveId, @RequestBody RecruitmentDrive drive, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(driveService.updateDrive(driveId, drive, extractUserId(auth))));
    }

    @PutMapping("/{driveId}/status")
    public ResponseEntity<ApiResponse<RecruitmentDrive>> updateStatus(
            @PathVariable UUID driveId, @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(driveService.updateStatus(driveId, body.get("status"), extractUserId(auth))));
    }

    @PostMapping("/{driveId}/publish")
    public ResponseEntity<ApiResponse<String>> publishDrive(@PathVariable UUID driveId, Authentication auth) {
        driveService.publishDrive(driveId, extractUserId(auth));
        return ResponseEntity.ok(ApiResponse.ok("Drive published successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RecruitmentDrive>>> getMyDrives(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(driveService.getMyDrives(extractUserId(auth))));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<RecruitmentDrive>>> getPublicDrives() {
        return ResponseEntity.ok(ApiResponse.ok(driveService.getPublicDrives()));
    }

    @GetMapping("/{driveId}")
    public ResponseEntity<ApiResponse<RecruitmentDrive>> getDrive(@PathVariable UUID driveId) {
        return ResponseEntity.ok(ApiResponse.ok(driveService.getDrive(driveId)));
    }

    @GetMapping("/{driveId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDriveStats(@PathVariable UUID driveId) {
        return ResponseEntity.ok(ApiResponse.ok(driveService.getDriveStats(driveId)));
    }

    @PostMapping("/{driveId}/targets")
    public ResponseEntity<ApiResponse<String>> addTarget(@PathVariable UUID driveId, @RequestBody DriveInstitutionTarget target) {
        driveService.addTarget(driveId, target);
        return ResponseEntity.ok(ApiResponse.ok("Target added"));
    }

    @GetMapping("/{driveId}/targets")
    public ResponseEntity<ApiResponse<List<DriveInstitutionTarget>>> getTargets(@PathVariable UUID driveId) {
        return ResponseEntity.ok(ApiResponse.ok(driveService.getTargets(driveId)));
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<ApiResponse<List<RecruitmentDrive>>> getInstitutionDrives(@PathVariable UUID institutionId) {
        return ResponseEntity.ok(ApiResponse.ok(driveService.getInstitutionDrives(institutionId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
