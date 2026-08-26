package com.beyon.config;

import com.beyon.identity.security.JwtUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class IdorProtectionFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(IdorProtectionFilter.class);

    private static final Set<String> OWNERSHIP_PATHS = Set.of(
        "/api/v1/profile",
        "/api/v1/student/",
        "/api/v1/coins/",
        "/api/v1/practice/",
        "/api/v1/messages/",
        "/api/v1/achievements/my",
        "/api/v1/privacy/",
        "/api/v1/audit/my-activity"
    );

    private final JwtUtil jwtUtil;

    public IdorProtectionFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("GET".equals(method) && path.startsWith("/api/v1/student/public/")) {
            chain.doFilter(req, res);
            return;
        }

        if (OWNERSHIP_PATHS.stream().anyMatch(path::startsWith)) {
            String auth = request.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                chain.doFilter(req, res);
                return;
            }

            try {
                UUID requestUserId = jwtUtil.getUserId(auth.substring(7));
                request.setAttribute("authenticatedUserId", requestUserId);

                String pathUserId = extractUserIdFromPath(path);
                if (pathUserId != null && !pathUserId.equals("me")) {
                    UUID pathUuid = UUID.fromString(pathUserId);
                    if (!requestUserId.equals(pathUuid)) {
                        log.warn("IDOR attempt: user {} tried to access resource of user {} at {}",
                            requestUserId, pathUuid, path);
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"success\":false,\"error\":\"Access denied: you can only access your own resources\"}");
                        return;
                    }
                }
            } catch (Exception e) {
                log.debug("Could not extract user ID from path: {}", path);
            }
        }

        chain.doFilter(req, res);
    }

    private String extractUserIdFromPath(String path) {
        String[] parts = path.split("/");
        for (int i = 0; i < parts.length - 1; i++) {
            if ("students".equals(parts[i]) || "profiles".equals(parts[i]) || "user".equals(parts[i])) {
                String next = parts[i + 1];
                try {
                    UUID.fromString(next);
                    return next;
                } catch (IllegalArgumentException ignored) {}
            }
        }
        return null;
    }
}
