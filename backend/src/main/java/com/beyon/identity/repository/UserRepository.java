package com.beyon.identity.repository;

import com.beyon.identity.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    java.util.List<User> findByRoleAndStatus(com.beyon.identity.enums.UserRole role, com.beyon.identity.enums.AccountStatus status);
    java.util.List<User> findByRole(com.beyon.identity.enums.UserRole role);
}
