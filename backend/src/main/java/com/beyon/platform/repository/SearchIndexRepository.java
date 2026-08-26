package com.beyon.platform.repository;

import com.beyon.platform.model.SearchIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface SearchIndexRepository extends JpaRepository<SearchIndex, UUID> {
    @Query(value = "SELECT * FROM search_index WHERE to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(keywords, '')) @@ plainto_tsquery('english', :query) ORDER BY popularity_score DESC LIMIT :limit", nativeQuery = true)
    List<SearchIndex> search(String query, int limit);

    List<SearchIndex> findByEntityTypeAndTitleContainingIgnoreCase(String entityType, String title);

    List<SearchIndex> findTop20ByOrderByPopularityScoreDesc();
}
