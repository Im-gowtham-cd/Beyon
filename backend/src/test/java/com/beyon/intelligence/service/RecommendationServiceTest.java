package com.beyon.intelligence.service;

import com.beyon.intelligence.client.AiIntelligenceClient;
import com.beyon.intelligence.model.SkillRecommendation;
import com.beyon.intelligence.repository.SkillRecommendationRepository;
import com.beyon.profile.enums.SkillProficiency;
import com.beyon.profile.model.StudentProfile;
import com.beyon.profile.model.StudentSkill;
import com.beyon.profile.repository.StudentProfileRepository;
import com.beyon.profile.repository.StudentSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RecommendationServiceTest {

    private SkillRecommendationRepository recRepo;
    private StudentProfileRepository profileRepo;
    private StudentSkillRepository studentSkillRepo;
    private JdbcTemplate jdbcTemplate;
    private AiIntelligenceClient aiClient;
    private RecommendationService recommendationService;

    @BeforeEach
    void setUp() {
        recRepo = mock(SkillRecommendationRepository.class);
        profileRepo = mock(StudentProfileRepository.class);
        studentSkillRepo = mock(StudentSkillRepository.class);
        jdbcTemplate = mock(JdbcTemplate.class);
        aiClient = mock(AiIntelligenceClient.class);

        recommendationService = new RecommendationService(
                recRepo, profileRepo, studentSkillRepo, jdbcTemplate, aiClient
        );
    }

    @Test
    @DisplayName("Should delegate to AI Intelligence engine and save strictly gap-closing recommendations")
    void testDelegationToAiIntelligenceEngine() {
        UUID studentId = UUID.randomUUID();

        StudentProfile profile = new StudentProfile();
        profile.setUserId(studentId);
        profile.setPreferredJobRoles("Backend Engineer");
        when(profileRepo.findByUserId(studentId)).thenReturn(Optional.of(profile));

        StudentSkill s1 = new StudentSkill();
        s1.setUserId(studentId);
        s1.setSkillName("Java");
        s1.setProficiency(SkillProficiency.ADVANCED);
        when(studentSkillRepo.findByUserId(studentId)).thenReturn(List.of(s1));

        when(jdbcTemplate.queryForList(anyString())).thenReturn(List.of(
                Map.of("id", UUID.randomUUID().toString(), "name", "Docker", "pathTitle", "Backend Engineer", "is_core", true)
        ));

        // Mock AI response returning strictly Docker gap recommendation
        Map<String, Object> aiResponse = new HashMap<>();
        aiResponse.put("rule_applied", "STRICT_PERSONALIZATION (generic/popular courses omitted)");
        aiResponse.put("recommendations", List.of(
                Map.of(
                        "course_id", "crs_docker_deep_dive",
                        "target_skill", "Docker",
                        "title", "Production Docker & Containerization",
                        "estimated_gap_reduction", 25.0,
                        "reason", "Addresses high-priority gap (28.0 pts) in Docker required for Backend Engineer."
                )
        ));

        when(aiClient.getPersonalizedRecommendations(any(), any(), any(), any(), any(), anyInt()))
                .thenReturn(aiResponse);

        when(recRepo.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<SkillRecommendation> result = recommendationService.generateRecommendations(studentId);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("Docker", result.get(0).getSkillName());
        assertTrue(result.get(0).getReason().contains("Addresses high-priority gap"));

        verify(aiClient, times(1)).getPersonalizedRecommendations(
                eq(studentId.toString()), eq("Backend Engineer"), anyMap(), anyList(), anyList(), eq(6)
        );
    }

    @Test
    @DisplayName("Should gracefully fallback to database gap calculation when AI engine is unavailable")
    void testFallbackWhenAiEngineUnavailable() {
        UUID studentId = UUID.randomUUID();

        when(profileRepo.findByUserId(studentId)).thenReturn(Optional.empty());
        when(studentSkillRepo.findByUserId(studentId)).thenReturn(Collections.emptyList());

        UUID skillId = UUID.randomUUID();
        when(jdbcTemplate.queryForList(anyString())).thenReturn(List.of(
                Map.of("id", skillId.toString(), "name", "SQL", "pathTitle", "Data Track", "is_core", true)
        ));

        // Simulate AI service failure / empty response
        when(aiClient.getPersonalizedRecommendations(any(), any(), any(), any(), any(), anyInt()))
                .thenReturn(Collections.emptyMap());

        when(recRepo.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<SkillRecommendation> result = recommendationService.generateRecommendations(studentId);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("SQL", result.get(0).getSkillName());
        assertTrue(result.get(0).getReason().contains("High-priority gap for Data Track"));
    }
}
