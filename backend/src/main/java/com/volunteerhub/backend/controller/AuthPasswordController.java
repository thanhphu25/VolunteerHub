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

@RestController
@RequestMapping("/api/auth")
public class AuthPasswordController {

    private final UserRepository userRepository;
    private final VerificationTokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // configuration: how long tokens valid
    private static final Duration PASSWORD_RESET_TTL = Duration.ofMinutes(60); // 1 hour
    private static final Duration EMAIL_VERIFY_TTL = Duration.ofDays(7); // 7 days

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
     * Request password reset - will send an email with a token link if user exists.
     * Body: { "email": "user@example.com" }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        var userOpt = userRepository.findByEmail(email);
        // For security: always respond 200 OK (avoid user enumeration), but only create token if user exists
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            var token = tokenService.createToken(user.getId(), VerificationTokenEntity.TokenType.password_reset, PASSWORD_RESET_TTL);
            // send email (dev: logs). Link example (frontend): https://your-frontend/reset-password?token=...
            String resetLink = String.format("%s?token=%s", req.getFrontendResetUrl() == null ? "https://frontend/reset-password" : req.getFrontendResetUrl(), token.getToken());
            String body = "Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Nếu bạn muốn đặt lại, hãy mở liên kết sau:\n\n" +
                    resetLink + "\n\n" +
                    "Liên kết này có hiệu lực trong " + PASSWORD_RESET_TTL.toMinutes() + " phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.";
            emailService.sendEmail(user.getEmail(), "Yêu cầu đặt lại mật khẩu - VolunteerHub", body);
        }
        return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been sent."));
    }

    /**
     * Reset password using token:
     * Body: { "token": "...", "newPassword": "..." }
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
        // update password
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        // mark token used
        tokenService.markUsed(token);

        // optionally: invalidate all refresh tokens for this user (if you implemented refresh tokens)
        // ... implement if you have refreshTokens table.

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    /**
     * Verify email via GET token param
     * GET /api/auth/verify-email?token=...
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
