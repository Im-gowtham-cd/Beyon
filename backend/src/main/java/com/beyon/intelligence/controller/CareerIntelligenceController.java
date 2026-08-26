package com.beyon.intelligence.controller;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.service.*;
import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/career-intel")
public class CareerIntelligenceController {

    private final SkillTaxonomyService taxonomyService;
    private final SkillGraphService graphService;
    private final SkillGapAnalysisService gapService;
    private final CareerAdvisorService advisorService;
    private final PersonalizedChallengeEngine challengeEngine;
    private final AdaptiveLearningService adaptiveService;
    private final PortfolioAnalysisService portfolioService;
    private final OpportunityMatchService matchService;
    private final JwtUtil jwtUtil;

    public CareerIntelligenceController(SkillTaxonomyService taxonomyService,
                                         SkillGraphService graphService,
                                         SkillGapAnalysisService gapService,
                                         CareerAdvisorService advisorService,
                                         PersonalizedChallengeEngine challengeEngine,
                                         AdaptiveLearningService adaptiveService,
                                         PortfolioAnalysisService portfolioService,
                                         OpportunityMatchService matchService,
                                         JwtUtil jwtUtil) {
        this.taxonomyService = taxonomyService;
        this.graphService = graphService;
        this.gapService = gapService;
        this.advisorService = advisorService;
        this.challengeEngine = challengeEngine;
        this.adaptiveService = adaptiveService;
        this.portfolioService = portfolioService;
        this.matchService = matchService;
        this.jwtUtil = jwtUtil;
    }

    // ===== Phase 151: Skill Taxonomy =====
    @GetMapping("/taxonomy/roots")
    public ResponseEntity<?> getRootTaxonomyNodes() {
        return ResponseEntity.ok(taxonomyService.getRootNodes());
    }

    @GetMapping("/taxonomy/{nodeId}/children")
    public ResponseEntity<?> getTaxonomyChildren(@PathVariable UUID nodeId) {
        return ResponseEntity.ok(taxonomyService.getChildren(nodeId));
    }

