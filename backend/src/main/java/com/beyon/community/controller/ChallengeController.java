package com.beyon.community.controller;

import com.beyon.community.model.*;
import com.beyon.community.service.ChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    private UUID extractUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @PostMapping
    public ResponseEntity<IndustryChallenge> createChallenge(Authentication auth,
                                                              @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);
        IndustryChallenge challenge = challengeService.createChallenge(
            userId,
            (String) body.getOrDefault("organizerType", "COMPANY"),
            (String) body.get("title"),
            (String) body.get("description"),
            (String) body.get("problemStatement"),
            (String) body.get("requiredSkills"),
            (String) body.getOrDefault("difficulty", "MEDIUM"),
            (String) body.get("rules"),
            body.get("deadline") != null ? Instant.parse((String) body.get("deadline")) : null,
            body.get("minTeamSize") != null ? (Integer) body.get("minTeamSize") : 1,
            body.get("maxTeamSize") != null ? (Integer) body.get("maxTeamSize") : 1,
            body.get("coinReward") != null ? (Integer) body.get("coinReward") : 0,
            body.get("xpReward") != null ? (Integer) body.get("xpReward") : 0,
            (String) body.get("badgeName"),
            body.get("certificateProvided") != null ? (Boolean) body.get("certificateProvided") : false
        );
        return ResponseEntity.ok(challenge);
    }

    @GetMapping
    public ResponseEntity<?> getPublishedChallenges() {
        return ResponseEntity.ok(challengeService.getPublishedChallenges());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyChallenges(Authentication auth) {
        return ResponseEntity.ok(challengeService.getChallengesByOrganizer(extractUserId(auth)));
    }

    @PostMapping("/{challengeId}/participate")
    public ResponseEntity<ChallengeParticipation> participate(Authentication auth,
                                                               @PathVariable UUID challengeId,
                                                               @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(challengeService.participate(
            challengeId, extractUserId(auth), body.get("teamName"), body.get("teamMembers")));
    }

    @PostMapping("/participation/{participationId}/submit")
    public ResponseEntity<ChallengeParticipation> submit(Authentication auth,
                                                          @PathVariable UUID participationId,
                                                          @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(challengeService.submit(
            participationId, body.get("submissionUrl"), body.get("submissionDocs"),
            body.get("submissionDemo"), body.get("submissionPresentation")));
    }

    @GetMapping("/my-participations")
    public ResponseEntity<?> getMyParticipations(Authentication auth) {
        return ResponseEntity.ok(challengeService.getMyParticipations(extractUserId(auth)));
    }
}
