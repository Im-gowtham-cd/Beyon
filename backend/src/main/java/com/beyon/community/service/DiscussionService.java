package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class DiscussionService {
    private final DiscussionThreadRepository threadRepo;
    private final DiscussionReplyRepository replyRepo;

    public DiscussionService(DiscussionThreadRepository threadRepo, DiscussionReplyRepository replyRepo) {
        this.threadRepo = threadRepo;
        this.replyRepo = replyRepo;
    }

    public DiscussionThread createThread(UUID authorId, UUID categoryId, String title, String content) {
        DiscussionThread thread = new DiscussionThread();
        thread.setAuthorId(authorId);
        thread.setCategoryId(categoryId);
        thread.setTitle(title);
        thread.setContent(content);
        return threadRepo.save(thread);
    }

    public List<DiscussionThread> getThreads(UUID categoryId) {
        return categoryId != null ? threadRepo.findByCategoryIdOrderByCreatedAtDesc(categoryId) : threadRepo.findByOrderByCreatedAtDesc();
    }

    public DiscussionThread getThread(UUID threadId) {
        DiscussionThread thread = threadRepo.findById(threadId).orElseThrow(() -> new RuntimeException("Thread not found"));
        thread.setViewCount(thread.getViewCount() + 1);
        threadRepo.save(thread);
        return thread;
    }

    public DiscussionReply addReply(UUID threadId, UUID authorId, String content) {
        DiscussionReply reply = new DiscussionReply();
        reply.setThreadId(threadId);
        reply.setAuthorId(authorId);
        reply.setContent(content);
        DiscussionReply saved = replyRepo.save(reply);
        DiscussionThread thread = threadRepo.findById(threadId).orElseThrow();
        thread.setReplyCount(thread.getReplyCount() + 1);
        thread.setLastReplyAt(OffsetDateTime.now());
        threadRepo.save(thread);
        return saved;
    }

    public List<DiscussionReply> getReplies(UUID threadId) { return replyRepo.findByThreadIdOrderByCreatedAt(threadId); }

    public void markSolved(UUID threadId, UUID userId) {
        DiscussionThread thread = threadRepo.findById(threadId).orElseThrow();
        if (!thread.getAuthorId().equals(userId)) throw new RuntimeException("Unauthorized");
        thread.setSolved(true);
        threadRepo.save(thread);
    }
}
