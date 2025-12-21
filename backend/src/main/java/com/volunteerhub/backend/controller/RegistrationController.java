package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.RegistrationCreateRequest;
import com.volunteerhub.backend.dto.RegistrationResponse;
import com.volunteerhub.backend.service.IRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing volunteer registrations for events.
 * Handles the full lifecycle of a registration, including application, cancellation, 
 * approval, rejection, and completion (attendance marking).
 */
@RestController
@RequestMapping("/api")
public class RegistrationController {

    private final IRegistrationService svc;

    /**
     * Constructs the RegistrationController with the registration service.
     * @param svc Service handling the business logic for event registrations.
     */
    public RegistrationController(IRegistrationService svc) {
        this.svc = svc;
    }

    /**
     * Registers the authenticated volunteer for a specific event.
     * @param eventId The ID of the event to join.
     * @param req The registration details (e.g., motivation, contact info).
     * @param auth Current authentication context (must have VOLUNTEER role).
     * @return ResponseEntity containing the created registration details.
     */
    @PreAuthorize("hasRole('VOLUNTEER')")
    @PostMapping("/events/{eventId}/register")
    public ResponseEntity<?> register(@PathVariable Long eventId, @Valid @RequestBody RegistrationCreateRequest req,
            Authentication auth) {
        try {
            RegistrationResponse resp = svc.register(eventId, req, auth);
            return ResponseEntity.status(201).body(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to register"));
        }
    }

    /**
     * Cancels an existing registration.
     * Only the volunteer who owns the registration can perform this action.
     * @param eventId The ID of the event.
     * @param registrationId The ID of the specific registration to cancel.
     * @param auth Current authentication context.
     * @return The updated registration details with CANCELLED status.
     */
    @PreAuthorize("hasRole('VOLUNTEER')")
    @PostMapping("/events/{eventId}/registrations/{registrationId}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long eventId, @PathVariable Long registrationId,
            Authentication auth) {
        try {
            RegistrationResponse resp = svc.cancel(eventId, registrationId, auth);
            return ResponseEntity.ok(resp);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to cancel"));
        }
    }

    /**
     * Lists all registrations for a specific event.
     * Accessible by the event Organizer or system Admins.
     * @param eventId The ID of the event.
     * @param auth Current authentication context.
     * @return A list of registration responses for the event.
     */
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @GetMapping("/events/{eventId}/registrations")
    public ResponseEntity<?> listForEvent(@PathVariable Long eventId, Authentication auth) {
        try {
            List<RegistrationResponse> list = svc.listForEvent(eventId, auth);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to list registrations"));
        }
    }

    /**
     * Lists all event registrations belonging to the currently authenticated volunteer.
     * @param auth Current authentication context.
     * @return A list of the volunteer's registrations.
     */
    @PreAuthorize("hasRole('VOLUNTEER')")
    @GetMapping("/me/registrations")
    public ResponseEntity<?> listForVolunteer(Authentication auth) {
        try {
            List<RegistrationResponse> list = svc.listForVolunteer(auth);
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to list registrations"));
        }
    }

    /**
     * Retrieves the specific registration for the authenticated user for a single event.
     * @param eventId The ID of the event.
     * @param auth Current authentication context.
     * @return The registration details or 404 if no registration exists for this user/event.
     */
    @PreAuthorize("hasRole('VOLUNTEER')")
    @GetMapping("/events/{eventId}/my-registration")
    public ResponseEntity<?> getMyRegistration(@PathVariable Long eventId, Authentication auth) {
        try {
            RegistrationResponse registration = svc.getRegistrationByEventAndVolunteer(eventId, auth);
            if (registration == null) {
                return ResponseEntity.status(404)
                        .body(java.util.Map.of("error", "No registration found for this event"));
            }
            return ResponseEntity.ok(registration);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to get registration"));
        }
    }

    /**
     * Approves a volunteer's registration for an event.
     * @param eventId The ID of the event.
     * @param registrationId The ID of the registration to approve.
     * @param auth Current authentication context.
     * @return The updated registration details with APPROVED status.
     */
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping("/events/{eventId}/registrations/{registrationId}/approve")
    public ResponseEntity<?> approve(@PathVariable Long eventId, @PathVariable Long registrationId,
            Authentication auth) {
        try {
            RegistrationResponse resp = svc.approve(eventId, registrationId, auth);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to approve"));
        }
    }

    /**
     * Rejects a volunteer's registration for an event.
     * @param eventId The ID of the event.
     * @param registrationId The ID of the registration to reject.
     * @param auth Current authentication context.
     * @return The updated registration details with REJECTED status.
     */
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping("/events/{eventId}/registrations/{registrationId}/reject")
    public ResponseEntity<?> reject(@PathVariable Long eventId, @PathVariable Long registrationId,
            Authentication auth) {
        try {
            RegistrationResponse resp = svc.reject(eventId, registrationId, auth);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to reject"));
        }
    }

    /**
     * Marks a registration as completed, used for tracking attendance and participation.
     * @param eventId The ID of the event.
     * @param registrationId The ID of the registration.
     * @param present Boolean flag indicating if the volunteer actually attended.
     * @param note Optional administrative note regarding the volunteer's performance or attendance.
     * @param auth Current authentication context.
     * @return The updated registration details with COMPLETED status.
     */
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping("/events/{eventId}/registrations/{registrationId}/complete")
    public ResponseEntity<?> complete(@PathVariable Long eventId,
            @PathVariable Long registrationId,
            @RequestParam(defaultValue = "true") boolean present,
            @RequestParam(required = false) String note,
            Authentication auth) {
        try {
            RegistrationResponse resp = svc.markCompleted(eventId, registrationId, present, note, auth);
            return ResponseEntity.ok(resp);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to complete registration"));
        }
    }
}