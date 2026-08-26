package com.beyon.community.repository;

import com.beyon.community.model.ChallengeParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChallengeParticipationRepository extends JpaRepository<ChallengeParticipation, UUID> {
    List<ChallengeParticipation> findByStudentId(UUID studentId);
    List<ChallengeParticipation> findByChallengeId(UUID challengeId);
    Optional<ChallengeParticipation> findByChallengeIdAndStudentId(UUID challengeId, UUID studentId);
    boolean existsByChallengeIdAndStudentId(UUID challengeId, UUID studentId);
}
