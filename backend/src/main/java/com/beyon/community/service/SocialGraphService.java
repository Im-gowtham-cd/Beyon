package com.beyon.community.service;

import com.beyon.community.model.UserFollow;
import com.beyon.community.repository.UserFollowRepository;
import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SocialGraphService {

    private final UserFollowRepository followRepo;
    private final UserRepository userRepo;

    public SocialGraphService(UserFollowRepository followRepo, UserRepository userRepo) {
        this.followRepo = followRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public UserFollow follow(UUID followerId, UUID followingId, String followType) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("Cannot follow yourself");
        }
        if (followRepo.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new RuntimeException("Already following this user");
        }
        User follower = userRepo.findById(followerId).orElseThrow();
        User following = userRepo.findById(followingId).orElseThrow();

        UserFollow follow = new UserFollow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        follow.setFollowType(followType);
        return followRepo.save(follow);
    }

    @Transactional
    public void unfollow(UUID followerId, UUID followingId) {
        followRepo.findByFollowerIdAndFollowingId(followerId, followingId)
            .ifPresent(followRepo::delete);
    }

    public List<UserFollow> getFollowing(UUID userId) {
        return followRepo.findByFollowerId(userId);
    }

    public List<UserFollow> getFollowers(UUID userId) {
        return followRepo.findByFollowingId(userId);
    }

    public long getFollowerCount(UUID userId) {
        return followRepo.countByFollowingId(userId);
    }

    public long getFollowingCount(UUID userId) {
        return followRepo.countByFollowerId(userId);
    }

    public boolean isFollowing(UUID followerId, UUID followingId) {
        return followRepo.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
}
