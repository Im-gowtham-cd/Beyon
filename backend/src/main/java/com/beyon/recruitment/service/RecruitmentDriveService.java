package com.beyon.recruitment.service;

import com.beyon.recruitment.model.*;
import com.beyon.recruitment.repository.*;
import com.beyon.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecruitmentDriveService {

    private final RecruitmentDriveRepository driveRepo;
    private final DriveInstitutionTargetRepository targetRepo;
    private final PlacementRegistrationRepository placementRepo;
    private final RecruitmentApplicationRepository applicationRepo;
    private final NotificationService notificationService;

    public RecruitmentDriveService(RecruitmentDriveRepository driveRepo,
                                    DriveInstitutionTargetRepository targetRepo,
                                    PlacementRegistrationRepository placementRepo,
                                    RecruitmentApplicationRepository applicationRepo,
                                    NotificationService notificationService) {
        this.driveRepo = driveRepo;
        this.targetRepo = targetRepo;
        this.placementRepo = placementRepo;
        this.applicationRepo = applicationRepo;
        this.notificationService = notificationService;
    }

    public RecruitmentDrive createDrive(RecruitmentDrive drive) {
        if (drive.getJobRole() == null || drive.getJobRole().isBlank()) {
            drive.setJobRole(drive.getTitle() != null ? drive.getTitle() : "Software Engineer");
        }
        if (drive.getStatus() == null || drive.getStatus().isBlank()) {
            drive.setStatus("ACTIVE");
        }
        return driveRepo.save(drive);
    }

    public RecruitmentDrive updateDrive(UUID driveId, RecruitmentDrive updates, UUID companyId) {
        RecruitmentDrive drive = driveRepo.findById(driveId)
            .orElseThrow(() -> new RuntimeException("Drive not found"));
        if (!drive.getCompanyUserId().equals(companyId)) throw new RuntimeException("Forbidden");
        if (updates.getTitle() != null) drive.setTitle(updates.getTitle());
        if (updates.getDescription() != null) drive.setDescription(updates.getDescription());
        if (updates.getJobRole() != null) drive.setJobRole(updates.getJobRole());
        if (updates.getRequiredSkills() != null) drive.setRequiredSkills(updates.getRequiredSkills());
        if (updates.getPreferredSkills() != null) drive.setPreferredSkills(updates.getPreferredSkills());
        if (updates.getMinCgpa() != null) drive.setMinCgpa(updates.getMinCgpa());
        if (updates.getEligibleDepartments() != null) drive.setEligibleDepartments(updates.getEligibleDepartments());
        if (updates.getEligibleGraduationYears() != null) drive.setEligibleGraduationYears(updates.getEligibleGraduationYears());
        if (updates.getSalaryRange() != null) drive.setSalaryRange(updates.getSalaryRange());
        if (updates.getLocation() != null) drive.setLocation(updates.getLocation());
        if (updates.getWorkMode() != null) drive.setWorkMode(updates.getWorkMode());
        if (updates.getApplicationDeadline() != null) drive.setApplicationDeadline(updates.getApplicationDeadline());
        if (updates.getAssessmentId() != null) drive.setAssessmentId(updates.getAssessmentId());
        if (updates.getMaxCandidates() != null) drive.setMaxCandidates(updates.getMaxCandidates());
        if (updates.getCoinCost() != null) drive.setCoinCost(updates.getCoinCost());
        if (updates.getTargetingMode() != null) drive.setTargetingMode(updates.getTargetingMode());
        drive.setUpdatedAt(OffsetDateTime.now());
        return driveRepo.save(drive);
    }

    public RecruitmentDrive updateStatus(UUID driveId, String newStatus, UUID companyId) {
        RecruitmentDrive drive = driveRepo.findById(driveId)
            .orElseThrow(() -> new RuntimeException("Drive not found"));
        if (!drive.getCompanyUserId().equals(companyId)) throw new RuntimeException("Forbidden");
        drive.setStatus(newStatus);
        drive.setUpdatedAt(OffsetDateTime.now());
        return driveRepo.save(drive);
    }

    public List<RecruitmentDrive> getMyDrives(UUID companyId) {
        return driveRepo.findByCompanyUserIdOrderByCreatedAtDesc(companyId);
    }

    public List<RecruitmentDrive> getPublishedDrives() {
        return driveRepo.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    public List<RecruitmentDrive> getPublicDrives() {
        return driveRepo.findByStatusInOrderByCreatedAtDesc(List.of("ACTIVE", "PUBLISHED", "OPEN"));
    }

    public List<RecruitmentDrive> getInstitutionDrives(UUID institutionId) {
        return targetRepo.findByInstitutionId(institutionId).stream()
            .map(t -> driveRepo.findById(t.getDriveId()).orElse(null))
            .filter(Objects::nonNull)
            .filter(d -> "ACTIVE".equals(d.getStatus()) || "PUBLISHED".equals(d.getStatus()))
            .collect(Collectors.toList());
    }

    public void addTarget(UUID driveId, DriveInstitutionTarget target) {
        target.setDriveId(driveId);
        targetRepo.save(target);
    }

    public List<DriveInstitutionTarget> getTargets(UUID driveId) {
        return targetRepo.findByDriveId(driveId);
    }

    public void publishDrive(UUID driveId, UUID companyId) {
        RecruitmentDrive drive = driveRepo.findById(driveId)
            .orElseThrow(() -> new RuntimeException("Drive not found"));
        if (!drive.getCompanyUserId().equals(companyId)) throw new RuntimeException("Forbidden");
        drive.setStatus("ACTIVE");
        drive.setUpdatedAt(OffsetDateTime.now());
        driveRepo.save(drive);

        // Notify eligible students if targeting institutions
        if ("INSTITUTION".equals(drive.getTargetingMode())) {
            List<DriveInstitutionTarget> targets = targetRepo.findByDriveId(driveId);
            for (DriveInstitutionTarget target : targets) {
                List<PlacementRegistration> registrations = placementRepo
                    .findByInstitutionIdAndPlacementPreference(target.getInstitutionId(), "WILLING");
                for (PlacementRegistration reg : registrations) {
                    notificationService.send(reg.getStudentId(),
                        "New Recruitment Drive: " + drive.getTitle(),
                        drive.getCompanyUserId() + " is hiring for " + drive.getJobRole() + ". Apply now!",
                        "RECRUITMENT_DRIVE", "DRIVE", driveId);
                }
            }
        }
    }

    public Map<String, Object> getDriveStats(UUID driveId) {
        RecruitmentDrive drive = driveRepo.findById(driveId)
            .orElseThrow(() -> new RuntimeException("Drive not found"));
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("drive", drive);
        stats.put("targetCount", targetRepo.findByDriveId(driveId).size());
        stats.put("applications", applicationRepo.findByDriveId(driveId).size());
        return stats;
    }

    public RecruitmentDrive getDrive(UUID driveId) {
        return driveRepo.findById(driveId)
            .orElseThrow(() -> new RuntimeException("Drive not found"));
    }
}
