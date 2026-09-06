package com.beyon.common.event;

import java.util.UUID;

public record OpportunityAppliedEvent(
    UUID applicationId,
    UUID opportunityId,
    UUID studentId,
    UUID companyId,
    int coinsSpent
) {}
