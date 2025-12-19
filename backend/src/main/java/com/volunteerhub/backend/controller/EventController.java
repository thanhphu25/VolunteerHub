package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventRejectRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.service.IEventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);
    private final IEventService svc;

    public EventController(IEventService svc) {
        this.svc = svc;
    }

    /**
     * Parse a date string that may be either a full datetime (ISO-8601) or
     * date-only.
     * For date-only strings, converts to start of day for startDate or end of day
     * for endDate.
     * * @param dateStr The date string to parse
     * 
     * @param isEndDate If true, date-only strings are converted to end of day; if
     *                  false, start of day
     * @return Parsed LocalDateTime
     * @throws DateTimeParseException if the string cannot be parsed as either
     *                                format
     */
    private LocalDateTime parseFlexibleDateTime(String dateStr, boolean isEndDate) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            // Try parsing as ZonedDateTime (ISO-8601 with timezone, e.g.,
            // 2023-10-27T10:00:00.000Z)
            return java.time.ZonedDateTime.parse(dateStr).toLocalDateTime();
        } catch (DateTimeParseException e0) {
            try {
                // Try parsing as full LocalDateTime (ISO-8601 without timezone)
                return LocalDateTime.parse(dateStr);
            } catch (DateTimeParseException e1) {
                try {
                    // If that fails, try parsing as LocalDate (date-only)
                    LocalDate date = LocalDate.parse(dateStr);
                    // Convert to LocalDateTime: start of day for startDate, end of day for endDate
                    return isEndDate ? date.atTime(LocalTime.MAX) : date.atStartOfDay();
                } catch (DateTimeParseException e2) {
                    // If all fail, throw with a helpful message
                    throw new DateTimeParseException(
                            "Date string must be in ISO-8601 format (e.g., '2025-11-18T10:30:00.000Z', '2025-11-18T10:30:00' or '2025-11-18')",
                            dateStr, 0, e2);
                }
            }
        }
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
            @RequestParam Optional<String> category,
            @RequestParam Optional<String> location,
            @RequestParam Optional<String> search,
            @RequestParam Optional<String> organizerName,
            @RequestParam Optional<String> startDate,
            @RequestParam Optional<String> endDate,
            @RequestParam Optional<String> timeStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        try {
            // Check if any advanced filters are provided
            boolean hasAdvancedFilters = category.isPresent() || location.isPresent() ||
                    search.isPresent() || organizerName.isPresent() ||
                    startDate.isPresent() || endDate.isPresent() ||
                    (sort != null && "popularity".equalsIgnoreCase(sort));

            Sort sortObj = Sort.unsorted();
            if (sort != null && !sort.isEmpty()) {
                if ("popularity".equalsIgnoreCase(sort)) {
                    sortObj = Sort.by("popularity");
                } else {
                    String[] parts = sort.split(",");
                    String prop = parts[0];
                    if (!prop.isEmpty()) {
                        String dir = parts.length > 1 ? parts[1] : "asc";
                        sortObj = Sort.by(org.springframework.data.domain.Sort.Direction.fromString(dir), prop);
                    }
                }
            } else {
                // Default if no sort provided? Frontend usually sends createdAt,desc.
                // If not, we fall back to defaults or unsorted.
            }

            PageRequest pageRequest = PageRequest.of(page, size, sortObj);

            if (hasAdvancedFilters) {
                // Use advanced filtering
                LocalDateTime startDateTime = null;
                LocalDateTime endDateTime = null;

                if (startDate.isPresent()) {
                    startDateTime = parseFlexibleDateTime(startDate.get(), false);
                }
                if (endDate.isPresent()) {
                    endDateTime = parseFlexibleDateTime(endDate.get(), true);
                }

                Page<EventResponse> p = svc.listEventsWithFilters(
                        status, category, location, search,
                        Optional.ofNullable(startDateTime), Optional.ofNullable(endDateTime),
                        organizerName,
                        timeStatus,
                        pageRequest);
                return ResponseEntity.ok(p);
            } else {
                // Use simple filtering (backward compatibility)
                Page<EventResponse> p = svc.listEvents(status, timeStatus, pageRequest);
                return ResponseEntity.ok(p);
            }
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Invalid filter parameters: " + ex.getMessage()));
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingEvents(@RequestParam(defaultValue = "5") int limit) {
        try {
            List<EventResponse> trendingEvents = svc.getTrendingEvents(limit);
            return ResponseEntity.ok(trendingEvents);
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Unable to fetch trending events: " + ex.getMessage()));
        }
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
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @Valid @RequestBody EventCreateRequest req,
            Authentication auth) {
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

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectEvent(@PathVariable Long id,
            @Valid @RequestBody EventRejectRequest request,
            Authentication auth) {
        try {
            EventResponse resp = svc.rejectEvent(id, request.getReason(), auth);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to reject event"));
        }
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelEvent(@PathVariable Long id, Authentication auth) {
        try {
            EventResponse resp = svc.cancelEvent(id, auth);
            return ResponseEntity.ok(resp);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to cancel event"));
        }
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, Authentication auth) {
        try {
            svc.deleteEvent(id, auth);
            return ResponseEntity.noContent().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Unable to delete event"));
        }
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @GetMapping("/my-events")
    public ResponseEntity<?> getMyEvents(
            @RequestParam Optional<String> status,
            @RequestParam Optional<String> category,
            @RequestParam Optional<String> location,
            @RequestParam Optional<String> search,
            @RequestParam Optional<String> startDate,
            @RequestParam Optional<String> endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        Long organizerId = null;
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Authentication required"));
            }
            if (!(auth.getPrincipal() instanceof com.volunteerhub.backend.security.CustomUserDetails)) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid authentication"));
            }
            com.volunteerhub.backend.security.CustomUserDetails userDetails = (com.volunteerhub.backend.security.CustomUserDetails) auth
                    .getPrincipal();
            organizerId = userDetails.getUserEntity().getId();

            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;

            if (startDate.isPresent()) {
                startDateTime = parseFlexibleDateTime(startDate.get(), false);
            }
            if (endDate.isPresent()) {
                endDateTime = parseFlexibleDateTime(endDate.get(), true);
            }

            Page<EventResponse> p = svc.listOrganizerEvents(
                    organizerId,
                    status,
                    category,
                    location,
                    search,
                    Optional.ofNullable(startDateTime),
                    Optional.ofNullable(endDateTime),
                    PageRequest.of(page, size));
            return ResponseEntity.ok(p);
        } catch (Exception ex) {
            logger.error("Error fetching organizer events for organizerId: {}", organizerId, ex);
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Unable to fetch events: " + ex.getMessage()));
        }
    }
}