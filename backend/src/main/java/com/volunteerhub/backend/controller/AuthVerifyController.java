package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.SendVerifyEmailRequest;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.entity.VerificationTokenEntity;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.service.EmailService;
import com.volunteerhub.backend.service.VerificationTokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Endpoints to send verification email (resend).
 *
 * - POST /api/auth/send-verify-email  (body: { email?, frontendVerifyUrl? })  -- unauthenticated allowed
 * - POST /api/auth/send-verify-email/me  (body: { frontendVerifyUrl? })     -- authenticated user
 *
 * For security, responses are generic (200 OK) even if email/user doesn't exist.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthVerifyController {

    private final UserRepository userRepository;
    private final VerificationTokenService tokenService;
    private final EmailService emailService;

    // TTL for verify email tokens; keep same value as earlier (7 days)
    private static final Duration EMAIL_VERIFY_TTL = Duration.ofDays(7);

    public AuthVerifyController(UserRepository userRepository,
                                VerificationTokenService tokenService,
                                EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }

    /**
     * Unauthenticated: request sending verification email for given email address.
     * Response is always 200 to avoid user enumeration.
     */
    @PostMapping("/send-verify-email")
    public ResponseEntity<?> sendVerifyEmailPublic(@Valid @RequestBody SendVerifyEmailRequest req) {
        String email = req.getEmail();
        String frontendUrl = req.getFrontendVerifyUrl();

        if (email != null) email = email.trim().toLowerCase();

        if (email != null && !email.isBlank()) {
            Optional<UserEntity> opt = userRepository.findByEmail(email);
            if (opt.isPresent()) {
                UserEntity user = opt.get();
                // If already verified, still respond 200 but optionally log
                if (Boolean.TRUE.equals(user.getEmailVerified())) {
                    // optional early log
                } else {
                    createAndSendToken(user.getId(), user.getEmail(), frontendUrl);
                }
            } // else: do nothing (don't reveal)
        }

        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a verification email was sent."));
    }

    /**
     * Authenticated user: send verification email to current user (if not verified).
     */
    @PostMapping("/send-verify-email/me")
    public ResponseEntity<?> sendVerifyEmailMe(@RequestBody(required = false) SendVerifyEmailRequest req,
                                               Authentication authentication) {
        // Extract authenticated user id -> find user
        Long userId = null;
        String userEmail = null;
        if (authentication != null) {
            try {
                Object principal = authentication.getPrincipal();
                // try getId()
                try {
                    java.lang.reflect.Method m = principal.getClass().getMethod("getId");
                    Object idv = m.invoke(principal);
                    if (idv instanceof Number) userId = ((Number) idv).longValue();
                } catch (Throwable ignored) {}

                // fallback: try getUsername()/getEmail()
                if (userId == null) {
                    try {
                        java.lang.reflect.Method mu = principal.getClass().getMethod("getEmail");
                        Object ev = mu.invoke(principal);
                        if (ev instanceof String) userEmail = ((String) ev).trim().toLowerCase();
                    } catch (Throwable ignored) {}
                }

                if (userEmail == null && userId == null) {
                    // fallback to authentication.getName()
                    String name = authentication.getName();
                    if (name != null && name.matches("^[0-9]+$")) {
                        try { userId = Long.parseLong(name); } catch (Throwable ignored) {}
                    } else {
                        userEmail = (name == null ? null : name.trim().toLowerCase());
                    }
                }
            } catch (Throwable ignored) {}
        }

        if (userId != null) {
            Optional<UserEntity> opt = userRepository.findById(userId);
            if (opt.isPresent()) {
                UserEntity user = opt.get();
                if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                    createAndSendToken(user.getId(), user.getEmail(), req == null ? null : req.getFrontendVerifyUrl());
                }
            }
        } else if (userEmail != null) {
            Optional<UserEntity> opt = userRepository.findByEmail(userEmail);
            opt.ifPresent(user -> {
                if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                    createAndSendToken(user.getId(), user.getEmail(), req == null ? null : req.getFrontendVerifyUrl());
                }
            });
        }

        return ResponseEntity.ok(Map.of("message", "If your account exists and is unverified, a verification email was sent."));
    }

    private void createAndSendToken(Long userId, String email, String frontendUrl) {
        try {
            VerificationTokenEntity token = tokenService.createToken(userId, VerificationTokenEntity.TokenType.verify_email, EMAIL_VERIFY_TTL);
            String base = (frontendUrl == null || frontendUrl.isBlank()) ? "https://frontend/verify-email" : frontendUrl;
            String url = base + (base.contains("?") ? "&" : "?") + "token=" + token.getToken();
            String body = "Xin chào,\n\nVui lòng xác thực email của bạn bằng cách click vào liên kết sau:\n\n" + url +
                    "\n\nLiên kết có hiệu lực đến: " + token.getExpiresAt().toString() +
                    "\n\nNếu bạn không yêu cầu, bạn có thể bỏ qua email này.";
            emailService.sendEmail(email, "Xác thực email - VolunteerHub", body);
        } catch (Exception ex) {
            // swallow exception to avoid leaking info; log internally
            try { java.util.logging.Logger.getLogger(AuthVerifyController.class.getName()).warning("Failed to create/send verify token: " + ex.getMessage()); } catch(Throwable ignore) {}
        }
    }
}

