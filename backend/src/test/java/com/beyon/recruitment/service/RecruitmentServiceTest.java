package com.beyon.recruitment.service;

import com.beyon.assessment.repository.AssessmentResultRepository;
import com.beyon.common.exception.ConflictException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.identity.repository.UserRepository;
import com.beyon.institution.repository.InstitutionStudentRepository;
import com.beyon.notification.service.NotificationService;
import com.beyon.practice.model.CompanyOpportunity;
import com.beyon.practice.repository.CompanyOpportunityRepository;
import com.beyon.profile.repository.StudentProfileRepository;
import com.beyon.profile.repository.StudentSkillRepository;
import com.beyon.recruitment.model.RecruitmentApplication;
import com.beyon.recruitment.model.RecruitmentStatusHistory;
import com.beyon.recruitment.repository.PlacementRecordRepository;
import com.beyon.recruitment.repository.RecruitmentApplicationRepository;
import com.beyon.recruitment.repository.RecruitmentStatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RecruitmentServiceTest {

    private RecruitmentApplicationRepository applicationRepository;
    private RecruitmentStatusHistoryRepository historyRepository;
    private CompanyOpportunityRepository opportunityRepository;
    private NotificationService notificationService;
    private UserRepository userRepository;
    private StudentProfileRepository studentProfileRepository;
    private StudentSkillRepository studentSkillRepository;
    private AssessmentResultRepository assessmentResultRepository;
    private InstitutionStudentRepository institutionStudentRepository;
    private PlacementRecordRepository placementRecordRepository;

    private RecruitmentService recruitmentService;

    @BeforeEach
    void setUp() {
        applicationRepository = mock(RecruitmentApplicationRepository.class);
        historyRepository = mock(RecruitmentStatusHistoryRepository.class);
        opportunityRepository = mock(CompanyOpportunityRepository.class);
        notificationService = mock(NotificationService.class);
        userRepository = mock(UserRepository.class);
        studentProfileRepository = mock(StudentProfileRepository.class);
        studentSkillRepository = mock(StudentSkillRepository.class);
        assessmentResultRepository = mock(AssessmentResultRepository.class);
        institutionStudentRepository = mock(InstitutionStudentRepository.class);
        placementRecordRepository = mock(PlacementRecordRepository.class);

        recruitmentService = new RecruitmentService(
                applicationRepository,
                historyRepository,
                opportunityRepository,
                notificationService,
                userRepository,
                studentProfileRepository,
                studentSkillRepository,
                assessmentResultRepository,
                institutionStudentRepository,
                placementRecordRepository
        );
    }

    @Test
    @DisplayName("getStudentApplications returns student applications")
    void testGetStudentApplications() {
        UUID studentId = UUID.randomUUID();
        RecruitmentApplication app = new RecruitmentApplication();
        app.setStudentId(studentId);

        when(applicationRepository.findByStudentIdOrderByCreatedAtDesc(studentId))
                .thenReturn(List.of(app));

        List<RecruitmentApplication> result = recruitmentService.getStudentApplications(studentId);
        assertEquals(1, result.size());
        assertEquals(studentId, result.get(0).getStudentId());
    }

    @Test
    @DisplayName("updateStatus updates status, logs history, and notifies candidate")
    void testUpdateStatusSuccess() {
        UUID appId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        UUID oppId = UUID.randomUUID();
        UUID recruiterId = UUID.randomUUID();

        RecruitmentApplication app = new RecruitmentApplication();
        app.setId(appId);
        app.setStudentId(studentId);
        app.setOpportunityId(oppId);
        app.setStatus("APPLIED");

        CompanyOpportunity opp = new CompanyOpportunity();
        opp.setId(oppId);
        opp.setTitle("Senior Fullstack Dev");

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));
        when(opportunityRepository.findById(oppId)).thenReturn(Optional.of(opp));
        when(applicationRepository.save(any(RecruitmentApplication.class))).thenAnswer(inv -> inv.getArgument(0));

        RecruitmentApplication updated = recruitmentService.updateStatus(appId, "SHORTLISTED", recruiterId, "Strong profile");

        assertEquals("SHORTLISTED", updated.getStatus());

        ArgumentCaptor<RecruitmentStatusHistory> historyCaptor = ArgumentCaptor.forClass(RecruitmentStatusHistory.class);
        verify(historyRepository).save(historyCaptor.capture());
        assertEquals("APPLIED", historyCaptor.getValue().getFromStatus());
        assertEquals("SHORTLISTED", historyCaptor.getValue().getToStatus());
        assertEquals("Strong profile", historyCaptor.getValue().getNotes());

        verify(notificationService).send(eq(studentId), eq("Application Status Updated"), anyString(), eq("APPLICATION_STATUS"), eq("RECRUITMENT_APPLICATION"), eq(appId));
    }

    @Test
    @DisplayName("withdraw by student marks application as WITHDRAWN")
    void testWithdrawSuccess() {
        UUID appId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        RecruitmentApplication app = new RecruitmentApplication();
        app.setId(appId);
        app.setStudentId(studentId);
        app.setStatus("APPLIED");

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any(RecruitmentApplication.class))).thenAnswer(inv -> inv.getArgument(0));

        RecruitmentApplication result = recruitmentService.withdraw(studentId, appId);

        assertEquals("WITHDRAWN", result.getStatus());
    }

    @Test
    @DisplayName("withdraw by different user throws ConflictException")
    void testWithdrawUnauthorizedStudent() {
        UUID appId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID hackerId = UUID.randomUUID();

        RecruitmentApplication app = new RecruitmentApplication();
        app.setId(appId);
        app.setStudentId(ownerId);

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));

        assertThrows(ConflictException.class, () -> recruitmentService.withdraw(hackerId, appId));
    }

    @Test
    @DisplayName("updateStatus on non-existent application throws ResourceNotFoundException")
    void testUpdateStatusNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(applicationRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                recruitmentService.updateStatus(unknownId, "REJECTED", UUID.randomUUID(), ""));
    }

    @Test
    @DisplayName("getPipelineStats aggregates candidate counts across recruitment stages")
    void testGetPipelineStats() {
        UUID oppId = UUID.randomUUID();

        when(applicationRepository.countByOpportunityIdAndStatus(oppId, "APPLIED")).thenReturn(25L);
        when(applicationRepository.countByOpportunityIdAndStatus(oppId, "SHORTLISTED")).thenReturn(10L);
        when(applicationRepository.countByOpportunityIdAndStatus(oppId, "INTERVIEW")).thenReturn(5L);
        when(applicationRepository.countByOpportunityIdAndStatus(oppId, "SELECTED")).thenReturn(2L);

        Map<String, Long> stats = recruitmentService.getPipelineStats(oppId);

        assertEquals(25L, stats.get("APPLIED"));
        assertEquals(10L, stats.get("SHORTLISTED"));
        assertEquals(5L, stats.get("INTERVIEW"));
        assertEquals(2L, stats.get("SELECTED"));
    }
}
