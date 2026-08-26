package com.beyon.recruitment.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.recruitment.model.PlacementRecord;
import com.beyon.recruitment.model.PlacementRegistration;
import com.beyon.recruitment.service.PlacementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/placement")
public class PlacementController {

    private final PlacementService placementService;

    public PlacementController(PlacementService placementService) {
        this.placementService = placementService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<PlacementRegistration>> register(@RequestBody PlacementRegistration reg, Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(placementService.registerOrUpdate(studentId, reg)));
    }

    @GetMapping("/my-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyStatus(Authentication auth) {
        UUID studentId = extractUserId(auth);
        Optional<PlacementRegistration> reg = placementService.getMyRegistration(studentId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("registered", reg.isPresent());
        result.put("registration", reg.orElse(null));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/my-records")
    public ResponseEntity<ApiResponse<List<PlacementRecord>>> getMyRecords(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(placementService.getMyRecords(extractUserId(auth))));
    }

    @PostMapping("/records")
    public ResponseEntity<ApiResponse<PlacementRecord>> createRecord(@RequestBody PlacementRecord record) {
        return ResponseEntity.ok(ApiResponse.ok(placementService.createRecord(record)));
    }

    @PostMapping("/records/{recordId}/accept")
    public ResponseEntity<ApiResponse<PlacementRecord>> acceptOffer(@PathVariable UUID recordId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(placementService.acceptOffer(recordId, extractUserId(auth))));
    }

    @PostMapping("/records/{recordId}/verify")
    public ResponseEntity<ApiResponse<PlacementRecord>> verifyRecord(@PathVariable UUID recordId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(placementService.verifyRecord(recordId, extractUserId(auth))));
    }

    @GetMapping("/institution/{institutionId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @PathVariable UUID institutionId,
            @RequestParam(defaultValue = "2026") Integer year) {
        return ResponseEntity.ok(ApiResponse.ok(placementService.getInstitutionPlacementStats(institutionId, year)));
    }

    @GetMapping("/institution/{institutionId}/records")
    public ResponseEntity<ApiResponse<List<PlacementRecord>>> getInstitutionRecords(
            @PathVariable UUID institutionId,
            @RequestParam(defaultValue = "2026") Integer year) {
        return ResponseEntity.ok(ApiResponse.ok(placementService.getInstitutionRecords(institutionId, year)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
