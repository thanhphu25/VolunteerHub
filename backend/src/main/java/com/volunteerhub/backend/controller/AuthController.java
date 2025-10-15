package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.AuthResponse;
import com.volunteerhub.backend.dto.LoginRequest;
import com.volunteerhub.backend.dto.RegisterRequest;
import com.volunteerhub.backend.dto.RefreshRequest;
import com.volunteerhub.backend.dto.LogoutRequest;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.security.CustomUserDetails;
import com.volunteerhub.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService svc) {
        this.authService = svc;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            UserEntity created = authService.register(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    java.util.Map.of(
                            "id", created.getId(),
                            "email", created.getEmail(),
                            "fullName", created.getFullName()
                    )
            );
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Unable to register user"));
        }
    }

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

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequest req) {
        try {
            AuthResponse resp = authService.refresh(req.getRefreshToken());
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("error", "Unable to refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody LogoutRequest req) {
        try {
            authService.logout(req.getRefreshToken());
            return ResponseEntity.ok(java.util.Map.of("message", "Logged out"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("error", "Unable to logout"));
        }
    }

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
                "role", u.getRole().name()
        ));
    }
}
