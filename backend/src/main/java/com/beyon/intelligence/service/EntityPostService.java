package com.beyon.intelligence.service;

import com.beyon.intelligence.model.EntityPost;
import com.beyon.intelligence.repository.EntityPostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class EntityPostService {
    private final EntityPostRepository postRepo;

    public EntityPostService(EntityPostRepository postRepo) {
        this.postRepo = postRepo;
    }

    public EntityPost create(UUID entityId, String entityType, String postType, String title, String content, String actionUrl) {
        EntityPost post = new EntityPost();
        post.setEntityId(entityId);
        post.setEntityType(entityType);
        post.setPostType(postType);
        post.setTitle(title);
        post.setContent(content);
        post.setActionUrl(actionUrl);
        return postRepo.save(post);
    }

    public List<EntityPost> getFeed(int page, int size) {
        return postRepo.findByVisibilityOrderByCreatedAtDesc("PUBLIC").stream()
            .skip((long) page * size).limit(size).toList();
    }

    public List<EntityPost> getEntityPosts(UUID entityId, String entityType) {
        return postRepo.findByEntityIdAndEntityTypeOrderByCreatedAtDesc(entityId, entityType);
    }

    public List<EntityPost> getByType(String postType) {
        return postRepo.findByPostTypeOrderByCreatedAtDesc(postType);
    }
}
