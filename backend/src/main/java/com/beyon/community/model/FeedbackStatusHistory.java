package com.beyon.community.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedback_status_history")
public class FeedbackStatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "report_id", nullable = false) private UUID reportId;
    @Column(name = "old_status", length = 30) private String oldStatus;
    @Column(name = "new_status", nullable = false, length = 30) private String newStatus;
    @Column(name = "changed_by", nullable = false) private UUID changedBy;
    @Column(columnDefinition = "text") private String note;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();

    public FeedbackStatusHistory() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getReportId() { return reportId; } public void setReportId(UUID v) { this.reportId = v; }
    public String getOldStatus() { return oldStatus; } public void setOldStatus(String v) { this.oldStatus = v; }
    public String getNewStatus() { return newStatus; } public void setNewStatus(String v) { this.newStatus = v; }
    public UUID getChangedBy() { return changedBy; } public void setChangedBy(UUID v) { this.changedBy = v; }
    public String getNote() { return note; } public void setNote(String v) { this.note = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
