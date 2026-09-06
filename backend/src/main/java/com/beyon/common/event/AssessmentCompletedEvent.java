package com.beyon.common.event;

import java.math.BigDecimal;
import java.util.UUID;

public record AssessmentCompletedEvent(
    UUID sessionId,
    UUID studentId,
    UUID opportunityId,
    UUID applicationId,
    BigDecimal score,
    BigDecimal accuracy,
    int timeTakenSeconds,
    String integrityStatus
) {}
