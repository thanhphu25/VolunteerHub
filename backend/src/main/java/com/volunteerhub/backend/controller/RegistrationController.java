package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.RegistrationDto;
import com.volunteerhub.backend.dto.RegistrationRequest;
import com.volunteerhub.backend.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class RegistrationController {

    private final RegistrationService registrationService;
    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // Volunteer registers for event
    @PostMapping("/api/events/{eventId}/register")
    public ResponseEntity<RegistrationDto> register(@PathVariable Long eventId,
                                                    @Valid @RequestBody RegistrationRequest req) {
        RegistrationDto dto = registrationService.register(eventId, req);
        return ResponseEntity.status(201).body(dto);
    }

    @PostMapping("/api/events/{eventId}/unregister")
    public ResponseEntity<Void> unregister(@PathVariable Long eventId,
                                           @Valid @RequestBody RegistrationRequest req) {
        registrationService.unregister(eventId, req);
        return ResponseEntity.noContent().build();
    }

    // Manager/Admin views event registrations
    @GetMapping("/api/events/{eventId}/registrations")
    public ResponseEntity<List<RegistrationDto>> listByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.listByEvent(eventId));
    }

    // Volunteer views own registrations
    @GetMapping("/api/users/{userId}/registrations")
    public ResponseEntity<List<RegistrationDto>> listByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.listByUser(userId));
    }

    // Manager approves a registration
    @PatchMapping("/api/registrations/{registrationId}/approve")
    public ResponseEntity<RegistrationDto> approve(@PathVariable Long registrationId) {
        return ResponseEntity.ok(registrationService.approve(registrationId));
    }

    @PatchMapping("/api/registrations/{registrationId}/cancel")
    public ResponseEntity<RegistrationDto> cancel(@PathVariable Long registrationId) {
        return ResponseEntity.ok(registrationService.cancel(registrationId));
    }

    @PatchMapping("/api/registrations/{registrationId}/complete")
    public ResponseEntity<RegistrationDto> complete(@PathVariable Long registrationId) {
        return ResponseEntity.ok(registrationService.complete(registrationId));
    }
}
