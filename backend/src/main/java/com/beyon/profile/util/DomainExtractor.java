package com.beyon.profile.util;

import java.net.URI;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public class DomainExtractor {

    private static final Set<String> MULTI_LEVEL_TLDS = new HashSet<>(Arrays.asList(
            "co.in", "com.in", "org.in", "net.in", "edu.in", "ac.in", "gov.in", "res.in",
            "co.uk", "org.uk", "me.uk", "ltd.uk", "plc.uk", "net.uk", "ac.uk", "gov.uk",
            "com.au", "net.au", "org.au", "edu.au", "gov.au",
            "co.nz", "net.nz", "org.nz", "govt.nz",
            "co.za", "org.za", "gov.za",
            "co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp",
            "com.sg", "edu.sg", "gov.sg",
            "com.br", "net.br", "org.br",
            "com.mx", "org.mx", "gob.mx",
            "co.kr", "ne.kr", "re.kr"
    ));

    public static String extractRootDomainFromUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }

        String raw = url.trim();
        if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
            raw = "https://" + raw;
        }

        try {
            URI uri = new URI(raw);
            String host = uri.getHost();
            if (host == null) {
                host = raw.replaceFirst("^https?://", "").split("/")[0].split(":")[0];
            }
            return extractRootDomain(host);
        } catch (Exception e) {
            String sanitized = raw.replaceFirst("^https?://", "").split("/")[0].split(":")[0];
            return extractRootDomain(sanitized);
        }
    }

    public static String extractRootDomainFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }
        String[] parts = email.trim().split("@");
        if (parts.length < 2) {
            return null;
        }
        String host = parts[1].trim();
        return extractRootDomain(host);
    }

    public static String extractRootDomain(String host) {
        if (host == null || host.trim().isEmpty()) {
            return null;
        }

        String cleaned = host.trim().toLowerCase(Locale.ROOT);
        if (cleaned.startsWith("www.")) {
            cleaned = cleaned.substring(4);
        }

        if (cleaned.contains(":")) {
            cleaned = cleaned.split(":")[0];
        }

        while (cleaned.endsWith("/")) {
            cleaned = cleaned.substring(0, cleaned.length() - 1);
        }

        String[] parts = cleaned.split("\\.");
        if (parts.length <= 1) {
            return cleaned;
        }

        if (parts.length >= 3) {
            String twoPartSuffix = parts[parts.length - 2] + "." + parts[parts.length - 1];
            if (MULTI_LEVEL_TLDS.contains(twoPartSuffix)) {
                return parts[parts.length - 3] + "." + twoPartSuffix;
            }
        }

        return parts[parts.length - 2] + "." + parts[parts.length - 1];
    }

    public static boolean doDomainsMatch(String websiteUrl, String corporateEmail) {
        String webDomain = extractRootDomainFromUrl(websiteUrl);
        String emailDomain = extractRootDomainFromEmail(corporateEmail);
        if (webDomain == null || emailDomain == null) {
            return false;
        }
        return webDomain.equalsIgnoreCase(emailDomain);
    }
}
