package com.beyon.platform.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "platform_metrics")
public class PlatformMetric {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "metric_name", nullable = false, length = 100) private String metricName;
    @Column(name = "metric_value", nullable = false) private BigDecimal metricValue;
    @Column(name = "metric_type", nullable = false, length = 20) private String metricType = "COUNTER";
    @Column(columnDefinition = "jsonb") private String tags;
    @Column(name = "recorded_at", nullable = false) private OffsetDateTime recordedAt = OffsetDateTime.now();

    public PlatformMetric() {}
    public UUID getId() { return id; } public void setId(UUID v) { this.id = v; }
    public String getMetricName() { return metricName; } public void setMetricName(String v) { this.metricName = v; }
    public BigDecimal getMetricValue() { return metricValue; } public void setMetricValue(BigDecimal v) { this.metricValue = v; }
    public String getMetricType() { return metricType; } public void setMetricType(String v) { this.metricType = v; }
    public String getTags() { return tags; } public void setTags(String v) { this.tags = v; }
    public OffsetDateTime getRecordedAt() { return recordedAt; } public void setRecordedAt(OffsetDateTime v) { this.recordedAt = v; }
}
