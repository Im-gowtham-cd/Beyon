package com.beyon.profile.repository;

import com.beyon.profile.model.EmailDomainBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailDomainBlacklistRepository extends JpaRepository<EmailDomainBlacklist, String> {

    Optional<EmailDomainBlacklist> findByDomainIgnoreCase(String domain);

    boolean existsByDomainIgnoreCaseAndIsActiveTrue(String domain);
}
