package com.beyon.community.model;

import com.beyon.identity.model.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "research_participants", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"proposal_id", "user_id"})
})
public class ResearchParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id", nullable = false)
    private ResearchProposal proposal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 50)
    private String role = "RESEARCHER";

    @Column(length = 50)
    private String status = "PENDING";

    @Column(name = "joined_at")
    private Instant joinedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ResearchProposal getProposal() { return proposal; }
    public void setProposal(ResearchProposal proposal) { this.proposal = proposal; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
}
