package com.beyon.platform.service;

import com.beyon.platform.model.BackgroundJob;
import com.beyon.platform.repository.BackgroundJobRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

@Service
public class BackgroundJobService {
    private static final Logger log = LoggerFactory.getLogger(BackgroundJobService.class);
    private final BackgroundJobRepository jobRepo;
    private final ObjectMapper mapper;
    private final Map<String, Consumer<Map<String, Object>>> handlers = new ConcurrentHashMap<>();

    public BackgroundJobService(BackgroundJobRepository jobRepo, ObjectMapper mapper) {
        this.jobRepo = jobRepo;
        this.mapper = mapper;
    }

    public void registerHandler(String jobType, Consumer<Map<String, Object>> handler) {
        handlers.put(jobType, handler);
    }

    public BackgroundJob submit(String jobType, Map<String, Object> payload, int priority) {
        BackgroundJob job = new BackgroundJob();
        job.setJobType(jobType);
        job.setPayload(mapper.valueToTree(payload).toString());
        job.setStatus("PENDING");
        job.setPriority(priority);
        job.setMaxRetries(3);
        job.setRetryCount(0);
        return jobRepo.save(job);
    }

    public BackgroundJob submit(String jobType, Map<String, Object> payload) {
        return submit(jobType, payload, 0);
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processJobs() {
        List<BackgroundJob> pending = jobRepo.findPendingJobs(OffsetDateTime.now());
        for (BackgroundJob job : pending) {
            processJob(job);
        }
    }

    private void processJob(BackgroundJob job) {
        job.setStatus("PROCESSING");
        job.setStartedAt(OffsetDateTime.now());
        jobRepo.save(job);

        try {
            Consumer<Map<String, Object>> handler = handlers.get(job.getJobType());
            if (handler == null) {
                log.warn("No handler registered for job type: {}", job.getJobType());
                job.setStatus("FAILED");
                job.setErrorMessage("No handler registered");
                jobRepo.save(job);
                return;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> payload = mapper.readValue(job.getPayload(), Map.class);
            handler.accept(payload);

            job.setStatus("COMPLETED");
            job.setCompletedAt(OffsetDateTime.now());
            jobRepo.save(job);
        } catch (Exception e) {
            log.error("Job {} failed: {}", job.getId(), e.getMessage());
            job.setRetryCount(job.getRetryCount() + 1);
            job.setErrorMessage(e.getMessage());

            if (job.getRetryCount() >= job.getMaxRetries()) {
                job.setStatus("FAILED");
            } else {
                job.setStatus("PENDING");
                job.setNextRetryAt(OffsetDateTime.now().plusSeconds((long) Math.pow(2, job.getRetryCount())));
            }
            jobRepo.save(job);
        }
    }

    public long getPendingCount() {
        return jobRepo.countByStatus("PENDING");
    }

    public long getFailedCount() {
        return jobRepo.countByStatus("FAILED");
    }
}
