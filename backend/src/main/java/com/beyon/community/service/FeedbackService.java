package com.beyon.community.service;

import com.beyon.community.model.UserFeedback;
import com.beyon.community.repository.UserFeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class FeedbackService {
    private final UserFeedbackRepository feedbackRepo;

    public FeedbackService(UserFeedbackRepository feedbackRepo) {
        this.feedbackRepo = feedbackRepo;
    }

    public UserFeedback submit(UUID userId, String type, String title, String description, String module, String severity) {
        UserFeedback fb = new UserFeedback();
        fb.setUserId(userId);
        fb.setFeedbackType(type);
        fb.setTitle(title);
        fb.setDescription(description);
        fb.setModule(module);
        fb.setSeverity(severity != null ? severity : "NORMAL");
        return feedbackRepo.save(fb);
    }

    public List<UserFeedback> getMyFeedback(UUID userId) {
        return feedbackRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<UserFeedback> getAllOpen() {
        return feedbackRepo.findByStatusOrderByCreatedAtDesc("OPEN");
    }

    public long getOpenCount() {
        return feedbackRepo.countByStatus("OPEN");
    }
}
