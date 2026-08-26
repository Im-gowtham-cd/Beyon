package com.beyon.platform.service;

import com.beyon.common.exception.BusinessException;
import com.beyon.practice.model.CoinTransaction;
import com.beyon.practice.model.CoinWallet;
import com.beyon.practice.repository.CoinTransactionRepository;
import com.beyon.practice.repository.CoinWalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CoinSecurityServiceTest {

    @Mock
    private CoinWalletRepository walletRepo;
    @Mock
    private CoinTransactionRepository txRepo;
    @Mock
    private AuditService auditService;

    private CoinSecurityService coinService;
    private final UUID studentId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        coinService = new CoinSecurityService(walletRepo, txRepo, auditService);
    }

    @Test
    void earnCoinsCreatesWalletIfMissing() {
        CoinWallet wallet = new CoinWallet();
        wallet.setStudentId(studentId);
        wallet.setBalance(0);
        when(walletRepo.findByStudentId(studentId)).thenReturn(Optional.empty());
        when(walletRepo.save(any())).thenReturn(wallet);
        when(txRepo.save(any())).thenReturn(new CoinTransaction());

        CoinWallet result = coinService.earnCoins(studentId, 100, "EARN", "daily_challenge", null);
        assertNotNull(result);
        verify(walletRepo, atLeast(1)).save(any(CoinWallet.class));
    }

    @Test
    void earnCoinsIncreasesBalance() {
        CoinWallet wallet = new CoinWallet();
        wallet.setStudentId(studentId);
        wallet.setBalance(500);
        when(walletRepo.findByStudentId(studentId)).thenReturn(Optional.of(wallet));
        when(walletRepo.save(any())).thenReturn(wallet);
        when(txRepo.save(any())).thenReturn(new CoinTransaction());

        coinService.earnCoins(studentId, 200, "EARN", "test", null);
        verify(walletRepo).save(argThat(w -> w.getBalance() == 700));
    }

    @Test
    void spendCoinsChecksBalance() {
        CoinWallet wallet = new CoinWallet();
        wallet.setStudentId(studentId);
        wallet.setBalance(100);
        when(walletRepo.findByStudentId(studentId)).thenReturn(Optional.of(wallet));

        assertThrows(BusinessException.class, () ->
            coinService.spendCoins(studentId, 500, "SPEND", "opportunity", null));
    }

    @Test
    void spendCoinsDeductsBalance() {
        CoinWallet wallet = new CoinWallet();
        wallet.setStudentId(studentId);
        wallet.setBalance(1000);
        when(walletRepo.findByStudentId(studentId)).thenReturn(Optional.of(wallet));
        when(walletRepo.save(any())).thenReturn(wallet);
        when(txRepo.save(any())).thenReturn(new CoinTransaction());

        coinService.spendCoins(studentId, 500, "SPEND", "opportunity", null);
        verify(walletRepo).save(argThat(w -> w.getBalance() == 500));
    }

    @Test
    void rejectZeroAmount() {
        assertThrows(BusinessException.class, () ->
            coinService.earnCoins(studentId, 0, "EARN", "test", null));
    }

    @Test
    void rejectExcessiveAmount() {
        assertThrows(BusinessException.class, () ->
            coinService.earnCoins(studentId, 99999, "EARN", "test", null));
    }

    @Test
    void preventsDuplicateReference() {
        CoinWallet wallet = new CoinWallet();
        wallet.setStudentId(studentId);
        wallet.setBalance(100);
        UUID refId = UUID.randomUUID();
        when(walletRepo.findByStudentId(studentId)).thenReturn(Optional.of(wallet));
        when(txRepo.findByReferenceId(refId)).thenReturn(Optional.of(new CoinTransaction()));

        assertThrows(BusinessException.class, () ->
            coinService.earnCoins(studentId, 50, "EARN", "test", refId));
    }
}
