package com.beyon.community.service;

import com.beyon.community.model.*;
import com.beyon.community.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class NotificationPreferenceService {
    private final NotificationPreferenceRepository prefRepo;

    public NotificationPreferenceService(NotificationPreferenceRepository prefRepo) { this.prefRepo = prefRepo; }

    public List<NotificationPreference> getPreferences(UUID userId) { return prefRepo.findByUserId(userId); }

    public NotificationPreference updatePreference(UUID userId, String notificationType, Boolean inApp, Boolean email, Boolean push) {
        NotificationPreference pref = prefRepo.findByUserId(userId).stream()
            .filter(p -> p.getNotificationType().equals(notificationType)).findFirst()
            .orElseGet(() -> {
                NotificationPreference p = new NotificationPreference();
                p.setUserId(userId);
                p.setNotificationType(notificationType);
                return p;
            });
        if (inApp != null) pref.setInAppEnabled(inApp);
        if (email != null) pref.setEmailEnabled(email);
        if (push != null) pref.setPushEnabled(push);
        return prefRepo.save(pref);
    }
}
