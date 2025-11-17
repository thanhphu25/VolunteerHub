package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.entity.VerificationTokenEntity;
import com.volunteerhub.backend.repository.VerificationTokenRepository;
import com.volunteerhub.backend.service.VerificationTokenService;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class VerificationTokenServiceImpl implements VerificationTokenService {

    private final VerificationTokenRepository repo;
    private final SecureRandom random = new SecureRandom();

    public VerificationTokenServiceImpl(VerificationTokenRepository repo) {
        this.repo = repo;
    }

    @Override
    public VerificationTokenEntity createToken(Long userId, VerificationTokenEntity.TokenType type, Duration validFor) {
        VerificationTokenEntity t = new VerificationTokenEntity();
        t.setUserId(userId);
        // generate moderately long token: UUID + random bytes base64url
        String uid = UUID.randomUUID().toString().replace("-", "");
        byte[] extra = new byte[18];
        random.nextBytes(extra);
        String extraB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(extra);
        String token = uid + "." + extraB64;
        t.setToken(token);
        t.setType(type);
        t.setExpiresAt(LocalDateTime.now().plus(validFor));
        t.setUsed(false);
        repo.save(t);
        return t;
    }

    @Override
    public Optional<VerificationTokenEntity> findByToken(String token) {
        return repo.findByToken(token);
    }

    @Override
    public void markUsed(VerificationTokenEntity token) {
        token.setUsed(true);
        repo.save(token);
    }
}
