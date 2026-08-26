package com.beyon.practice.repository;

import com.beyon.practice.model.CoinRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CoinRuleRepository extends JpaRepository<CoinRule, UUID> {
    Optional<CoinRule> findByActionAndActiveTrue(String action);
}
