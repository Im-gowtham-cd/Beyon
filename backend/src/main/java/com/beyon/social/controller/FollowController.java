package com.beyon.social.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.social.model.Follow;
import com.beyon.social.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Follow>> follow(Authentication auth, @RequestBody Map<String, String> body) {
        UUID userId = extractUserId(auth);
        UUID targetId = UUID.fromString(body.get("targetId"));
        String type = body.get("type");
        return ResponseEntity.ok(ApiResponse.ok(followService.follow(userId, targetId, type)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> unfollow(Authentication auth, @RequestBody Map<String, String> body) {
        UUID userId = extractUserId(auth);
        UUID targetId = UUID.fromString(body.get("targetId"));
        String type = body.get("type");
        followService.unfollow(userId, targetId, type);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/following")
    public ResponseEntity<ApiResponse<List<Follow>>> getFollowing(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(followService.getFollowing(userId)));
    }

    @GetMapping("/followers")
    public ResponseEntity<ApiResponse<List<Follow>>> getFollowers(Authentication auth) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(followService.getFollowers(userId)));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkFollow(Authentication auth, @RequestParam UUID targetId, @RequestParam String type) {
        UUID userId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(followService.isFollowing(userId, targetId, type)));
    }

    @GetMapping("/count/{userId}")
    public ResponseEntity<ApiResponse<Long>> getFollowerCount(@PathVariable UUID userId, @RequestParam String type) {
        return ResponseEntity.ok(ApiResponse.ok(followService.getFollowerCount(userId, type)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
