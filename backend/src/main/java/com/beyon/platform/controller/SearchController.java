package com.beyon.platform.controller;

import com.beyon.platform.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<?> search(@RequestParam String q,
                                     @RequestParam(required = false) String type,
                                     @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(searchService.search(q, type, limit));
    }

    @GetMapping("/trending")
    public ResponseEntity<?> trending(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(searchService.getTrending(limit));
    }
}
