package com.beyon.identity.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtUtil.isTokenValid(token)) {
                String userId = jwtUtil.getUserId(token).toString();
                String email = jwtUtil.getEmail(token);
                String role = jwtUtil.getRole(token);
                var instId = jwtUtil.getInstitutionId(token);
                var compId = jwtUtil.getCompanyId(token);
                String deptId = jwtUtil.getDepartmentId(token);

                var authorities = new java.util.ArrayList<SimpleGrantedAuthority>();
                if (role != null) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    if (role.startsWith("INSTITUTION_")) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_INSTITUTION"));
                    } else if (role.startsWith("COMPANY_")) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_COMPANY"));
                    } else if ("SUPER_ADMIN".equalsIgnoreCase(role) ||
                               "PLATFORM_ADMIN".equalsIgnoreCase(role) ||
                               "VERIFICATION_ADMIN".equalsIgnoreCase(role) ||
                               "CONTENT_ADMIN".equalsIgnoreCase(role) ||
                               "QUESTION_SETTER".equalsIgnoreCase(role) ||
                               "MODERATION_ADMIN".equalsIgnoreCase(role) ||
                               "ANALYTICS_ADMIN".equalsIgnoreCase(role)) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    }
                }

                var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                var details = new JwtUserDetails(
                    userId,
                    email,
                    role,
                    instId != null ? instId.toString() : null,
                    compId != null ? compId.toString() : null,
                    deptId
                );
                auth.setDetails(details);

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}

