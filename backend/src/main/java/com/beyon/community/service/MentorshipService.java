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
public class MentorshipService {

    private final MentorProfileRepository profileRepo;
    private final MentorshipRequestRepository requestRepo;
    private final MentorshipSessionRepository sessionRepo;
    private final UserRepository userRepo;

    public MentorshipService(MentorProfileRepository profileRepo,
                             MentorshipRequestRepository requestRepo,
                             MentorshipSessionRepository sessionRepo,
                             UserRepository userRepo) {
        this.profileRepo = profileRepo;
        this.requestRepo = requestRepo;
        this.sessionRepo = sessionRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public MentorProfile createOrUpdateProfile(UUID userId, String companyName, String jobTitle,
                                                Integer experienceYears, String bio,
                                                String expertiseSkills, String topics,
                                                Integer maxMentees) {
        MentorProfile profile = profileRepo.findByUserId(userId).orElse(new MentorProfile());
        User user = userRepo.findById(userId).orElseThrow();
        profile.setUser(user);
        profile.setCompanyName(companyName);
        profile.setJobTitle(jobTitle);
        profile.setExperienceYears(experienceYears);
        profile.setBio(bio);
        profile.setExpertiseSkills(expertiseSkills);
        profile.setTopics(topics);
        profile.setMaxMentees(maxMentees);
        profile.setUpdatedAt(Instant.now());
        return profileRepo.save(profile);
    }

    public List<MentorProfile> getAvailableMentors() {
        return profileRepo.findByAvailability("AVAILABLE");
    }

    public MentorProfile getMentorProfile(UUID userId) {
        return profileRepo.findByUserId(userId).orElse(null);
    }

    @Transactional
    public MentorshipRequest requestMentorship(UUID studentId, UUID mentorUserId, String message) {
        MentorProfile mentor = profileRepo.findByUserId(mentorUserId)
            .orElseThrow(() -> new RuntimeException("Mentor profile not found"));
        User student = userRepo.findById(studentId).orElseThrow();

        MentorshipRequest request = new MentorshipRequest();
        request.setStudent(student);
        request.setMentor(mentor);
        request.setMessage(message);
        return requestRepo.save(request);
    }

    @Transactional
    public MentorshipRequest acceptRequest(UUID requestId) {
        MentorshipRequest request = requestRepo.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus("ACCEPTED");
        request.setAcceptedAt(Instant.now());
        return requestRepo.save(request);
    }

    @Transactional
    public MentorshipRequest completeRequest(UUID requestId) {
        MentorshipRequest request = requestRepo.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus("COMPLETED");
        request.setCompletedAt(Instant.now());
        return requestRepo.save(request);
    }

    public List<MentorshipRequest> getMyRequestsAsStudent(UUID studentId) {
        return requestRepo.findByStudentId(studentId);
    }

    public List<MentorshipRequest> getMyRequestsAsMentor(UUID mentorUserId) {
        MentorProfile profile = profileRepo.findByUserId(mentorUserId).orElse(null);
        if (profile == null) return List.of();
        return requestRepo.findByMentorId(profile.getId());
    }

    @Transactional
    public MentorshipSession scheduleSession(UUID requestId, String topic, Instant scheduledAt,
                                              Integer durationMinutes, String meetingLink) {
        MentorshipRequest request = requestRepo.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        MentorshipSession session = new MentorshipSession();
        session.setRequest(request);
        session.setTopic(topic);
        session.setScheduledAt(scheduledAt);
        session.setDurationMinutes(durationMinutes);
        session.setMeetingLink(meetingLink);
        return sessionRepo.save(session);
    }

    public List<MentorshipSession> getSessionsForRequest(UUID requestId) {
        return sessionRepo.findByRequestId(requestId);
    }
}
