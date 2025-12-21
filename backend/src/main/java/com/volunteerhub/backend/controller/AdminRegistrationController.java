package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.service.IRegistrationApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing volunteer event registrations.
 * Provides endpoints for authorized users (Admin or Organizer) to approve registration requests.
 */
@RestController
@RequestMapping("/api/admin/events")
public class AdminRegistrationController {

    private final IRegistrationApprovalService approvalService;

    /**
     * Constructs the AdminRegistrationController with the necessary approval service.
     * * @param approvalService The service responsible for the registration approval logic.
     */
    public AdminRegistrationController(IRegistrationApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    /**
     * Approves a specific registration for a given event.
     * Accessible by users with 'ADMIN' or 'ORGANIZER' roles.
     * * @param eventId The unique identifier of the event.
     * @param registrationId The unique identifier of the registration to approve.
     * @param authentication The current security authentication context.
     * @return A ResponseEntity with a success message or error details (404, 409, or 500).
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
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Approval failed", "details", ex.getMessage()));
        }
    }

    /**
     * Helper method to extract the User ID from the current Authentication object.
     * Attempts to retrieve the ID via reflection from the principal or parse the authentication name.
     * * @param authentication The current authentication object.
     * @return The extracted User ID as a Long, or null if it cannot be determined.
     */
    private Long extractUserIdFromAuth(Authentication authentication) {
        if (authentication == null)
            return null;
        Object principal = authentication.getPrincipal();
        try {
            // Attempt to call getId() on the custom user principal object
            java.lang.reflect.Method m = principal.getClass().getMethod("getId");
            Object idv = m.invoke(principal);
            if (idv instanceof Number)
                return ((Number) idv).longValue();
        } catch (Throwable ignored) {
        }
        try {
            // Fallback: Attempt to parse the name (username/id) as a Long
            return Long.parseLong(authentication.getName());
        } catch (Throwable ignored) {
        }
        return null;
    }
}