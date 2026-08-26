package com.beyon.platform.controller;

import com.beyon.platform.service.FraudPreventionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fraud")
public class FraudController {

    private final FraudPreventionService fraudService;

    public FraudController(FraudPreventionService fraudService) {
        this.fraudService = fraudService;
    }

    @PostMapping("/report")
    public ResponseEntity<?> reportFraud(Authentication auth, @RequestBody Map<String, String> body) {
        UUID userId = UUID.fromString(auth.getName());
        var signal = fraudService.reportFraud(userId, body.get("signalType"),
            body.getOrDefault("severity", "LOW"), body.get("description"), body.get("evidence"));
        return ResponseEntity.ok(signal);
    }

    @GetMapping("/signals")
    public ResponseEntity<?> getDetectedSignals() {
        return ResponseEntity.ok(fraudService.getDetectedSignals());
    }

    @PostMapping("/signals/{signalId}/resolve")
    public ResponseEntity<?> resolveSignal(Authentication auth, @PathVariable UUID signalId,
                                            @RequestBody Map<String, String> body) {
        UUID resolverId = UUID.fromString(auth.getName());
        var signal = fraudService.resolveSignal(signalId, resolverId, body.get("action"));
        return ResponseEntity.ok(signal);
    }

    @GetMapping("/ledger/{userId}")
    public ResponseEntity<?> getUserLedger(@PathVariable UUID userId) {
        return ResponseEntity.ok(fraudService.getUserLedger(userId));
    }
}
