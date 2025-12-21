package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.ForgotPasswordRequest;
import com.volunteerhub.backend.dto.ResetPasswordRequest;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.entity.VerificationTokenEntity;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.service.EmailService;
import com.volunteerhub.backend.service.VerificationTokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Controller for managing password-related security actions and email verification.
 * Handles forgot password requests, password resetting, and email confirmation workflows.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthPasswordController {

    private final UserRepository userRepository;
    private final VerificationTokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /** Time-to-live for password reset tokens (60 minutes) */
    private static final Duration PASSWORD_RESET_TTL = Duration.ofMinutes(60);
    
    /** Time-to-live for email verification tokens (7 days) */
    private static final Duration EMAIL_VERIFY_TTL = Duration.ofDays(7);

    /**
     * Constructs the AuthPasswordController with necessary repositories and services.
     * @param userRepository Repository for user data access.
     * @param tokenService Service for managing verification tokens.
     * @param emailService Service for sending notification and verification emails.
     * @param passwordEncoder Component for secure password hashing.
     */
    public AuthPasswordController(UserRepository userRepository,
            VerificationTokenService tokenService,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Initiates the "Forgot Password" process.
     * Generates a unique reset token and sends an email with a reset link if the user exists.
     * @param req Request body containing the user's email and the frontend callback URL.
     * @return ResponseEntity with a generic success message to prevent email enumeration attacks.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            var token = tokenService.createToken(user.getId(), VerificationTokenEntity.TokenType.password_reset,
                    PASSWORD_RESET_TTL);
            String resetLink = String.format("%s?token=%s",
                    req.getFrontendResetUrl() == null ? "https://frontend/reset-password" : req.getFrontendResetUrl(),
                    token.getToken());
            String body = "You (or someone else) requested a password reset. If you wish to proceed, click the link below:\n\n"
                    + resetLink + "\n\n" +
                    "This link is valid for " + PASSWORD_RESET_TTL.toMinutes()
                    + " minutes. If you did not request this, please ignore this email.";
            emailService.sendEmail(user.getEmail(), "Password Reset Request - VolunteerHub", body);
        }
        return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been sent."));
    }

    /**
     * Resets a user's password using a valid reset token.
     * Validates token existence, type, usage status, and expiration before updating the password.
     * @param req Request body containing the reset token and the new password.
     * @return ResponseEntity indicating success or specific validation errors (400).
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        var tokenOpt = tokenService.findByToken(req.getToken());
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid token"));
        }
        var token = tokenOpt.get();
        if (token.getType() != VerificationTokenEntity.TokenType.password_reset) {
            return ResponseEntity.status(400).body(Map.of("error", "Token is not a password reset token"));
        }
        if (token.getUsed()) {
            return ResponseEntity.status(400).body(Map.of("error", "Token already used"));
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body(Map.of("error", "Token expired"));
        }

        var userOpt = userRepository.findById(token.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "User not found"));
        }
        UserEntity user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        tokenService.markUsed(token);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    /**
     * Verifies a user's email address using a verification token.
     * Marks the user's email as verified and records the verification timestamp.
     * @param tokenStr The unique verification token string from the URL.
     * @return ResponseEntity indicating successful verification or validation errors (400).
     */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String tokenStr) {
        var tokenOpt = tokenService.findByToken(tokenStr);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid token"));
        }
        var token = tokenOpt.get();
        if (token.getType() != VerificationTokenEntity.TokenType.verify_email) {
            return ResponseEntity.status(400).body(Map.of("error", "Token is not email verify token"));
        }
        if (token.getUsed()) {
            return ResponseEntity.status(400).body(Map.of("error", "Token already used"));
        }
        if (token.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.status(400).body(Map.of("error", "Token expired"));
        }

        var userOpt = userRepository.findById(token.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "User not found"));
        }
        var user = userOpt.get();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        tokenService.markUsed(token);

        return ResponseEntity.ok(Map.of("message", "Email verified"));
    }
}