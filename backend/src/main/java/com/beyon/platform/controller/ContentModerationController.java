package com.beyon.platform.controller;

import com.beyon.platform.service.ContentModerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/moderation")
public class ContentModerationController {

    private final ContentModerationService moderationService;

    public ContentModerationController(ContentModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping("/report")
    public ResponseEntity<?> reportContent(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID userId = UUID.fromString(auth.getName());
        var report = moderationService.reportContent(
            userId,
            (String) body.get("targetType"),
            UUID.fromString((String) body.get("targetId")),
            (String) body.get("reason"),
            (String) body.get("description")
        );
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/pending")
    public ResponseEntity<?> getPendingReports() {
        return ResponseEntity.ok(moderationService.getPendingReports());
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        return ResponseEntity.ok(moderationService.getAllReports());
    }

    @PostMapping("/reports/{reportId}/review")
    public ResponseEntity<?> reviewReport(Authentication auth, @PathVariable UUID reportId,
                                           @RequestBody Map<String, String> body) {
        UUID moderatorId = UUID.fromString(auth.getName());
        var report = moderationService.reviewReport(reportId, moderatorId, body.get("action"), body.get("notes"));
        return ResponseEntity.ok(report);
    }
}
