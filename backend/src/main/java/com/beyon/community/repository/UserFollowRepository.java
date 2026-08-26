package com.beyon.community.repository;

import com.beyon.community.model.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserFollowRepository extends JpaRepository<UserFollow, UUID> {
    List<UserFollow> findByFollowerId(UUID followerId);
    List<UserFollow> findByFollowingId(UUID followingId);
    Optional<UserFollow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    long countByFollowingId(UUID followingId);
    long countByFollowerId(UUID followerId);
}
