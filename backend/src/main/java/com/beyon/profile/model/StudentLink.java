package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_links")
public class StudentLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 50)
    private String platform;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Instant getCreatedAt() { return createdAt; }
}
