package com.beyon.identity.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/v1/auth/register").permitAll()
                .requestMatchers("/api/v1/auth/login").permitAll()
                .requestMatchers("/api/v1/auth/verify-email").permitAll()
                .requestMatchers("/api/v1/auth/resend-verification").permitAll()
                .requestMatchers("/api/v1/auth/forgot-password").permitAll()
                .requestMatchers("/api/v1/auth/reset-password").permitAll()
                .requestMatchers("/api/v1/auth/me").authenticated()
                .requestMatchers("/api/v1/onboarding/**").authenticated()
                .requestMatchers("/api/v1/profile").authenticated()
                .requestMatchers("/api/v1/student/public/**").permitAll()
                .requestMatchers("/api/v1/taxonomy/**").permitAll()
                .requestMatchers("/api/v1/skills/**").permitAll()
                .requestMatchers("/api/v1/student/**").authenticated()
                .requestMatchers("/api/v1/questions/**").permitAll()
                .requestMatchers("/api/v1/practice/**").authenticated()
                .requestMatchers("/api/v1/coins/**").authenticated()
                .requestMatchers("/api/v1/daily-challenge/**").authenticated()
                .requestMatchers("/api/v1/gamification/**").authenticated()
                .requestMatchers("/api/v1/opportunities/**").authenticated()
                .requestMatchers("/api/v1/institution/**").authenticated()
                .requestMatchers("/api/v1/follows/**").authenticated()
                .requestMatchers("/api/v1/notifications/**").authenticated()
                .requestMatchers("/api/v1/recruitment/**").authenticated()
                .requestMatchers("/api/v1/assessment/session").authenticated()
                .requestMatchers("/api/v1/assessment/launch").authenticated()
                .requestMatchers("/api/v1/assessment/**").authenticated()
                .requestMatchers("/api/v1/proctoring/**").authenticated()
                .requestMatchers("/api/v1/assessment-policies/**").authenticated()
                .requestMatchers("/api/v1/evaluation/**").authenticated()
                .requestMatchers("/api/v1/matching/**").authenticated()
                .requestMatchers("/api/v1/interviews/**").authenticated()
                .requestMatchers("/api/v1/analytics/**").authenticated()
                .requestMatchers("/api/v1/collaboration/**").authenticated()
                .requestMatchers("/api/v1/career-paths/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
