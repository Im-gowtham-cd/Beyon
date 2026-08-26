package com.beyon.community.repository;

import com.beyon.community.model.ResearchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ResearchParticipantRepository extends JpaRepository<ResearchParticipant, UUID> {
    List<ResearchParticipant> findByProposalId(UUID proposalId);
}
