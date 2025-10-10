package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.RegistrationDto;
import com.volunteerhub.backend.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.volunteerhub.backend.security.UserDetailsImpl;

import java.util.List;

@RestController
public class RegistrationController {

    private final RegistrationService registrationService;
    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // Volunteer registers for event — uses authenticated user
    @PostMapping("/api/events/{eventId}/register")
    public ResponseEntity<RegistrationDto> register(@PathVariable Long eventId,
                                                    @AuthenticationPrincipal UserDetailsImpl userDetails) {
        RegistrationDto dto = registrationService.registerByUserId(eventId, userDetails.getId());
        return ResponseEntity.status(201).body(dto);
    }

    // Volunteer unregisters (authenticated)
    @PostMapping("/api/events/{eventId}/unregister")
    public ResponseEntity<Void> unregister(@PathVariable Long eventId,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        registrationService.unregisterByUserId(eventId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    // Manager/Admin views event registrations
    @GetMapping("/api/events/{eventId}/registrations")
    @PreAuthorize("hasAuthority('ROLE_MANAGER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<RegistrationDto>> listByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.listByEvent(eventId));
    }

    // Volunteer views own registrations
    @GetMapping("/api/users/me/registrations")
    public ResponseEntity<List<RegistrationDto>> listByMe(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(registrationService.listByUser(userDetails.getId()));
    }

    // Manager approves a registration
    @PatchMapping("/api/registrations/{registrationId}/approve")
    @PreAuthorize("hasAuthority('ROLE_MANAGER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<RegistrationDto> approve(@PathVariable Long registrationId) {
        return ResponseEntity.ok(registrationService.approve(registrationId));
    }

    @PatchMapping("/api/registrations/{registrationId}/cancel")
    @PreAuthorize("hasAuthority('ROLE_MANAGER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<RegistrationDto> cancel(@PathVariable Long registrationId) {
        return ResponseEntity.ok(registrationService.cancel(registrationId));
    }

    @PatchMapping("/api/registrations/{registrationId}/complete")
    @PreAuthorize("hasAuthority('ROLE_MANAGER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<RegistrationDto> complete(@PathVariable Long registrationId) {
        return ResponseEntity.ok(registrationService.complete(registrationId));
    }
}
