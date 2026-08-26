package com.beyon.practice.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_xp_transactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "skill_id", "source", "source_id"})
})
public class SkillXpTransaction {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "skill_id", nullable = false) private UUID skillId;
    @Column(nullable = false) private Integer amount;
    @Column(nullable = false, length = 50) private String source;
    @Column(name = "source_id") private UUID sourceId;
    @Column(length = 500) private String description;
    @Column(name = "created_at") private OffsetDateTime createdAt;

    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); }

    public SkillXpTransaction() {}

    public UUID getId() { return id; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public UUID getSkillId() { return skillId; } public void setSkillId(UUID v) { this.skillId = v; }
    public Integer getAmount() { return amount; } public void setAmount(Integer v) { this.amount = v; }
    public String getSource() { return source; } public void setSource(String v) { this.source = v; }
    public UUID getSourceId() { return sourceId; } public void setSourceId(UUID v) { this.sourceId = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
