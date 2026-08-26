package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {

    private final IndustryProjectRepository projectRepo;
    private final ProjectApplicationRepository appRepo;
    private final UserRepository userRepo;

    public ProjectService(IndustryProjectRepository projectRepo,
                          ProjectApplicationRepository appRepo,
                          UserRepository userRepo) {
        this.projectRepo = projectRepo;
        this.appRepo = appRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public IndustryProject createProject(UUID companyId, String title, String description,
                                          String requiredSkills, String difficulty,
                                          Integer durationWeeks, Integer maxParticipants,
                                          Integer coinReward, Integer xpReward,
                                          Boolean certificateProvided) {
        User company = userRepo.findById(companyId).orElseThrow();
        IndustryProject project = new IndustryProject();
        project.setCompany(company);
        project.setTitle(title);
        project.setDescription(description);
        project.setRequiredSkills(requiredSkills);
        project.setDifficulty(difficulty);
        project.setDurationWeeks(durationWeeks);
        project.setMaxParticipants(maxParticipants);
        project.setCoinReward(coinReward);
        project.setXpReward(xpReward);
        project.setCertificateProvided(certificateProvided);
        project.setStatus("PUBLISHED");
        return projectRepo.save(project);
    }

    public List<IndustryProject> getPublishedProjects() {
        return projectRepo.findByStatus("PUBLISHED");
    }

    public List<IndustryProject> getProjectsByCompany(UUID companyId) {
        return projectRepo.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    @Transactional
    public ProjectApplication applyToProject(UUID projectId, UUID studentId, String coverLetter) {
        IndustryProject project = projectRepo.findById(projectId).orElseThrow();
        if (project.getCurrentParticipants() >= project.getMaxParticipants()) {
            throw new RuntimeException("Project is at full capacity");
        }
        User student = userRepo.findById(studentId).orElseThrow();
        ProjectApplication app = new ProjectApplication();
        app.setProject(project);
        app.setStudent(student);
        app.setCoverLetter(coverLetter);
        return appRepo.save(app);
    }

    @Transactional
    public ProjectApplication selectStudent(UUID applicationId) {
        ProjectApplication app = appRepo.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus("SELECTED");
        app.setSelectedAt(Instant.now());
        IndustryProject project = app.getProject();
        project.setCurrentParticipants(project.getCurrentParticipants() + 1);
        projectRepo.save(project);
        return appRepo.save(app);
    }

    public List<ProjectApplication> getMyApplications(UUID studentId) {
        return appRepo.findByStudentId(studentId);
    }

    public List<ProjectApplication> getProjectApplications(UUID projectId) {
        return appRepo.findByProjectId(projectId);
    }
}
