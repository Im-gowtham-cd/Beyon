package com.beyon.recruitment.service;

import com.beyon.recruitment.model.AlumniProfile;
import com.beyon.recruitment.model.AlumniConnection;
import com.beyon.recruitment.repository.AlumniProfileRepository;
import com.beyon.recruitment.repository.AlumniConnectionRepository;
import com.beyon.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class AlumniService {

    private final AlumniProfileRepository alumniRepo;
    private final AlumniConnectionRepository connectionRepo;
    private final NotificationService notificationService;

    public AlumniService(AlumniProfileRepository alumniRepo,
                          AlumniConnectionRepository connectionRepo,
                          NotificationService notificationService) {
        this.alumniRepo = alumniRepo;
        this.connectionRepo = connectionRepo;
        this.notificationService = notificationService;
    }

    public AlumniProfile createOrUpdateProfile(UUID userId, AlumniProfile updates) {
        AlumniProfile profile = alumniRepo.findByUserId(userId)
            .orElseGet(() -> {
                AlumniProfile p = new AlumniProfile();
                p.setUserId(userId);
                return p;
            });
        if (updates.getInstitutionId() != null) profile.setInstitutionId(updates.getInstitutionId());
        if (updates.getGraduationYear() != null) profile.setGraduationYear(updates.getGraduationYear());
        if (updates.getCurrentCompany() != null) profile.setCurrentCompany(updates.getCurrentCompany());
        if (updates.getCurrentRole() != null) profile.setCurrentRole(updates.getCurrentRole());
        if (updates.getIndustry() != null) profile.setIndustry(updates.getIndustry());
        if (updates.getExperienceYears() != null) profile.setExperienceYears(updates.getExperienceYears());
        if (updates.getSkills() != null) profile.setSkills(updates.getSkills());
        if (updates.getAchievements() != null) profile.setAchievements(updates.getAchievements());
        if (updates.getBio() != null) profile.setBio(updates.getBio());
        if (updates.getIsMentoring() != null) profile.setIsMentoring(updates.getIsMentoring());
        if (updates.getMentorAvailability() != null) profile.setMentorAvailability(updates.getMentorAvailability());
        if (updates.getPublicProfile() != null) profile.setPublicProfile(updates.getPublicProfile());
        return alumniRepo.save(profile);
    }

    public Optional<AlumniProfile> getProfile(UUID userId) {
        return alumniRepo.findByUserId(userId);
    }

    public List<AlumniProfile> browseAlumni(UUID institutionId) {
        return alumniRepo.findByInstitutionIdAndPublicProfileTrue(institutionId);
    }

    public List<AlumniProfile> getMentors() {
        return alumniRepo.findByIsMentoringTrue();
    }

    public AlumniConnection connect(UUID alumniId, UUID studentId, String type, String message) {
        Optional<AlumniConnection> existing = connectionRepo.findByAlumniIdAndStudentIdAndConnectionType(alumniId, studentId, type);
        if (existing.isPresent()) return existing.get();

        AlumniConnection conn = new AlumniConnection();
        conn.setAlumniId(alumniId);
        conn.setStudentId(studentId);
        conn.setConnectionType(type);
        conn.setMessage(message);
        AlumniConnection saved = connectionRepo.save(conn);

        notificationService.send(alumniId,
            "New " + type.toLowerCase() + " request",
            "A student wants to connect with you.",
            "ALUMNI_CONNECTION", "ALUMNI", saved.getId());
        return saved;
    }

    public AlumniConnection respondToConnection(UUID connectionId, String newStatus) {
        AlumniConnection conn = connectionRepo.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));
        conn.setStatus(newStatus);
        conn.setUpdatedAt(java.time.OffsetDateTime.now());
        return connectionRepo.save(conn);
    }

    public List<AlumniConnection> getMyConnections(UUID userId) {
        List<AlumniConnection> asAlumni = connectionRepo.findByAlumniId(userId);
        List<AlumniConnection> asStudent = connectionRepo.findByStudentId(userId);
        Set<AlumniConnection> combined = new LinkedHashSet<>(asAlumni);
        combined.addAll(asStudent);
        return new ArrayList<>(combined);
    }
}
