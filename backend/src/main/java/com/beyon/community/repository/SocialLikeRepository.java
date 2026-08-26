package com.beyon.community.repository;

import com.beyon.community.model.SocialLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SocialLikeRepository extends JpaRepository<SocialLike, UUID> {
    Optional<SocialLike> findByUserIdAndTargetTypeAndTargetId(UUID userId, String targetType, UUID targetId);
    long countByTargetTypeAndTargetId(String targetType, UUID targetId);
    boolean existsByUserIdAndTargetTypeAndTargetId(UUID userId, String targetType, UUID targetId);
}