    @GetMapping("/taxonomy/slug/{slug}")
    public ResponseEntity<?> getTaxonomyBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(taxonomyService.getBySlug(slug));
    }

    @GetMapping("/taxonomy/{nodeId}/tree")
    public ResponseEntity<?> getTaxonomyTree(@PathVariable UUID nodeId) {
        return ResponseEntity.ok(taxonomyService.getTree(nodeId));
    }

    @GetMapping("/taxonomy/search")
    public ResponseEntity<?> searchTaxonomy(@RequestParam String q) {
        return ResponseEntity.ok(taxonomyService.search(q));
    }

    // ===== Phase 152: Student Skill Graph =====
    @GetMapping("/skill-graph")
    public ResponseEntity<?> getMySkillGraph(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(graphService.getStudentSkillGraph(userId));
    }

    @GetMapping("/skill-graph/build")
    public ResponseEntity<?> buildMySkillGraph(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(graphService.buildGraph(userId));
    }

    @GetMapping("/skill-graph/strengths")
    public ResponseEntity<?> getSkillStrengths(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(graphService.getSkillStrengths(userId));
    }

    // ===== Phase 153: Skill Gap Analysis =====
    @GetMapping("/skill-gaps/{careerPathId}")
    public ResponseEntity<?> analyzeSkillGaps(@PathVariable UUID careerPathId, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(gapService.analyze(userId, careerPathId));
    }

    @GetMapping("/skill-gaps/weak")
    public ResponseEntity<?> getTopGaps(@RequestParam(defaultValue = "5") int limit, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(gapService.getTopGaps(userId, limit));
    }

    // ===== Phase 157: Career Advisor =====
    @PostMapping("/advisor/sessions")
    public ResponseEntity<?> createAdvisorSession(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(advisorService.createSession(userId));
    }

    @GetMapping("/advisor/sessions")
    public ResponseEntity<?> getMyAdvisorSessions(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(advisorService.getMySessions(userId));
    }

    @GetMapping("/advisor/sessions/{sessionId}/messages")
    public ResponseEntity<?> getAdvisorMessages(@PathVariable UUID sessionId, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(advisorService.getSessionMessages(sessionId, userId));
    }

    @PostMapping("/advisor/sessions/{sessionId}/ask")
    public ResponseEntity<?> askAdvisor(@PathVariable UUID sessionId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String question = body.getOrDefault("question", "");
        return ResponseEntity.ok(advisorService.askQuestion(sessionId, question, userId));
    }

    // ===== Phase 155: Personalized Challenge Config =====
    @GetMapping("/challenge-config")
    public ResponseEntity<?> getChallengeConfig(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(challengeEngine.getConfigOrCreate(userId));
    }

    @PutMapping("/challenge-config")
    public ResponseEntity<?> updateChallengeConfig(@RequestBody PersonalizedChallengeConfig config, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(challengeEngine.updateConfig(userId, config));
    }

    @GetMapping("/challenge-recommendations")
    public ResponseEntity<?> getChallengeRecommendations(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(challengeEngine.getRecommendation(userId));
    }

    // ===== Phase 156: Adaptive Learning =====
    @PostMapping("/adaptive-paths/{careerPathId}")
    public ResponseEntity<?> getOrCreateAdaptivePath(@PathVariable UUID careerPathId, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(adaptiveService.getOrCreatePath(userId, careerPathId));
    }

    @PostMapping("/adaptive-steps/{stepId}/complete")
    public ResponseEntity<?> completeAdaptiveStep(@PathVariable UUID stepId, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(adaptiveService.completeStep(stepId, userId));
    }

    @GetMapping("/adaptive-paths")
    public ResponseEntity<?> getMyAdaptivePaths(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(adaptiveService.getMyPaths(userId));
    }

    // ===== Phase 158: Portfolio Intelligence =====
    @GetMapping("/portfolio/analyze")
    public ResponseEntity<?> analyzePortfolio(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(portfolioService.analyze(userId));
    }

    // ===== Phase 159: Opportunity Matching =====
    @GetMapping("/match/{opportunityId}")
    public ResponseEntity<?> calculateMatch(@PathVariable UUID opportunityId, HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(matchService.calculateMatch(userId, opportunityId));
    }

    @GetMapping("/matches")
    public ResponseEntity<?> getMyMatches(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(matchService.getMyMatches(userId));
    }

    // ===== Phase 160: Career Intelligence Dashboard =====
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Map<String, Object> dashboard = new LinkedHashMap<>();

        // Skill graph summary
        List<Map<String, Object>> skillGraph = graphService.getStudentSkillGraph(userId);
        dashboard.put("skillCount", skillGraph.size());
        dashboard.put("averageProficiency", skillGraph.stream()
            .mapToDouble(s -> ((Number) s.get("proficiencyPct")).doubleValue())
            .average().orElse(0));
        dashboard.put("verifiedSkills", skillGraph.stream()
            .filter(s -> Boolean.TRUE.equals(s.get("verified")))
            .count());

        // Strengths
        dashboard.put("strengths", graphService.getSkillStrengths(userId));

        // Weak skills
        dashboard.put("weakSkills", gapService.getTopGaps(userId, 5));

        // Portfolio analysis
        try {
            dashboard.put("portfolio", portfolioService.analyze(userId));
        } catch (Exception e) {
            dashboard.put("portfolio", Map.of("overallScore", 0));
        }

        // Career readiness — check if any career path is started
        dashboard.put("careerReadiness", Map.of("score", 0, "pathsStarted", 0));

        return ResponseEntity.ok(dashboard);
    }

    private UUID extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.getUserId(auth.substring(7));
        throw new RuntimeException("Unauthorized");
    }
}
