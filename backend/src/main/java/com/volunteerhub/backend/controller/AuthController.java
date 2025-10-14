package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.JwtResponse;
import com.volunteerhub.backend.dto.LoginRequest;
import com.volunteerhub.backend.dto.RegisterRequest;
import com.volunteerhub.backend.dto.UserResponse;
import com.volunteerhub.backend.model.User;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // Register (unchanged)
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(409).body(new ApiError(false, "Email already exists", null));
        }

        User.Role role = User.Role.volunteer;
        if ("organizer".equalsIgnoreCase(req.getRole())) role = User.Role.organizer;
        if ("admin".equalsIgnoreCase(req.getRole())) role = User.Role.admin;

        User u = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .role(role)
                .status(User.Status.active)
                .build();

        User saved = userRepository.save(u);

        UserResponse resp = new UserResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getPhone(),
                saved.getRole().name(),
                saved.getStatus().name(),
                saved.getAvatarUrl(),
                saved.getBio()
        );

        return ResponseEntity.created(URI.create("/api/v1/users/" + saved.getId()))
                .body(new ApiSuccess(true, resp, "User created"));
    }

    // Login -> returns JWT
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        // principal is Spring Security UserDetails
        UserDetails ud = (UserDetails) authentication.getPrincipal();
        Optional<User> ou = userRepository.findByEmail(ud.getUsername());
        if (ou.isEmpty()) {
            return ResponseEntity.status(500).body(new ApiError(false, "User record not found after authentication", null));
        }
        User user = ou.get();

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        JwtResponse resp = new JwtResponse(token, "Bearer", user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
        return ResponseEntity.ok(new ApiSuccess(true, resp, "Login successful"));
    }

    // Protected: get current user
    @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ApiError(false, "User not found", null));
        }
        UserResponse resp = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getAvatarUrl(),
                user.getBio()
        );
        return ResponseEntity.ok(new ApiSuccess(true, resp, null));
    }
}
