package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.RefreshTokenEntity;
import com.volunteerhub.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

/**
 * Repository for managing refresh tokens used in authentication.
 * Provides token lookup, user-based queries, and token revocation operations.
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {
    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

    List<RefreshTokenEntity> findByUser(UserEntity user);

    void deleteAllByUser(UserEntity user);
}
