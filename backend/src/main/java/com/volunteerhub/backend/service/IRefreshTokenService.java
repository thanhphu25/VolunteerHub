package com.volunteerhub.backend.service;

import com.volunteerhub.backend.entity.RefreshTokenEntity;
import com.volunteerhub.backend.entity.UserEntity;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service interface for managing refresh tokens.
 * Handles token creation, revocation, and user-level token lifecycle.
 */
public interface IRefreshTokenService {
    RefreshTokenEntity createRefreshToken(UserEntity user, String token, LocalDateTime expiresAt);

    Optional<RefreshTokenEntity> findByToken(String token);

    void revokeToken(RefreshTokenEntity tokenEntity);

    void revokeAllForUser(UserEntity user);

    void deleteAllForUser(UserEntity user);
}
