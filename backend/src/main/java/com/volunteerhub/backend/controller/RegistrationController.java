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

@RestController
@RequestMapping("/api")
public class RegistrationController {

    private final IRegistrationService svc;

    public RegistrationController(IRegistrationService svc) {
        this.svc = svc;
    }

    // Volunteer registers for an event
    @PreAuthorize("hasRole('VOLUNTEER')")
    @PostMapping("/events/{eventId}/register")
    public ResponseEntity<?> register(@PathVariable Long eventId, @Valid @RequestBody RegistrationCreateRequest req, Authentication auth) {
        try {
            RegistrationResponse resp = svc.register(eventId, req, auth);
            return ResponseEntity.status(201).body(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to register"));
        }
    }

    // Volunteer cancels registration
    @PreAuthorize("hasRole('VOLUNTEER')")
    @PostMapping("/events/{eventId}/registrations/{registrationId}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long eventId, @PathVariable Long registrationId, Authentication auth) {
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

    // Organizer/Admin: list registrations for event
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

    // Volunteer: list own registrations
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

    // Volunteer: get own registration for specific event
    @PreAuthorize("hasRole('VOLUNTEER')")
    @GetMapping("/events/{eventId}/my-registration")
    public ResponseEntity<?> getMyRegistration(@PathVariable Long eventId, Authentication auth) {
        try {
            RegistrationResponse registration = svc.getRegistrationByEventAndVolunteer(eventId, auth);
            if (registration == null) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "No registration found for this event"));
            }
            return ResponseEntity.ok(registration);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to get registration"));
        }
    }

    // Organizer/Admin: approve a registration
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping("/events/{eventId}/registrations/{registrationId}/approve")
    public ResponseEntity<?> approve(@PathVariable Long eventId, @PathVariable Long registrationId, Authentication auth) {
        try {
            RegistrationResponse resp = svc.approve(eventId, registrationId, auth);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to approve"));
        }
    }

    // Organizer/Admin: reject
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping("/events/{eventId}/registrations/{registrationId}/reject")
    public ResponseEntity<?> reject(@PathVariable Long eventId, @PathVariable Long registrationId, Authentication auth) {
        try {
            RegistrationResponse resp = svc.reject(eventId, registrationId, auth);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to reject"));
        }
    }

    // Organizer/Admin: mark completed & attendance
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
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to complete registration"));
        }
    }
}
