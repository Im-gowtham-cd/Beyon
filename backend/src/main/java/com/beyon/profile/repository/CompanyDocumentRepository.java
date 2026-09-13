package com.beyon.profile.repository;

import com.beyon.profile.model.CompanyDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyDocumentRepository extends JpaRepository<CompanyDocument, String> {

    List<CompanyDocument> findByCompanyIdOrderByCreatedAtDesc(String companyId);

    List<CompanyDocument> findByUserIdOrderByCreatedAtDesc(String userId);
}
