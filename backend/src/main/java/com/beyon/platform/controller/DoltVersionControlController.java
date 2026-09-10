package com.beyon.platform.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.platform.service.DoltVersionControlService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dolt")
public class DoltVersionControlController {

    private final DoltVersionControlService doltService;

    public DoltVersionControlController(DoltVersionControlService doltService) {
        this.doltService = doltService;
    }

    @GetMapping("/log")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCommitLog(
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(doltService.getCommitLog(limit)));
    }

    @PostMapping("/branch")
    public ResponseEntity<ApiResponse<Boolean>> createBranch(@RequestBody Map<String, String> request) {
        String branchName = request.get("branchName");
        if (branchName == null || branchName.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("branchName is required"));
        }
        boolean success = doltService.createBranch(branchName);
        return ResponseEntity.ok(ApiResponse.ok(success, success ? "Branch created successfully" : "Failed to create branch"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<Boolean>> checkoutBranch(@RequestBody Map<String, String> request) {
        String branchName = request.get("branchName");
        if (branchName == null || branchName.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("branchName is required"));
        }
        boolean success = doltService.checkoutBranch(branchName);
        return ResponseEntity.ok(ApiResponse.ok(success, success ? "Checked out branch: " + branchName : "Failed to checkout branch"));
    }

    @PostMapping("/commit")
    public ResponseEntity<ApiResponse<Boolean>> commitChanges(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("message is required"));
        }
        boolean success = doltService.commitChanges(message);
        return ResponseEntity.ok(ApiResponse.ok(success, success ? "Changes committed successfully" : "Commit failed"));
    }

    @GetMapping("/diff")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDiff(
            @RequestParam(defaultValue = "main") String fromBranch,
            @RequestParam String toBranch,
            @RequestParam(defaultValue = "skills") String tableName) {
        return ResponseEntity.ok(ApiResponse.ok(doltService.getDiff(fromBranch, toBranch, tableName)));
    }
}
