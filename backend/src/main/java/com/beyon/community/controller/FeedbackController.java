package com.beyon.community.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.community.model.FeedbackReport;
import com.beyon.community.service.FeedbackService;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {
    private final FeedbackService feedbackService;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public FeedbackController(FeedbackService feedbackService, UserRepository userRepo, JwtUtil jwtUtil) {
        this.feedbackService = feedbackService;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> submitReport(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        User user = userRepo.findById(userId).orElseThrow();

        FeedbackReport report = feedbackService.submit(userId, user.getRole().name(),
            (String) body.get("reportType"), (String) body.get("category"),
            (String) body.get("title"), (String) body.get("description"),
            (String) body.get("userPriority"),
            (String) body.get("applicationVersion"), (String) body.get("page"),
            (String) body.get("browserInfo"), (String) body.get("osInfo"),
            (String) body.get("screenSize"), (String) body.get("requestId"),
            (String) body.get("desktopAppVersion"),
            body.get("assessmentSessionId") != null ? UUID.fromString((String) body.get("assessmentSessionId")) : null);

        return ResponseEntity.ok(ApiResponse.ok(report, "Report submitted successfully"));
    }

    @GetMapping("/similar")
    public ResponseEntity<?> findSimilar(@RequestParam String title, @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.findSimilar(title, description)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyReports(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getMyReports(extractUserId(request))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReport(@PathVariable UUID id, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        User user = userRepo.findById(userId).orElseThrow();
        if ("ADMIN".equals(user.getRole().name())) {
            return ResponseEntity.ok(ApiResponse.ok(feedbackService.getById(id)));
        }
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getByIdForUser(id, userId)));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getComments(id)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable UUID id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        feedbackService.addComment(id, extractUserId(request), body.get("content"));
        return ResponseEntity.ok(ApiResponse.ok(null, "Comment added"));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getStatusHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getStatusHistory(id)));
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<?> getAttachments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getAttachments(id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.adminGetStats()));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> adminGetAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        requireAdmin(request);
        Page<FeedbackReport> reports = feedbackService.adminGetAll(status, category, severity, role, search, page, size);
        return ResponseEntity.ok(ApiResponse.paginated(reports.getContent(), page, size, reports.getTotalElements()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> adminUpdate(@PathVariable UUID id, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        UUID adminId = requireAdmin(request);
        FeedbackReport updated = feedbackService.adminUpdate(id,
            (String) body.get("status"), (String) body.get("severity"),
            body.get("assignedTo") != null ? UUID.fromString((String) body.get("assignedTo")) : null,
            adminId);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Report updated"));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<?> adminAddNote(@PathVariable UUID id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID adminId = requireAdmin(request);
        feedbackService.adminAddNote(id, adminId, body.get("content"));
        return ResponseEntity.ok(ApiResponse.ok(null, "Note added"));
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<?> adminGetNotes(@PathVariable UUID id, HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.adminGetNotes(id)));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }

    private UUID requireAdmin(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        User user = userRepo.findById(userId).orElseThrow();
        if (!"ADMIN".equals(user.getRole().name())) throw new RuntimeException("Forbidden");
        return userId;
    }
}
