package com.volunteerhub.backend.service;

import com.volunteerhub.backend.entity.VerificationTokenEntity;

import java.time.Duration;
import java.util.Optional;

/**
 * Service interface for managing email verification and password-reset tokens.
 * Handles token creation, lookup, and usage tracking.
 */
public interface VerificationTokenService {
    VerificationTokenEntity createToken(Long userId, VerificationTokenEntity.TokenType type, Duration validFor);

    Optional<VerificationTokenEntity> findByToken(String token);

    void markUsed(VerificationTokenEntity token);
}
