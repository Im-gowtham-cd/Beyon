package com.beyon.practice.repository;

import com.beyon.practice.model.CompanyOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CompanyOpportunityRepository extends JpaRepository<CompanyOpportunity, UUID> {
    List<CompanyOpportunity> findByCompanyUserIdOrderByCreatedAtDesc(UUID companyUserId);
    List<CompanyOpportunity> findByStatusOrderByCreatedAtDesc(String status);
}
