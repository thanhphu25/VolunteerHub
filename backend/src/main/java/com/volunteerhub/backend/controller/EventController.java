package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.service.IEventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final IEventService svc;

    public EventController(IEventService svc) {
        this.svc = svc;
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventCreateRequest req, Authentication auth) {
        try {
            EventResponse resp = svc.createEvent(req, auth);
            return ResponseEntity.status(201).body(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to create event"));
        }
    }

    @GetMapping
    public ResponseEntity<?> listEvents(
            @RequestParam Optional<String> status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<EventResponse> p = svc.listEvents(status, PageRequest.of(page, size));
        return ResponseEntity.ok(p);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        try {
            EventResponse resp = svc.getEvent(id);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @Valid @RequestBody EventCreateRequest req, Authentication auth) {
        try {
            EventResponse resp = svc.updateEvent(id, req, auth);
            return ResponseEntity.ok(resp);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to update event"));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveEvent(@PathVariable Long id, Authentication auth) {
        try {
            EventResponse resp = svc.approveEvent(id, auth);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to approve event"));
        }
    }
}
