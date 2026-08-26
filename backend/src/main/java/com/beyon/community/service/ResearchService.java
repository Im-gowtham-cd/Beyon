package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ResearchService {

    private final ResearchProposalRepository proposalRepo;
    private final ResearchParticipantRepository participantRepo;
    private final UserRepository userRepo;

    public ResearchService(ResearchProposalRepository proposalRepo,
                           ResearchParticipantRepository participantRepo,
                           UserRepository userRepo) {
        this.proposalRepo = proposalRepo;
        this.participantRepo = participantRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public ResearchProposal createProposal(UUID proposerId, String proposerType, String title,
                                            String description, String domain, String requiredSkills,
                                            String expectedOutcome, Integer durationWeeks,
                                            BigDecimal budgetAmount, Integer maxParticipants,
                                            String documents) {
        User proposer = userRepo.findById(proposerId).orElseThrow();
        ResearchProposal proposal = new ResearchProposal();
        proposal.setProposer(proposer);
        proposal.setProposerType(proposerType);
        proposal.setTitle(title);
        proposal.setDescription(description);
        proposal.setDomain(domain);
        proposal.setRequiredSkills(requiredSkills);
        proposal.setExpectedOutcome(expectedOutcome);
        proposal.setDurationWeeks(durationWeeks);
        proposal.setBudgetAmount(budgetAmount);
        proposal.setMaxParticipants(maxParticipants);
        proposal.setDocuments(documents);
        proposal.setStatus("PUBLISHED");
        return proposalRepo.save(proposal);
    }

    public List<ResearchProposal> getPublishedProposals() {
        return proposalRepo.findByStatus("PUBLISHED");
    }

    public List<ResearchProposal> getMyProposals(UUID proposerId) {
        return proposalRepo.findByProposerIdOrderByCreatedAtDesc(proposerId);
    }

    @Transactional
    public ResearchParticipant joinProposal(UUID proposalId, UUID userId, String role) {
        ResearchProposal proposal = proposalRepo.findById(proposalId).orElseThrow();
        User user = userRepo.findById(userId).orElseThrow();
        ResearchParticipant participant = new ResearchParticipant();
        participant.setProposal(proposal);
        participant.setUser(user);
        participant.setRole(role);
        participant.setStatus("ACCEPTED");
        participant.setJoinedAt(Instant.now());
        return participantRepo.save(participant);
    }

    public List<ResearchParticipant> getProposalParticipants(UUID proposalId) {
        return participantRepo.findByProposalId(proposalId);
    }
}
