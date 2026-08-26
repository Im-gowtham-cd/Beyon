package com.beyon.platform.service;

import com.beyon.common.exception.BusinessException;
import com.beyon.practice.model.CoinTransaction;
import com.beyon.practice.model.CoinWallet;
import com.beyon.practice.repository.CoinTransactionRepository;
import com.beyon.practice.repository.CoinWalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CoinSecurityService {
    private static final Logger log = LoggerFactory.getLogger(CoinSecurityService.class);
    private final CoinWalletRepository walletRepo;
    private final CoinTransactionRepository txRepo;
    private final AuditService auditService;
    private final ConcurrentHashMap<UUID, Object> userLocks = new ConcurrentHashMap<>();

    public CoinSecurityService(CoinWalletRepository walletRepo, CoinTransactionRepository txRepo, AuditService auditService) {
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
        this.auditService = auditService;
    }

    @Transactional
    public CoinWallet earnCoins(UUID studentId, long amount, String type, String reason, UUID referenceId) {
        Object lock = userLocks.computeIfAbsent(studentId, k -> new Object());
        synchronized (lock) {
            if (amount <= 0) throw new BusinessException("Coin amount must be positive");
            if (amount > 10000) throw new BusinessException("Coin amount exceeds maximum reward");

            if (referenceId != null) {
                boolean exists = txRepo.findByReferenceId(referenceId).isPresent();
                if (exists) {
                    log.warn("Duplicate coin transaction attempt for ref: {}", referenceId);
                    throw new BusinessException("This reward has already been claimed");
                }
            }

            CoinWallet wallet = walletRepo.findByStudentId(studentId).orElseGet(() -> {
                CoinWallet w = new CoinWallet();
                w.setStudentId(studentId);
                w.setBalance(0);
                return walletRepo.save(w);
            });

            CoinTransaction tx = new CoinTransaction();
            tx.setStudentId(studentId);
            tx.setType(type);
            tx.setAmount(amount);
            tx.setReason(reason);
            tx.setReferenceId(referenceId);
            tx.setBalanceAfter(wallet.getBalance() + amount);
            txRepo.save(tx);

            wallet.setBalance(wallet.getBalance() + amount);
            wallet.setTotalEarned(wallet.getTotalEarned() + amount);
            walletRepo.save(wallet);

            auditService.logCoinTransaction(studentId, "COIN_EARN", tx.getId(), (int) amount);
            return wallet;
        }
    }

    @Transactional
    public CoinWallet spendCoins(UUID studentId, long amount, String type, String reason, UUID referenceId) {
        Object lock = userLocks.computeIfAbsent(studentId, k -> new Object());
        synchronized (lock) {
            if (amount <= 0) throw new BusinessException("Coin amount must be positive");

            if (referenceId != null) {
                boolean exists = txRepo.findByReferenceId(referenceId).isPresent();
                if (exists) {
                    log.warn("Duplicate coin spend attempt for ref: {}", referenceId);
                    throw new BusinessException("This transaction has already been processed");
                }
            }

            CoinWallet wallet = walletRepo.findByStudentId(studentId)
                .orElseThrow(() -> new BusinessException("No coin wallet found"));

            if (wallet.getBalance() < amount) {
                throw new BusinessException("Insufficient coins. Available: " + wallet.getBalance());
            }

            CoinTransaction tx = new CoinTransaction();
            tx.setStudentId(studentId);
            tx.setType(type);
            tx.setAmount(-amount);
            tx.setReason(reason);
            tx.setReferenceId(referenceId);
            tx.setBalanceAfter(wallet.getBalance() - amount);
            txRepo.save(tx);

            wallet.setBalance(wallet.getBalance() - amount);
            wallet.setTotalSpent(wallet.getTotalSpent() + amount);
            walletRepo.save(wallet);

            auditService.logCoinTransaction(studentId, "COIN_SPEND", tx.getId(), (int) amount);
            return wallet;
        }
    }
}
