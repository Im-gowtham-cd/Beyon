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
public class ChallengeService {

    private final IndustryChallengeRepository challengeRepo;
    private final ChallengeParticipationRepository participationRepo;
    private final UserRepository userRepo;

    public ChallengeService(IndustryChallengeRepository challengeRepo,
                            ChallengeParticipationRepository participationRepo,
                            UserRepository userRepo) {
        this.challengeRepo = challengeRepo;
        this.participationRepo = participationRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public IndustryChallenge createChallenge(UUID organizerId, String organizerType, String title,
                                              String description, String problemStatement,
                                              String requiredSkills, String difficulty, String rules,
                                              Instant deadline, Integer minTeamSize, Integer maxTeamSize,
                                              Integer coinReward, Integer xpReward,
                                              String badgeName, Boolean certificateProvided) {
        User organizer = userRepo.findById(organizerId).orElseThrow();
        IndustryChallenge challenge = new IndustryChallenge();
        challenge.setOrganizer(organizer);
        challenge.setOrganizerType(organizerType);
        challenge.setTitle(title);
        challenge.setDescription(description);
        challenge.setProblemStatement(problemStatement);
        challenge.setRequiredSkills(requiredSkills);
        challenge.setDifficulty(difficulty);
        challenge.setRules(rules);
        challenge.setDeadline(deadline);
        challenge.setMinTeamSize(minTeamSize);
        challenge.setMaxTeamSize(maxTeamSize);
        challenge.setCoinReward(coinReward);
        challenge.setXpReward(xpReward);
        challenge.setBadgeName(badgeName);
        challenge.setCertificateProvided(certificateProvided);
        challenge.setStatus("PUBLISHED");
        return challengeRepo.save(challenge);
    }

    public List<IndustryChallenge> getPublishedChallenges() {
        return challengeRepo.findByStatus("PUBLISHED");
    }

    public List<IndustryChallenge> getChallengesByOrganizer(UUID organizerId) {
        return challengeRepo.findByOrganizerIdOrderByCreatedAtDesc(organizerId);
    }

    @Transactional
    public ChallengeParticipation participate(UUID challengeId, UUID studentId,
                                               String teamName, String teamMembers) {
        if (participationRepo.existsByChallengeIdAndStudentId(challengeId, studentId)) {
            throw new RuntimeException("Already participating in this challenge");
        }
        IndustryChallenge challenge = challengeRepo.findById(challengeId).orElseThrow();
        User student = userRepo.findById(studentId).orElseThrow();
        ChallengeParticipation participation = new ChallengeParticipation();
        participation.setChallenge(challenge);
        participation.setStudent(student);
        participation.setTeamName(teamName);
        participation.setTeamMembers(teamMembers);
        return participationRepo.save(participation);
    }

    @Transactional
    public ChallengeParticipation submit(UUID participationId, String submissionUrl,
                                          String submissionDocs, String submissionDemo,
                                          String submissionPresentation) {
        ChallengeParticipation p = participationRepo.findById(participationId)
            .orElseThrow(() -> new RuntimeException("Participation not found"));
        p.setSubmissionUrl(submissionUrl);
        p.setSubmissionDocs(submissionDocs);
        p.setSubmissionDemo(submissionDemo);
        p.setSubmissionPresentation(submissionPresentation);
        p.setSubmittedAt(Instant.now());
        p.setStatus("SUBMITTED");
        return participationRepo.save(p);
    }

    public List<ChallengeParticipation> getMyParticipations(UUID studentId) {
        return participationRepo.findByStudentId(studentId);
    }

    public List<ChallengeParticipation> getChallengeSubmissions(UUID challengeId) {
        return participationRepo.findByChallengeId(challengeId);
    }
}
