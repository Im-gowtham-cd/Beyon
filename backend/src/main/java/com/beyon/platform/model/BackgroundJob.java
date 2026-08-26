package com.beyon.platform.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "background_jobs")
public class BackgroundJob {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "job_type", nullable = false, length = 50) private String jobType;
    @Column(columnDefinition = "jsonb") private String payload;
    @Column(nullable = false, length = 20) private String status = "PENDING";
    @Column(nullable = false) private Integer priority = 0;
    @Column(name = "max_retries", nullable = false) private Integer maxRetries = 3;
    @Column(name = "retry_count", nullable = false) private Integer retryCount = 0;
    @Column(columnDefinition = "jsonb") private String result;
    @Column(name = "error_message", columnDefinition = "text") private String errorMessage;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "started_at") private OffsetDateTime startedAt;
    @Column(name = "completed_at") private OffsetDateTime completedAt;
    @Column(name = "next_retry_at") private OffsetDateTime nextRetryAt;

    public BackgroundJob() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public String getJobType() { return jobType; } public void setJobType(String v) { this.jobType = v; }
    public String getPayload() { return payload; } public void setPayload(String v) { this.payload = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public Integer getPriority() { return priority; } public void setPriority(Integer v) { this.priority = v; }
    public Integer getMaxRetries() { return maxRetries; } public void setMaxRetries(Integer v) { this.maxRetries = v; }
    public Integer getRetryCount() { return retryCount; } public void setRetryCount(Integer v) { this.retryCount = v; }
    public String getResult() { return result; } public void setResult(String v) { this.result = v; }
    public String getErrorMessage() { return errorMessage; } public void setErrorMessage(String v) { this.errorMessage = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getStartedAt() { return startedAt; } public void setStartedAt(OffsetDateTime v) { this.startedAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }
    public OffsetDateTime getNextRetryAt() { return nextRetryAt; } public void setNextRetryAt(OffsetDateTime v) { this.nextRetryAt = v; }
}
