package com.beyon.practice.service;

import com.beyon.common.exception.ConflictException;
import com.beyon.practice.model.CoinRule;
import com.beyon.practice.model.CoinTransaction;
import com.beyon.practice.model.CoinWallet;
import com.beyon.practice.repository.CoinRuleRepository;
import com.beyon.practice.repository.CoinTransactionRepository;
import com.beyon.practice.repository.CoinWalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CoinService {

    private final CoinWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;
    private final CoinRuleRepository ruleRepository;

    public CoinService(CoinWalletRepository walletRepository,
                       CoinTransactionRepository transactionRepository,
                       CoinRuleRepository ruleRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.ruleRepository = ruleRepository;
    }

    public CoinWallet getOrCreateWallet(UUID studentId) {
        return walletRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    CoinWallet wallet = new CoinWallet();
                    wallet.setStudentId(studentId);
                    return walletRepository.save(wallet);
                });
    }

    public long getBalance(UUID studentId) {
        return getOrCreateWallet(studentId).getBalance();
    }

    @Transactional
    public CoinTransaction earnCoins(UUID studentId, String action, String referenceType, UUID referenceId) {
        Optional<CoinRule> ruleOpt = ruleRepository.findByActionAndActiveTrue(action);
        if (ruleOpt.isEmpty()) return null;

        CoinRule rule = ruleOpt.get();

        if (rule.getDailyLimit() != null) {
            long todayCount = transactionRepository.countTodayByStudentAndReason(studentId, action);
            if (todayCount >= rule.getDailyLimit()) return null;
        }

        CoinWallet wallet = getOrCreateWallet(studentId);
        wallet.setBalance(wallet.getBalance() + rule.getCoinsAmount());
        wallet.setTotalEarned(wallet.getTotalEarned() + rule.getCoinsAmount());
        walletRepository.save(wallet);

        CoinTransaction txn = new CoinTransaction();
        txn.setStudentId(studentId);
        txn.setAmount(rule.getCoinsAmount());
        txn.setType("EARNED");
        txn.setReason(action);
        txn.setReferenceType(referenceType);
        txn.setReferenceId(referenceId);
        txn.setBalanceAfter(wallet.getBalance());
        return transactionRepository.save(txn);
    }

    @Transactional
    public CoinTransaction spendCoins(UUID studentId, String reason, long amount, String referenceType, UUID referenceId) {
        CoinWallet wallet = getOrCreateWallet(studentId);
        if (wallet.getBalance() < amount) {
            throw new ConflictException("Insufficient Beyon Coins");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setTotalSpent(wallet.getTotalSpent() + amount);
        walletRepository.save(wallet);

        CoinTransaction txn = new CoinTransaction();
        txn.setStudentId(studentId);
        txn.setAmount(-amount);
        txn.setType("SPENT");
        txn.setReason(reason);
        txn.setReferenceType(referenceType);
        txn.setReferenceId(referenceId);
        txn.setBalanceAfter(wallet.getBalance());
        return transactionRepository.save(txn);
    }

    public List<CoinTransaction> getTransactionHistory(UUID studentId) {
        return transactionRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }
}
