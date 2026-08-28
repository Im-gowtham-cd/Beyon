package com.beyon.practice.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "coin_wallets")
public class CoinWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "varchar(36)")
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID studentId;

    @Column(nullable = false)
    private long balance = 0;

    @Column(nullable = false)
    private long totalEarned = 0;

    @Column(nullable = false)
    private long totalSpent = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public long getBalance() { return balance; }
    public void setBalance(long balance) { this.balance = balance; }
    public long getTotalEarned() { return totalEarned; }
    public void setTotalEarned(long totalEarned) { this.totalEarned = totalEarned; }
    public long getTotalSpent() { return totalSpent; }
    public void setTotalSpent(long totalSpent) { this.totalSpent = totalSpent; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
