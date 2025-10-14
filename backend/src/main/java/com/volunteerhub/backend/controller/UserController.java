package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.PagedResponse;
import com.volunteerhub.backend.dto.UserResponse;
import com.volunteerhub.backend.model.User;
import com.volunteerhub.backend.repository.UserRepository;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ============================================================
    // 1️⃣ ADMIN: List users (with pagination)
    // ============================================================
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) int limit
    ) {
        List<User> all = userRepository.findAll();

        List<User> filtered = all.stream()
                .filter(u -> role == null || u.getRole() != null && u.getRole().name().equalsIgnoreCase(role))
                .filter(u -> status == null || u.getStatus() != null && u.getStatus().name().equalsIgnoreCase(status))
                .collect(Collectors.toList());

        int total = filtered.size();
        int totalPages = (int) Math.ceil((double) total / limit);
        int fromIndex = Math.max(0, (page - 1) * limit);
        int toIndex = Math.min(total, fromIndex + limit);

        List<UserResponse> pageData = filtered.subList(fromIndex, toIndex).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        PagedResponse<UserResponse> resp = new PagedResponse<>(
                pageData,
                page,
                limit,
                total,
                totalPages,
                page < totalPages,
                page > 1
        );

        return ResponseEntity.ok(new ApiSuccess(true, resp, null));
    }

    // ============================================================
    // 2️⃣ ADMIN: Lock user
    // ============================================================
    @PutMapping("/admin/users/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> lockUser(@PathVariable Long id) {
        Optional<User> ou = userRepository.findById(id);
        if (ou.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiError(false, "User not found", null));
        }
        User u = ou.get();
        u.setStatus(User.Status.locked);
        userRepository.save(u);
        return ResponseEntity.ok(new ApiSuccess(true, toResponse(u), "User locked"));
    }

    // ============================================================
    // 3️⃣ ADMIN: Unlock user
    // ============================================================
    @PutMapping("/admin/users/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unlockUser(@PathVariable Long id) {
        Optional<User> ou = userRepository.findById(id);
        if (ou.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiError(false, "User not found", null));
        }
        User u = ou.get();
        u.setStatus(User.Status.active);
        userRepository.save(u);
        return ResponseEntity.ok(new ApiSuccess(true, toResponse(u), "User unlocked"));
    }

    // ============================================================
    // 4️⃣ USER: Get own profile (fix lỗi /me)
    // ============================================================
    @GetMapping("/users/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }

        Optional<User> ou = userRepository.findByEmail(auth.getName());
        if (ou.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiError(false, "User not found", null));
        }

        return ResponseEntity.ok(new ApiSuccess(true, toResponse(ou.get()), null));
    }

    // ============================================================
    // 5️⃣ USER: Get user by ID (admin or self)
    // ============================================================
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, Authentication auth) {
        Optional<User> ou = userRepository.findById(id);
        if (ou.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiError(false, "User not found", null));
        }
        User target = ou.get();

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }

        Optional<User> oc = userRepository.findByEmail(auth.getName());
        if (oc.isEmpty()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        User current = oc.get();

        boolean isAdmin = current.getRole() == User.Role.admin;
        boolean isOwner = current.getId().equals(target.getId());
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(403).body(new ApiError(false, "Forbidden", null));
        }

        return ResponseEntity.ok(new ApiSuccess(true, toResponse(target), null));
    }

    // ============================================================
    // Helper mapper
    // ============================================================
    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getPhone(),
                u.getRole() == null ? null : u.getRole().name(),
                u.getStatus() == null ? null : u.getStatus().name(),
                u.getAvatarUrl(),
                u.getBio()
        );
    }
}
