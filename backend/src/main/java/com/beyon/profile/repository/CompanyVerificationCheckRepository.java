package com.beyon.profile.repository;

import com.beyon.profile.model.CompanyVerificationCheck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyVerificationCheckRepository extends JpaRepository<CompanyVerificationCheck, String> {

    List<CompanyVerificationCheck> findByVerificationIdOrderByCreatedAtAsc(String verificationId);

    void deleteByVerificationId(String verificationId);
}
