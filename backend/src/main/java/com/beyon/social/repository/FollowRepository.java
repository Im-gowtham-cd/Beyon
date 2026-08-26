package com.beyon.social.repository;

import com.beyon.social.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {
    List<Follow> findByFollowerId(UUID followerId);
    List<Follow> findByFollowingId(UUID followingId);
    boolean existsByFollowerIdAndFollowingIdAndFollowType(UUID followerId, UUID followingId, String followType);
    long countByFollowingIdAndFollowType(UUID followingId, String followType);
    long countByFollowerIdAndFollowType(UUID followerId, String followType);
}
