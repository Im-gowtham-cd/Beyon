package com.beyon.recruitment.repository;

import com.beyon.recruitment.model.PlacementOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PlacementOfferRepository extends JpaRepository<PlacementOffer, UUID> {
    List<PlacementOffer> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<PlacementOffer> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
    List<PlacementOffer> findByOfferStatus(String status);
    long countByOfferStatus(String status);
}
