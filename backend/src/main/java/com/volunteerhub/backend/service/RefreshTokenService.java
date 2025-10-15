package com.volunteerhub.backend.service;

import com.volunteerhub.backend.entity.RefreshTokenEntity;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    @Transactional
    public RefreshTokenEntity createRefreshToken(UserEntity user, String token, LocalDateTime expiresAt) {
        RefreshTokenEntity e = new RefreshTokenEntity();
        e.setUser(user);
        e.setToken(token);
        e.setTokenHash(sha256Hex(token));
        e.setExpiresAt(expiresAt);
        e.setRevoked(false);
        return repo.save(e);
    }

    /**
     * Find by token string: compute hash and query DB.
     */
    public Optional<RefreshTokenEntity> findByToken(String token) {
        String hash = sha256Hex(token);
        return repo.findByTokenHash(hash);
    }

    @Transactional
    public void revokeToken(RefreshTokenEntity tokenEntity) {
        tokenEntity.setRevoked(true);
        repo.save(tokenEntity);
    }

    @Transactional
    public void revokeAllForUser(UserEntity user) {
        var tokens = repo.findByUser(user);
        tokens.forEach(t -> t.setRevoked(true));
        repo.saveAll(tokens);
    }

    @Transactional
    public void deleteAllForUser(UserEntity user) {
        repo.deleteAllByUser(user);
    }
}
