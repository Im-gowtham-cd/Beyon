package com.beyon.platform.service;

import com.beyon.platform.model.RecommendationSignal;
import com.beyon.platform.repository.RecommendationSignalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class RecommendationFeedbackService {

    private final RecommendationSignalRepository signalRepo;

    public RecommendationFeedbackService(RecommendationSignalRepository signalRepo) {
        this.signalRepo = signalRepo;
    }

    @Transactional
    public void trackSignal(UUID userId, String recType, UUID recId, String signal, String metadata) {
        RecommendationSignal s = new RecommendationSignal();
        s.setUserId(userId);
        s.setRecommendationType(recType);
        s.setRecommendationId(recId);
        s.setSignal(signal);
        s.setMetadata(metadata);
        signalRepo.save(s);
    }

    public Map<String, Long> getSignalCounts(UUID userId, String recType) {
        var signals = signalRepo.findByUserIdAndRecommendationType(userId, recType);
        Map<String, Long> counts = new java.util.HashMap<>();
        signals.forEach(s -> counts.merge(s.getSignal(), 1L, Long::sum));
        return counts;
    }
}
