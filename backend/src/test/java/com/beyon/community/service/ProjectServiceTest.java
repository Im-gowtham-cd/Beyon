package com.beyon.community.service;

import com.beyon.community.model.IndustryProject;
import com.beyon.community.model.ProjectApplication;
import com.beyon.community.repository.IndustryProjectRepository;
import com.beyon.community.repository.ProjectApplicationRepository;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProjectServiceTest {

    private IndustryProjectRepository projectRepo;
    private ProjectApplicationRepository appRepo;
    private UserRepository userRepo;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectRepo = mock(IndustryProjectRepository.class);
        appRepo = mock(ProjectApplicationRepository.class);
        userRepo = mock(UserRepository.class);

        projectService = new ProjectService(projectRepo, appRepo, userRepo);
    }

    @Test
    @DisplayName("createProject creates a published project with correct rewards and company owner")
    void testCreateProjectSuccess() {
        UUID companyId = UUID.randomUUID();
        User company = new User();
        company.setId(companyId);

        when(userRepo.findById(companyId)).thenReturn(Optional.of(company));
        when(projectRepo.save(any(IndustryProject.class))).thenAnswer(inv -> inv.getArgument(0));

        IndustryProject project = projectService.createProject(
                companyId,
                "Distributed Cache Engine",
                "Build a high performance in-memory cache",
                "Java, Redis, Concurrency",
                "ADVANCED",
                6,
                5,
                100,
                250,
                true
        );

        assertNotNull(project);
        assertEquals("Distributed Cache Engine", project.getTitle());
        assertEquals(company, project.getCompany());
        assertEquals("PUBLISHED", project.getStatus());
        assertEquals(100, project.getCoinReward());
        assertEquals(250, project.getXpReward());
        assertTrue(project.getCertificateProvided());
        verify(projectRepo).save(any(IndustryProject.class));
    }

    @Test
    @DisplayName("applyToProject creates student application when project has capacity")
    void testApplyToProjectSuccess() {
        UUID projectId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        IndustryProject project = new IndustryProject();
        project.setId(projectId);
        project.setMaxParticipants(5);
        project.setCurrentParticipants(2);

        User student = new User();
        student.setId(studentId);

        when(projectRepo.findById(projectId)).thenReturn(Optional.of(project));
        when(userRepo.findById(studentId)).thenReturn(Optional.of(student));
        when(appRepo.save(any(ProjectApplication.class))).thenAnswer(inv -> inv.getArgument(0));

        ProjectApplication app = projectService.applyToProject(projectId, studentId, "I love distributed systems");

        assertNotNull(app);
        assertEquals(project, app.getProject());
        assertEquals(student, app.getStudent());
        assertEquals("I love distributed systems", app.getCoverLetter());
        verify(appRepo).save(any(ProjectApplication.class));
    }

    @Test
    @DisplayName("applyToProject throws exception when project has reached max capacity")
    void testApplyToProjectFullCapacity() {
        UUID projectId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        IndustryProject project = new IndustryProject();
        project.setId(projectId);
        project.setMaxParticipants(3);
        project.setCurrentParticipants(3); // Full!

        when(projectRepo.findById(projectId)).thenReturn(Optional.of(project));

        Exception ex = assertThrows(RuntimeException.class, () ->
                projectService.applyToProject(projectId, studentId, "Cover letter"));
        assertEquals("Project is at full capacity", ex.getMessage());
        verify(appRepo, never()).save(any());
    }

    @Test
    @DisplayName("selectStudent marks status SELECTED and increments project participants")
    void testSelectStudentSuccess() {
        UUID appId = UUID.randomUUID();

        IndustryProject project = new IndustryProject();
        project.setCurrentParticipants(1);

        ProjectApplication app = new ProjectApplication();
        app.setId(appId);
        app.setStatus("APPLIED");
        app.setProject(project);

        when(appRepo.findById(appId)).thenReturn(Optional.of(app));
        when(appRepo.save(any(ProjectApplication.class))).thenAnswer(inv -> inv.getArgument(0));

        ProjectApplication selected = projectService.selectStudent(appId);

        assertEquals("SELECTED", selected.getStatus());
        assertNotNull(selected.getSelectedAt());
        assertEquals(2, project.getCurrentParticipants());
        verify(projectRepo).save(project);
    }
}
