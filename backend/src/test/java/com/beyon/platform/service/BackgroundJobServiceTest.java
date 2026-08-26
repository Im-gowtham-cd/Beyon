package com.beyon.platform.service;

import com.beyon.platform.model.BackgroundJob;
import com.beyon.platform.repository.BackgroundJobRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BackgroundJobServiceTest {

    @Mock
    private BackgroundJobRepository jobRepo;

    private BackgroundJobService jobService;
    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        jobService = new BackgroundJobService(jobRepo, mapper);
    }

    @Test
    void submitCreatesPendingJob() {
        BackgroundJob saved = new BackgroundJob();
        saved.setId(java.util.UUID.randomUUID());
        when(jobRepo.save(any())).thenReturn(saved);

        BackgroundJob result = jobService.submit("TEST_JOB", Map.of("key", "value"));
        assertNotNull(result);
        verify(jobRepo).save(any(BackgroundJob.class));
    }

    @Test
    void processJobsExecutesRegisteredHandler() {
        AtomicBoolean executed = new AtomicBoolean(false);
        jobService.registerHandler("TEST_JOB", payload -> executed.set(true);

        BackgroundJob job = new BackgroundJob();
        job.setId(java.util.UUID.randomUUID());
        job.setJobType("TEST_JOB");
        job.setStatus("PENDING");
        job.setPayload("{\"key\":\"value\"}");
        job.setRetryCount(0);
        job.setMaxRetries(3);

        when(jobRepo.findPendingJobs(any(OffsetDateTime.class))).thenReturn(Collections.singletonList(job));
        when(jobRepo.save(any())).thenReturn(job);

        jobService.processJobs();
        assertTrue(executed.get());
    }

    @Test
    void processJobsRetriesOnFailure() {
        jobService.registerHandler("FAIL_JOB", payload -> { throw new RuntimeException("Boom"); });

        BackgroundJob job = new BackgroundJob();
        job.setId(java.util.UUID.randomUUID());
        job.setJobType("FAIL_JOB");
        job.setStatus("PENDING");
        job.setPayload("{}");
        job.setRetryCount(0);
        job.setMaxRetries(3);

        when(jobRepo.findPendingJobs(any())).thenReturn(Collections.singletonList(job));
        when(jobRepo.save(any())).thenReturn(job);

        jobService.processJobs();

        verify(jobRepo).save(argThat(j -> j.getRetryCount() == 1 && "PENDING".equals(j.getStatus())));
    }
}
