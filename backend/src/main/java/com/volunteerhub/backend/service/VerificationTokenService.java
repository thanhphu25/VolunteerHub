package com.volunteerhub.backend.service;

import com.volunteerhub.backend.entity.VerificationTokenEntity;

import java.time.Duration;
import java.util.Optional;

public interface VerificationTokenService {
    VerificationTokenEntity createToken(Long userId, VerificationTokenEntity.TokenType type, Duration validFor);
    Optional<VerificationTokenEntity> findByToken(String token);
    void markUsed(VerificationTokenEntity token);
}
