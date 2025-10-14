package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.dto.EventUpdateRequest;
import com.volunteerhub.backend.service.EventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) { this.eventService = eventService; }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        EventResponse resp = eventService.getEvent(id);
        return ResponseEntity.ok(new ApiSuccess(true, resp, null));
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventCreateRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        EventResponse resp = eventService.createEvent(req, email);
        return ResponseEntity.status(201).body(new ApiSuccess(true, resp, "Event created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @Valid @RequestBody EventUpdateRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        EventResponse resp = eventService.updateEvent(id, req, email);
        return ResponseEntity.ok(new ApiSuccess(true, resp, "Event updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        eventService.deleteEvent(id, email);
        return ResponseEntity.noContent().build();
    }
}
