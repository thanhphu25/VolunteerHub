package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.service.IRegistrationApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Admin / Organizer endpoints to manage registrations (approve).
 * NOTE: class-level mapping changed to /api/admin/events to avoid collision
 * with non-admin registration controller routes.
 */
@RestController
@RequestMapping("/api/admin/events")
public class AdminRegistrationController {

    private final IRegistrationApprovalService approvalService;

    public AdminRegistrationController(IRegistrationApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    /**
     * Approve a registration (admin / organizer).
     * POST /api/admin/events/{eventId}/registrations/{registrationId}/approve
     */
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @PostMapping("/{eventId}/registrations/{registrationId}/approve")
    public ResponseEntity<?> approveRegistration(@PathVariable Long eventId,
                                                 @PathVariable Long registrationId,
                                                 Authentication authentication) {
        try {
            Long approverId = extractUserIdFromAuth(authentication);
            approvalService.approveRegistration(registrationId, approverId);
            return ResponseEntity.ok(java.util.Map.of("message", "approved"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Approval failed", "details", ex.getMessage()));
        }
    }

    private Long extractUserIdFromAuth(Authentication authentication) {
        if (authentication == null) return null;
        Object principal = authentication.getPrincipal();
        try {
            java.lang.reflect.Method m = principal.getClass().getMethod("getId");
            Object idv = m.invoke(principal);
            if (idv instanceof Number) return ((Number) idv).longValue();
        } catch (Throwable ignored) {}
        try {
            return Long.parseLong(authentication.getName());
        } catch (Throwable ignored) {}
        return null;
    }
}
