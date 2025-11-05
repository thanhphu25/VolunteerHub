package com.volunteerhub.backend.repository;

import com.volunteerhub.backend.entity.VerificationTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationTokenEntity, Long> {
    Optional<VerificationTokenEntity> findByToken(String token);
    Optional<VerificationTokenEntity> findByTokenAndType(String token, VerificationTokenEntity.TokenType type);
}
