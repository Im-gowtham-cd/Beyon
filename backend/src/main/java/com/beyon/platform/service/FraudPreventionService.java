package com.beyon.platform.service;

import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.platform.model.CoinTransactionLedger;
import com.beyon.platform.model.FraudSignal;
import com.beyon.platform.repository.CoinTransactionLedgerRepository;
import com.beyon.platform.repository.FraudSignalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class FraudPreventionService {

    private final FraudSignalRepository fraudRepo;
    private final CoinTransactionLedgerRepository ledgerRepo;
    private final UserRepository userRepo;

    public FraudPreventionService(FraudSignalRepository fraudRepo,
                                   CoinTransactionLedgerRepository ledgerRepo,
                                   UserRepository userRepo) {
        this.fraudRepo = fraudRepo;
        this.ledgerRepo = ledgerRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public void recordCoinTransaction(UUID userId, int amount, String type,
                                       String referenceType, UUID referenceId,
                                       String description, String ipAddress) {
        User user = userRepo.findById(userId).orElseThrow();
        CoinTransactionLedger ledger = new CoinTransactionLedger();
        ledger.setUser(user);
        ledger.setAmount(amount);
        ledger.setType(type);
        ledger.setReferenceType(referenceType);
        ledger.setReferenceId(referenceId);
        ledger.setDescription(description);
        ledger.setVerified(true);
        ledger.setIpAddress(ipAddress);
        ledgerRepo.save(ledger);
    }

    @Transactional
    public FraudSignal reportFraud(UUID userId, String signalType, String severity,
                                    String description, String evidence) {
        User user = userRepo.findById(userId).orElseThrow();
        FraudSignal signal = new FraudSignal();
        signal.setUser(user);
        signal.setSignalType(signalType);
        signal.setSeverity(severity);
        signal.setDescription(description);
        signal.setEvidence(evidence);
        return fraudRepo.save(signal);
    }

    public List<FraudSignal> getDetectedSignals() {
        return fraudRepo.findByStatus("DETECTED");
    }

    @Transactional
    public FraudSignal resolveSignal(UUID signalId, UUID resolverId, String action) {
        FraudSignal signal = fraudRepo.findById(signalId).orElseThrow();
        User resolver = userRepo.findById(resolverId).orElseThrow();
        signal.setResolvedBy(resolver);
        signal.setStatus("RESOLVED");
        signal.setResolvedAt(Instant.now());
        return fraudRepo.save(signal);
    }

    public long getFraudSignalCount(UUID userId, String signalType) {
        return fraudRepo.countByUserIdAndSignalType(userId, signalType);
    }

    public List<CoinTransactionLedger> getUserLedger(UUID userId) {
        return ledgerRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
