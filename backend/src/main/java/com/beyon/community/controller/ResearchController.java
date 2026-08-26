package com.beyon.community.controller;

import com.beyon.community.model.*;
import com.beyon.community.service.ResearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/research")
public class ResearchController {

    private final ResearchService researchService;

    public ResearchController(ResearchService researchService) {
        this.researchService = researchService;
    }

    private UUID extractUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @PostMapping
    public ResponseEntity<ResearchProposal> createProposal(Authentication auth,
                                                            @RequestBody Map<String, Object> body) {
        UUID userId = extractUserId(auth);
        ResearchProposal proposal = researchService.createProposal(
            userId,
            (String) body.getOrDefault("proposerType", "INSTITUTION"),
            (String) body.get("title"),
            (String) body.get("description"),
            (String) body.get("domain"),
            (String) body.get("requiredSkills"),
            (String) body.get("expectedOutcome"),
            body.get("durationWeeks") != null ? (Integer) body.get("durationWeeks") : null,
            body.get("budgetAmount") != null ? new BigDecimal(body.get("budgetAmount").toString()) : null,
            body.get("maxParticipants") != null ? (Integer) body.get("maxParticipants") : 5,
            (String) body.get("documents")
        );
        return ResponseEntity.ok(proposal);
    }

    @GetMapping
    public ResponseEntity<?> getPublishedProposals() {
        return ResponseEntity.ok(researchService.getPublishedProposals());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyProposals(Authentication auth) {
        return ResponseEntity.ok(researchService.getMyProposals(extractUserId(auth)));
    }

    @PostMapping("/{proposalId}/join")
    public ResponseEntity<ResearchParticipant> joinProposal(Authentication auth,
                                                             @PathVariable UUID proposalId,
                                                             @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(researchService.joinProposal(proposalId, extractUserId(auth), body.getOrDefault("role", "RESEARCHER")));
    }

    @GetMapping("/{proposalId}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable UUID proposalId) {
        return ResponseEntity.ok(researchService.getProposalParticipants(proposalId));
    }
}
