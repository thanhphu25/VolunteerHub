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
 * Controller for managing email verification requests.
 * Handles sending verification links to both public users and currently authenticated users.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthVerifyController {

    private final UserRepository userRepository;
    private final VerificationTokenService tokenService;
    private final EmailService emailService;

    /** Time-to-live for email verification tokens (7 days) */
    private static final Duration EMAIL_VERIFY_TTL = Duration.ofDays(7);

    /**
     * Constructs the AuthVerifyController with required services for user and token management.
     * @param userRepository Repository for accessing user account data.
     * @param tokenService Service for creating and managing verification tokens.
     * @param emailService Service for sending verification emails.
     */
    public AuthVerifyController(UserRepository userRepository,
            VerificationTokenService tokenService,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }

    /**
     * Sends a verification email to a public address provided in the request.
     * Checks if the email is associated with an unverified account before sending.
     * @param req Request body containing the target email and frontend callback URL.
     * @return ResponseEntity with a generic success message to maintain security.
     */
    @PostMapping("/send-verify-email")
    public ResponseEntity<?> sendVerifyEmailPublic(@Valid @RequestBody SendVerifyEmailRequest req) {
        String email = req.getEmail();
        String frontendUrl = req.getFrontendVerifyUrl();

        if (email != null)
            email = email.trim().toLowerCase();

        if (email != null && !email.isBlank()) {
            Optional<UserEntity> opt = userRepository.findByEmail(email);
            if (opt.isPresent()) {
                UserEntity user = opt.get();
                // Only send if the email is not already verified
                if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                    createAndSendToken(user.getId(), user.getEmail(), frontendUrl);
                }
            }
        }

        return ResponseEntity
                .ok(Map.of("message", "If an account with that email exists, a verification email was sent."));
    }

    /**
     * Sends a verification email to the currently authenticated user.
     * Attempts to resolve user identity from the Authentication principal using reflection or naming.
     * @param req Optional request body containing a specific frontend callback URL.
     * @param authentication The security context of the logged-in user.
     * @return ResponseEntity confirming the attempt to send the verification email.
     */
    @PostMapping("/send-verify-email/me")
    public ResponseEntity<?> sendVerifyEmailMe(@RequestBody(required = false) SendVerifyEmailRequest req,
            Authentication authentication) {
        Long userId = null;
        String userEmail = null;
        if (authentication != null) {
            try {
                Object principal = authentication.getPrincipal();
                // Strategy 1: Extract ID via reflection
                try {
                    java.lang.reflect.Method m = principal.getClass().getMethod("getId");
                    Object idv = m.invoke(principal);
                    if (idv instanceof Number)
                        userId = ((Number) idv).longValue();
                } catch (Throwable ignored) {
                }

                // Strategy 2: Extract Email via reflection if ID failed
                if (userId == null) {
                    try {
                        java.lang.reflect.Method mu = principal.getClass().getMethod("getEmail");
                        Object ev = mu.invoke(principal);
                        if (ev instanceof String)
                            userEmail = ((String) ev).trim().toLowerCase();
                    } catch (Throwable ignored) {
                    }
                }

                // Strategy 3: Parse authentication name (ID or Email string)
                if (userEmail == null && userId == null) {
                    String name = authentication.getName();
                    if (name != null && name.matches("^[0-9]+$")) {
                        try {
                            userId = Long.parseLong(name);
                        } catch (Throwable ignored) {
                        }
                    } else {
                        userEmail = (name == null ? null : name.trim().toLowerCase());
                    }
                }
            } catch (Throwable ignored) {
            }
        }

        // Process based on identified User ID
        if (userId != null) {
            Optional<UserEntity> opt = userRepository.findById(userId);
            if (opt.isPresent()) {
                UserEntity user = opt.get();
                if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                    createAndSendToken(user.getId(), user.getEmail(), req == null ? null : req.getFrontendVerifyUrl());
                }
            }
        } else if (userEmail != null) { // Fallback to Email search
            Optional<UserEntity> opt = userRepository.findByEmail(userEmail);
            opt.ifPresent(user -> {
                if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                    createAndSendToken(user.getId(), user.getEmail(), req == null ? null : req.getFrontendVerifyUrl());
                }
            });
        }

        return ResponseEntity
                .ok(Map.of("message", "If your account exists and is unverified, a verification email was sent."));
    }

    /**
     * Internal helper to generate a verification token and dispatch the email.
     * @param userId The ID of the user to verify.
     * @param email The target email address.
     * @param frontendUrl The base URL for the verification link.
     */
    private void createAndSendToken(Long userId, String email, String frontendUrl) {
        try {
            VerificationTokenEntity token = tokenService.createToken(userId,
                    VerificationTokenEntity.TokenType.verify_email, EMAIL_VERIFY_TTL);
            String base = (frontendUrl == null || frontendUrl.isBlank()) ? "https://frontend/verify-email"
                    : frontendUrl;
            String url = base + (base.contains("?") ? "&" : "?") + "token=" + token.getToken();
            String body = "Hello,\n\nPlease verify your email address by clicking the following link:\n\n" + url +
                    "\n\nThis link is valid until: " + token.getExpiresAt().toString() +
                    "\n\nIf you did not request this, you can safely ignore this email.";
            emailService.sendEmail(email, "Email Verification - VolunteerHub", body);
        } catch (Exception ex) {
            try {
                java.util.logging.Logger.getLogger(AuthVerifyController.class.getName())
                        .warning("Failed to create/send verify token: " + ex.getMessage());
            } catch (Throwable ignore) {
            }
        }
    }
}