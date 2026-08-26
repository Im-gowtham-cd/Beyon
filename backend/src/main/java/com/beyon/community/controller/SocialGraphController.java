package com.beyon.community.controller;

import com.beyon.community.service.SocialGraphService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/social")
public class SocialGraphController {

    private final SocialGraphService socialGraphService;

    public SocialGraphController(SocialGraphService socialGraphService) {
        this.socialGraphService = socialGraphService;
    }

    private UUID extractUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @PostMapping("/follow/{userId}")
    public ResponseEntity<?> follow(Authentication auth, @PathVariable UUID userId,
                                     @RequestParam(defaultValue = "STUDENT") String type) {
        UUID followerId = extractUserId(auth);
        socialGraphService.follow(followerId, userId, type);
        return ResponseEntity.ok(Map.of("message", "Now following"));
    }

    @DeleteMapping("/unfollow/{userId}")
    public ResponseEntity<?> unfollow(Authentication auth, @PathVariable UUID userId) {
        UUID followerId = extractUserId(auth);
        socialGraphService.unfollow(followerId, userId);
        return ResponseEntity.ok(Map.of("message", "Unfollowed"));
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<?> getFollowers(@PathVariable UUID userId) {
        return ResponseEntity.ok(socialGraphService.getFollowers(userId));
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<?> getFollowing(@PathVariable UUID userId) {
        return ResponseEntity.ok(socialGraphService.getFollowing(userId));
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<?> checkFollowing(Authentication auth, @PathVariable UUID userId) {
        UUID followerId = extractUserId(auth);
        boolean following = socialGraphService.isFollowing(followerId, userId);
        return ResponseEntity.ok(Map.of("following", following));
    }
}
