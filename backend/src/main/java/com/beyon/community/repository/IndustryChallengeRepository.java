package com.beyon.community.repository;

import com.beyon.community.model.IndustryChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface IndustryChallengeRepository extends JpaRepository<IndustryChallenge, UUID> {
    List<IndustryChallenge> findByOrganizerIdOrderByCreatedAtDesc(UUID organizerId);
    List<IndustryChallenge> findByStatus(String status);
    List<IndustryChallenge> findByOrganizerTypeAndStatus(String organizerType, String status);
}
