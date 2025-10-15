package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.dto.EventUpdateRequest;
import com.volunteerhub.backend.dto.PagedResponse;
import com.volunteerhub.backend.service.EventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * EventController
 * - GET /api/v1/events          -> list events (public)
 * - GET /api/v1/events/{id}     -> get single event
 * - POST /api/v1/events         -> create (authenticated: organizer/admin)
 * - PUT /api/v1/events/{id}     -> update (owner or admin)
 * - DELETE /api/v1/events/{id}  -> soft delete (owner or admin)
 */
@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) { this.eventService = eventService; }

    /**
     * List events (public). Supports pagination and simple filters.
     * Example:
     *  GET /api/v1/events?page=1&limit=10&category=education&status=approved&search=tree&sort=startDate,asc
     */
    @GetMapping
    public ResponseEntity<?> listEvents(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTo,
            @RequestParam(required = false, defaultValue = "startDate,asc") String sort
    ) {
        // parse sort param like "field,dir" (dir = asc|desc)
        Sort sortObj = Sort.by("startDate").ascending(); // default
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String prop = parts[0].trim();
            String dir = parts.length > 1 ? parts[1].trim().toLowerCase() : "asc";
            if (!prop.isEmpty()) {
                sortObj = "desc".equals(dir) ? Sort.by(prop).descending() : Sort.by(prop).ascending();
            }
        }

        var pageResult = eventService.listEvents(page, limit, category, status, search, startDateFrom, startDateTo, sortObj);

        PagedResponse<EventResponse> resp = new PagedResponse<>(
                pageResult.getContent(),
                pageResult.getNumber() + 1,
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.hasNext(),
                pageResult.hasPrevious()
        );

        return ResponseEntity.ok(new ApiSuccess(true, resp, null));
    }

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
