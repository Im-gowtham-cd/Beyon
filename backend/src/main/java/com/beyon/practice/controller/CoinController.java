package com.beyon.practice.controller;

import com.beyon.common.response.ApiResponse;
import com.beyon.identity.security.JwtUserDetails;
import com.beyon.practice.model.CoinTransaction;
import com.beyon.practice.model.CoinWallet;
import com.beyon.practice.service.CoinService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/coins")
public class CoinController {

    private final CoinService coinService;

    public CoinController(CoinService coinService) {
        this.coinService = coinService;
    }

    @GetMapping("/wallet")
    public ResponseEntity<ApiResponse<CoinWallet>> getWallet(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(coinService.getOrCreateWallet(studentId)));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<Long>> getBalance(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(coinService.getBalance(studentId)));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<CoinTransaction>>> getTransactions(Authentication auth) {
        UUID studentId = extractUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok(coinService.getTransactionHistory(studentId)));
    }

    private UUID extractUserId(Authentication auth) {
        JwtUserDetails details = (JwtUserDetails) auth.getDetails();
        return UUID.fromString(details.getUserId());
    }
}
