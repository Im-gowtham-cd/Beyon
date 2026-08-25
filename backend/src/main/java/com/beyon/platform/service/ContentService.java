package com.beyon.platform.service;

import com.beyon.platform.model.*;
import com.beyon.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class ContentService {
    private final ContentResourceRepository resourceRepo;

    public ContentService(ContentResourceRepository resourceRepo) { this.resourceRepo = resourceRepo; }

    public ContentResource createResource(UUID authorId, ContentResource resource) {
        resource.setAuthorId(authorId);
        return resourceRepo.save(resource);
    }

    public List<ContentResource> getPublishedResources() { return resourceRepo.findByStatusOrderByCreatedAtDesc("PUBLISHED"); }

    public List<ContentResource> getResourcesByType(String type) { return resourceRepo.findByResourceTypeAndStatusOrderByCreatedAtDesc(type, "PUBLISHED"); }

    public ContentResource getResource(UUID id) {
        ContentResource r = resourceRepo.findById(id).orElseThrow();
        r.setViewCount(r.getViewCount() + 1);
        return resourceRepo.save(r);
    }

    public List<ContentResource> getMyResources(UUID authorId) { return resourceRepo.findByAuthorIdOrderByCreatedAtDesc(authorId); }
}
