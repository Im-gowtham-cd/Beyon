package com.beyon.practice.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leaderboards", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "board_type", "board_scope", "period"}))
public class Leaderboard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false, length = 50)
    private String boardType;

    @Column(length = 100)
    private String boardScope;

    @Column(nullable = false)
    private long score = 0;

    private Integer rankPosition;

    @Column(nullable = false, length = 20)
    private String period;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public String getBoardType() { return boardType; }
    public void setBoardType(String boardType) { this.boardType = boardType; }
    public String getBoardScope() { return boardScope; }
    public void setBoardScope(String boardScope) { this.boardScope = boardScope; }
    public long getScore() { return score; }
    public void setScore(long score) { this.score = score; }
    public Integer getRankPosition() { return rankPosition; }
    public void setRankPosition(Integer rankPosition) { this.rankPosition = rankPosition; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public Instant getUpdatedAt() { return updatedAt; }
}
