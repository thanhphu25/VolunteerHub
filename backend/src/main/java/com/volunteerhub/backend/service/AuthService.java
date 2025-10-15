package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.AuthResponse;
import com.volunteerhub.backend.dto.LoginRequest;
import com.volunteerhub.backend.dto.RegisterRequest;
import com.volunteerhub.backend.entity.RefreshTokenEntity;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.entity.Role;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.JwtProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.LocalDateTime;
import java.util.Date;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtProvider jwtProvider,
                       AuthenticationManager authenticationManager,
                       RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public UserEntity register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        UserEntity u = new UserEntity();
        u.setEmail(req.getEmail().toLowerCase().trim());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setFullName(req.getFullName());
        u.setPhone(req.getPhone());
        u.setRole(Role.volunteer); // default
        return userRepository.save(u);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        // authenticate
        var token = new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
        authenticationManager.authenticate(token); // will throw if invalid

        // load user to build JWT
        var user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found after auth"));

        String access = jwtProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refresh = jwtProvider.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());

        // parse expiry from token claims
        Date expDate = jwtProvider.getClaims(refresh).getExpiration();
        LocalDateTime expiresAt = LocalDateTime.ofInstant(expDate.toInstant(), ZoneId.systemDefault());

        // store refresh token in DB
        refreshTokenService.createRefreshToken(user, refresh, expiresAt);

        return new AuthResponse(access, refresh, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        // check signature & typ
        if (!jwtProvider.validateToken(refreshToken) || !jwtProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        // check DB existence and not revoked and not expired
        var tokenEntityOpt = refreshTokenService.findByToken(refreshToken);
        if (tokenEntityOpt.isEmpty()) throw new IllegalArgumentException("Refresh token not found");
        var tokenEntity = tokenEntityOpt.get();

        if (Boolean.TRUE.equals(tokenEntity.getRevoked())) throw new IllegalArgumentException("Refresh token revoked");
        if (tokenEntity.getExpiresAt() != null && tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token expired");
        }

        var claims = jwtProvider.getClaims(refreshToken);
        Long userId = Long.valueOf(claims.getSubject());
        var user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        // revoke old token
        refreshTokenService.revokeToken(tokenEntity);

        // generate new tokens and store new refresh
        String newAccess = jwtProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefresh = jwtProvider.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());
        Date newExpDate = jwtProvider.getClaims(newRefresh).getExpiration();
        LocalDateTime newExpiresAt = LocalDateTime.ofInstant(newExpDate.toInstant(), ZoneId.systemDefault());
        refreshTokenService.createRefreshToken(user, newRefresh, newExpiresAt);

        return new AuthResponse(newAccess, newRefresh, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Transactional
    public void logout(String refreshToken) {
        var tokenEntityOpt = refreshTokenService.findByToken(refreshToken);
        tokenEntityOpt.ifPresent(refreshTokenService::revokeToken);
    }
}
