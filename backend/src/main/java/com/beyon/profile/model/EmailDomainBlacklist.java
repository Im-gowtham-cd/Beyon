package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_domain_blacklist")
public class EmailDomainBlacklist {

    @Id
    @Column(columnDefinition = "varchar(36)")
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String domain;

    @Column(nullable = false, length = 50)
    private String providerType = "PUBLIC";

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public EmailDomainBlacklist() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getProviderType() { return providerType; }
    public void setProviderType(String providerType) { this.providerType = providerType; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
