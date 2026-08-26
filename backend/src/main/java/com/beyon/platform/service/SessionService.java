package com.beyon.platform.service;

import com.beyon.identity.model.User;
import com.beyon.identity.repository.UserRepository;
import com.beyon.platform.model.UserSession;
import com.beyon.platform.repository.UserSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class SessionService {

    private final UserSessionRepository sessionRepo;
    private final UserRepository userRepo;

    public SessionService(UserSessionRepository sessionRepo, UserRepository userRepo) {
        this.sessionRepo = sessionRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public UserSession createSession(UUID userId, String token, String deviceInfo,
                                      String ipAddress, String userAgent) {
        User user = userRepo.findById(userId).orElseThrow();
        UserSession session = new UserSession();
        session.setUser(user);
        session.setTokenHash(hashToken(token));
        session.setDeviceInfo(deviceInfo);
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        return sessionRepo.save(session);
    }

    @Transactional
    public void revokeSession(UUID sessionId) {
        sessionRepo.findById(sessionId).ifPresent(s -> {
            s.setIsActive(false);
            sessionRepo.save(s);
        });
    }

    @Transactional
    public void revokeAllSessions(UUID userId) {
        sessionRepo.findByUserIdAndIsActiveTrue(userId).forEach(s -> {
            s.setIsActive(false);
            sessionRepo.save(s);
        });
    }

    public List<UserSession> getActiveSessions(UUID userId) {
        return sessionRepo.findByUserIdAndIsActiveTrue(userId);
    }

    public boolean isSessionValid(String token) {
        return sessionRepo.findByTokenHashAndIsActiveTrue(hashToken(token))
            .filter(s -> s.getExpiresAt().isAfter(Instant.now()))
            .isPresent();
    }

    public long getActiveSessionCount(UUID userId) {
        return sessionRepo.countByUserIdAndIsActiveTrue(userId);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return token;
        }
    }
}
