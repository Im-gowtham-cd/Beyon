package com.beyon.community.repository;

import com.beyon.community.model.ResearchProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ResearchProposalRepository extends JpaRepository<ResearchProposal, UUID> {
    List<ResearchProposal> findByProposerIdOrderByCreatedAtDesc(UUID proposerId);
    List<ResearchProposal> findByStatus(String status);
}
