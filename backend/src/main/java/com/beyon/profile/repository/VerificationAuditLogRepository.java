package com.beyon.profile.repository;

import com.beyon.profile.model.VerificationAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationAuditLogRepository extends JpaRepository<VerificationAuditLog, String> {

    List<VerificationAuditLog> findByCompanyIdOrderByCreatedAtDesc(String companyId);

    List<VerificationAuditLog> findByUserIdOrderByCreatedAtDesc(String userId);

    List<VerificationAuditLog> findByVerificationIdOrderByCreatedAtDesc(String verificationId);
}
