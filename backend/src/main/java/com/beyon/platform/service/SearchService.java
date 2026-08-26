package com.beyon.platform.service;

import com.beyon.platform.model.SearchIndex;
import com.beyon.platform.repository.SearchIndexRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final SearchIndexRepository searchRepo;
    private final CacheService cacheService;

    public SearchService(SearchIndexRepository searchRepo, CacheService cacheService) {
        this.searchRepo = searchRepo;
        this.cacheService = cacheService;
    }

    public List<Map<String, Object>> search(String query, String type, int limit) {
        String cacheKey = "search:" + type + ":" + query.toLowerCase().trim();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> cached = cacheService.get(cacheKey, List.class).orElse(null);
        if (cached != null) return cached;

        List<SearchIndex> results;
        if (type != null && !type.isEmpty()) {
            results = searchRepo.findByEntityTypeAndTitleContainingIgnoreCase(type, query);
        } else {
            results = searchRepo.search(query, limit);
        }

        List<Map<String, Object>> mapped = results.stream()
            .limit(limit)
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.getEntityId());
                m.put("type", r.getEntityType());
                m.put("title", r.getTitle());
                m.put("description", r.getDescription());
                m.put("score", r.getPopularityScore());
                return m;
            })
            .collect(Collectors.toList());

        cacheService.put(cacheKey, mapped, Duration.ofMinutes(5));
        return mapped;
    }

    public List<Map<String, Object>> getTrending(int limit) {
        return searchRepo.findTop20ByOrderByPopularityScoreDesc().stream()
            .limit(limit)
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.getEntityId());
                m.put("type", r.getEntityType());
                m.put("title", r.getTitle());
                m.put("score", r.getPopularityScore());
                return m;
            })
            .collect(Collectors.toList());
    }

    public void indexEntity(String entityType, UUID entityId, String title,
                             String description, String keywords, int popularity) {
        SearchIndex existing = searchRepo.findAll().stream()
            .filter(s -> s.getEntityType().equals(entityType) && s.getEntityId().equals(entityId))
            .findFirst().orElse(null);

        if (existing != null) {
            existing.setTitle(title);
            existing.setDescription(description);
            existing.setKeywords(keywords);
            existing.setPopularityScore(popularity);
            existing.setUpdatedAt(java.time.Instant.now());
            searchRepo.save(existing);
        } else {
            SearchIndex idx = new SearchIndex();
            idx.setEntityType(entityType);
            idx.setEntityId(entityId);
            idx.setTitle(title);
            idx.setDescription(description);
            idx.setKeywords(keywords);
            idx.setPopularityScore(popularity);
            searchRepo.save(idx);
        }
        cacheService.evictPattern("search:*");
    }
}
