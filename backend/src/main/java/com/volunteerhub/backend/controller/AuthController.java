package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.service.IAuthService;
import com.volunteerhub.backend.dto.AuthResponse;
import com.volunteerhub.backend.dto.LoginRequest;
import com.volunteerhub.backend.dto.RegisterRequest;
import com.volunteerhub.backend.dto.RefreshRequest;
import com.volunteerhub.backend.dto.LogoutRequest;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller handling authentication and authorization requests.
 * Provides endpoints for user registration, login, token refreshing, logout, and profile retrieval.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final IAuthService authService;
    private static final String ADMIN_SECRET_KEY = "VOLUNTEER_HUB_2025_SUPER_SECRET";

    /**
     * Constructs the AuthController with the required authentication service.
     * * @param svc The service handling core authentication logic.
     */
    public AuthController(IAuthService svc) {
        this.authService = svc;
    }

    /**
     * Registers a new administrator account.
     * Requires a valid admin secret key passed in the request header for security.
     * * @param req The registration details for the admin account.
     * @param secretKey The security key required to authorize admin creation.
     * @return ResponseEntity containing the created admin details or error status.
     */
    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(
            @Valid @RequestBody RegisterRequest req,
            @RequestHeader(value = "x-admin-secret", required = false) String secretKey) {
        if (secretKey == null || !secretKey.equals(ADMIN_SECRET_KEY)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("error", "Forbidden: Invalid or missing Admin Secret Key"));
        }

        try {
            UserEntity created = authService.registerAdmin(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    java.util.Map.of(
                            "message", "Admin account created successfully",
                            "id", created.getId(),
                            "email", created.getEmail(),
                            "role", created.getRole().name()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Unable to register admin"));
        }
    }

    /**
     * Registers a standard user account.
     * * @param req The registration details for the new user.
     * @return ResponseEntity containing basic user info or error status.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            UserEntity created = authService.register(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    java.util.Map.of(
                            "id", created.getId(),
                            "email", created.getEmail(),
                            "fullName", created.getFullName()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Unable to register user"));
        }
    }

    /**
     * Authenticates a user and returns access and refresh tokens.
     * * @param req User credentials (email and password).
     * @return ResponseEntity containing AuthResponse (tokens and user info).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            AuthResponse resp = authService.login(req);
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Invalid credentials"));
        }
    }

    /**
     * Refreshes an expired access token using a valid refresh token.
     * * @param req Request containing the refresh token.
     * @return ResponseEntity containing new access and refresh tokens.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequest req) {
        try {
            AuthResponse resp = authService.refresh(req.getRefreshToken());
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Unable to refresh token"));
        }
    }

    /**
     * Logs out the user by invalidating their refresh token.
     * * @param req Request containing the refresh token to be invalidated.
     * @return ResponseEntity confirming logout success.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody LogoutRequest req) {
        try {
            authService.logout(req.getRefreshToken());
            return ResponseEntity.ok(java.util.Map.of("message", "Logged out"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Unable to logout"));
        }
    }

    /**
     * Retrieves the profile information of the currently authenticated user.
     * * @param authentication The current security context authentication object.
     * @return ResponseEntity containing current user details (ID, email, name, role).
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("error", "Not authenticated"));
        }
        CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();
        var u = cud.getUserEntity();
        return ResponseEntity.ok(java.util.Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "fullName", u.getFullName(),
                "role", u.getRole().name()));
    }
}