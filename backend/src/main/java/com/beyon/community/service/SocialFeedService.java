package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SocialFeedService {
    private final SocialPostRepository postRepo;
    private final SocialCommentRepository commentRepo;
    private final SocialLikeRepository likeRepo;

    public SocialFeedService(SocialPostRepository postRepo, SocialCommentRepository commentRepo, SocialLikeRepository likeRepo) {
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.likeRepo = likeRepo;
    }

    public SocialPost createPost(UUID authorId, String authorType, String postType, String title, String content) {
        SocialPost post = new SocialPost();
        post.setAuthorId(authorId);
        post.setAuthorType(authorType);
        post.setPostType(postType != null ? postType : "TEXT");
        post.setTitle(title);
        post.setContent(content);
        return postRepo.save(post);
    }

    public List<SocialPost> getFeed(int page, int size) {
        return postRepo.findByVisibilityOrderByCreatedAtDesc("PUBLIC").stream()
            .skip((long) page * size).limit(size).collect(Collectors.toList());
    }

    public SocialPost getPost(UUID postId) { return postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found")); }

    public void deletePost(UUID postId, UUID userId) {
        SocialPost post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getAuthorId().equals(userId)) throw new RuntimeException("Unauthorized");
        postRepo.delete(post);
    }

    public SocialComment addComment(UUID postId, UUID authorId, String content) {
        SocialComment comment = new SocialComment();
        comment.setPostId(postId);
        comment.setAuthorId(authorId);
        comment.setContent(content);
        SocialComment saved = commentRepo.save(comment);
        SocialPost post = postRepo.findById(postId).orElseThrow();
        post.setCommentCount(post.getCommentCount() + 1);
        postRepo.save(post);
        return saved;
    }

    public List<SocialComment> getComments(UUID postId) { return commentRepo.findByPostIdOrderByCreatedAt(postId); }

    public Map<String, Object> toggleLike(UUID userId, String targetType, UUID targetId) {
        Optional<SocialLike> existing = likeRepo.findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
        boolean liked;
        if (existing.isPresent()) {
            likeRepo.delete(existing.get());
            liked = false;
        } else {
            SocialLike like = new SocialLike();
            like.setUserId(userId);
            like.setTargetType(targetType);
            like.setTargetId(targetId);
            likeRepo.save(like);
            liked = true;
        }
        long count = likeRepo.countByTargetTypeAndTargetId(targetType, targetId);
        return Map.of("liked", liked, "likeCount", count);
    }
}
