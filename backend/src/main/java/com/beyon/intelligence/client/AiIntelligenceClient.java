package com.beyon.intelligence.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;

/**
 * HTTP client connecting the Spring Boot core backend to the FastAPI AI Intelligence service.
 * Supports personalized gap-closing recommendations, sprint questions, and skill onboarding.
 */
@Component
public class AiIntelligenceClient {

    private static final Logger log = LoggerFactory.getLogger(AiIntelligenceClient.class);
    private final RestClient restClient;

    public AiIntelligenceClient(@Value("${beyon.ai-service.url:http://localhost:8000}") String aiServiceUrl) {
        log.info("Initializing AiIntelligenceClient with endpoint: {}", aiServiceUrl);
        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }

    /**
     * Request strictly personalized recommendations closing this student's specific gaps.
     * Enforces anti-popular course filtering at the AI engine layer.
     */
    public Map<String, Object> getPersonalizedRecommendations(
            String studentId,
            String targetRole,
            Map<String, Object> studentSkills,
            List<Map<String, Object>> roleRequirements,
            List<String> completedCourseIds,
            int maxRecommendations
    ) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("student_id", studentId);
            payload.put("target_role", targetRole != null ? targetRole : "Software Engineer");
            payload.put("student_skills", studentSkills != null ? studentSkills : Collections.emptyMap());
            payload.put("role_requirements", roleRequirements != null ? roleRequirements : Collections.emptyList());
            payload.put("completed_course_ids", completedCourseIds != null ? completedCourseIds : Collections.emptyList());
            payload.put("max_recommendations", maxRecommendations > 0 ? maxRecommendations : 5);

            return restClient.post()
                    .uri("/api/v1/intelligence/recommendations/personalized")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to get personalized recommendations from AI service: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * Request targeted daily sprint questions closing the student's highest priority gaps.
     */
    public Map<String, Object> getPersonalizedDailyQuestions(
            String studentId,
            String targetRole,
            Map<String, Object> studentSkills,
            List<Map<String, Object>> roleRequirements,
            int questionCount
    ) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("student_id", studentId);
            payload.put("target_role", targetRole != null ? targetRole : "Software Engineer");
            payload.put("student_skills", studentSkills != null ? studentSkills : Collections.emptyMap());
            payload.put("role_requirements", roleRequirements != null ? roleRequirements : Collections.emptyList());
            payload.put("question_count", questionCount > 0 ? questionCount : 5);

            return restClient.post()
                    .uri("/api/v1/intelligence/daily-questions/personalized")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to get daily questions from AI service: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * Call the multi-factor skill gap calculation engine.
     */
    public Map<String, Object> analyzeSkillGaps(
            String studentId,
            String targetRole,
            Map<String, Object> studentSkills,
            List<Map<String, Object>> roleRequirements,
            List<String> studentInterests
    ) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("student_id", studentId);
            payload.put("target_role", targetRole != null ? targetRole : "Software Engineer");
            payload.put("student_skills", studentSkills != null ? studentSkills : Collections.emptyMap());
            payload.put("role_requirements", roleRequirements != null ? roleRequirements : Collections.emptyList());
            payload.put("student_interests", studentInterests != null ? studentInterests : Collections.emptyList());

            return restClient.post()
                    .uri("/api/v1/intelligence/skill-gap/analyze")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to analyze skill gaps via AI service: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * Submit question attempt telemetry for adaptive mastery and confidence updating.
     */
    public Map<String, Object> processAttempt(
            String studentId,
            String skillName,
            String subtopic,
            boolean isCorrect,
            int timeSpentSeconds,
            double currentProficiency,
            double currentConfidence
    ) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("student_id", studentId);
            payload.put("skill_name", skillName);
            payload.put("subtopic", subtopic);
            payload.put("is_correct", isCorrect);
            payload.put("time_spent_seconds", timeSpentSeconds);
            payload.put("current_proficiency", currentProficiency);
            payload.put("current_confidence", currentConfidence);

            return restClient.post()
                    .uri("/api/v1/intelligence/adaptive/submit-attempt")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to process attempt telemetry via AI service: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }
}
