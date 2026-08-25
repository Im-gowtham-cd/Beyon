package com.beyon.practice.repository;

import com.beyon.practice.model.CoinWallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CoinWalletRepository extends JpaRepository<CoinWallet, UUID> {
    Optional<CoinWallet> findByStudentId(UUID studentId);
}
