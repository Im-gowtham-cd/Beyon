package com.beyon.recruitment.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "alumni_connections")
public class AlumniConnection {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "alumni_id", nullable = false) private UUID alumniId;
    @Column(name = "student_id", nullable = false) private UUID studentId;
    @Column(name = "connection_type", nullable = false, length = 30) private String connectionType = "FOLLOW";
    @Column(nullable = false, length = 30) private String status = "PENDING";
    @Column(columnDefinition = "text") private String message;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AlumniConnection() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public UUID getAlumniId() { return alumniId; } public void setAlumniId(UUID v) { this.alumniId = v; }
    public UUID getStudentId() { return studentId; } public void setStudentId(UUID v) { this.studentId = v; }
    public String getConnectionType() { return connectionType; } public void setConnectionType(String v) { this.connectionType = v; }
    public String getStatus() { return status; } public void setStatus(String v) { this.status = v; }
    public String getMessage() { return message; } public void setMessage(String v) { this.message = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
