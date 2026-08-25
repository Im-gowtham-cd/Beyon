package com.beyon.social.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.social.model.Follow;
import com.beyon.social.repository.FollowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FollowService {

    private final FollowRepository followRepository;

    public FollowService(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    @Transactional
    public Follow follow(UUID followerId, UUID followingId, String type) {
        if (followerId.equals(followingId)) {
            throw new ConflictException("Cannot follow yourself");
        }
        if (followRepository.existsByFollowerIdAndFollowingIdAndFollowType(followerId, followingId, type)) {
            throw new ConflictException("Already following");
        }
        Follow follow = new Follow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);
        follow.setFollowType(type);
        return followRepository.save(follow);
    }

    @Transactional
    public void unfollow(UUID followerId, UUID followingId, String type) {
        Follow follow = followRepository.findByFollowerId(followerId).stream()
                .filter(f -> f.getFollowingId().equals(followingId) && f.getFollowType().equals(type))
                .findFirst()
                .orElseThrow(() -> new ConflictException("Not following"));
        followRepository.delete(follow);
    }

    public boolean isFollowing(UUID followerId, UUID followingId, String type) {
        return followRepository.existsByFollowerIdAndFollowingIdAndFollowType(followerId, followingId, type);
    }

    public List<Follow> getFollowing(UUID userId) {
        return followRepository.findByFollowerId(userId);
    }

    public List<Follow> getFollowers(UUID userId) {
        return followRepository.findByFollowingId(userId);
    }

    public long getFollowerCount(UUID userId, String type) {
        return followRepository.countByFollowingIdAndFollowType(userId, type);
    }
}
