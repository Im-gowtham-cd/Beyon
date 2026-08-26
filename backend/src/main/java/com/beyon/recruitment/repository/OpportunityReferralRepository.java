package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.OpportunityReferral;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OpportunityReferralRepository extends JpaRepository<OpportunityReferral, UUID> {
    List<OpportunityReferral> findByReferrerIdOrderByCreatedAtDesc(UUID referrerId);
    List<OpportunityReferral> findByStatusOrderByCreatedAtDesc(String status);
}
