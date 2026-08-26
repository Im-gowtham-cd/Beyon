package com.beyon.community.controller;

import com.beyon.community.model.*;
import com.beyon.community.service.MentorshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mentorship")
public class MentorshipController {

    private final MentorshipService mentorshipService;

    public MentorshipController(MentorshipService mentorshipService) {
        this.mentorshipService = mentorshipService;
    }

    private UUID extractUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @PostMapping("/profile")
    public ResponseEntity<MentorProfile> createProfile(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);
        MentorProfile profile = mentorshipService.createOrUpdateProfile(
            userId,
            (String) body.get("companyName"),
            (String) body.get("jobTitle"),
            body.get("experienceYears") != null ? (Integer) body.get("experienceYears") : 0,
            (String) body.get("bio"),
            (String) body.get("expertiseSkills"),
            (String) body.get("topics"),
            body.get("maxMentees") != null ? (Integer) body.get("maxMentees") : 5
        );
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/mentors")
    public ResponseEntity<?> getAvailableMentors() {
        return ResponseEntity.ok(mentorshipService.getAvailableMentors());
    }

    @PostMapping("/request/{mentorUserId}")
    public ResponseEntity<MentorshipRequest> requestMentorship(Authentication auth,
                                                                @PathVariable UUID mentorUserId,
                                                                @RequestBody Map<String, String> body) {
        UUID studentId = extractUserId(auth);
        MentorshipRequest request = mentorshipService.requestMentorship(studentId, mentorUserId, body.get("message"));
        return ResponseEntity.ok(request);
    }

    @PostMapping("/request/{requestId}/accept")
    public ResponseEntity<MentorshipRequest> acceptRequest(Authentication auth, @PathVariable UUID requestId) {
        return ResponseEntity.ok(mentorshipService.acceptRequest(requestId));
    }

    @PostMapping("/request/{requestId}/complete")
    public ResponseEntity<MentorshipRequest> completeRequest(Authentication auth, @PathVariable UUID requestId) {
        return ResponseEntity.ok(mentorshipService.completeRequest(requestId));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(mentorshipService.getMyRequestsAsStudent(userId));
    }

    @GetMapping("/my-mentees")
    public ResponseEntity<?> getMyMentees(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(mentorshipService.getMyRequestsAsMentor(userId));
    }

    @PostMapping("/sessions/{requestId}")
    public ResponseEntity<MentorshipSession> scheduleSession(Authentication auth,
                                                              @PathVariable UUID requestId,
                                                              @RequestBody Map<String, Object> body) {
        MentorshipSession session = mentorshipService.scheduleSession(
            requestId,
            (String) body.get("topic"),
            Instant.parse((String) body.get("scheduledAt")),
            body.get("durationMinutes") != null ? (Integer) body.get("durationMinutes") : 30,
            (String) body.get("meetingLink")
        );
        return ResponseEntity.ok(session);
    }

    @GetMapping("/sessions/{requestId}")
    public ResponseEntity<?> getSessions(@PathVariable UUID requestId) {
        return ResponseEntity.ok(mentorshipService.getSessionsForRequest(requestId));
    }
}
