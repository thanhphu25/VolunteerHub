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

/**
 * Controller for managing volunteer events.
 * Provides endpoints for creating, searching, updating, and managing the lifecycle of events.
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);
    private final IEventService svc;

    /**
     * Constructs the EventController with the event service.
     * @param svc Service handling business logic for events.
     */
    public EventController(IEventService svc) {
        this.svc = svc;
    }

    /**
     * Parses various date-time string formats into a LocalDateTime object.
     * Supports ISO Zoned, Local, and Date-only formats.
     * @param dateStr The date-time string to parse.
     * @param isEndDate If true and only a date is provided, sets time to the end of the day.
     * @return Parsed LocalDateTime or null if input is blank.
     * @throws DateTimeParseException if the format is not recognized.
     */
    private LocalDateTime parseFlexibleDateTime(String dateStr, boolean isEndDate) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            return java.time.ZonedDateTime.parse(dateStr).toLocalDateTime();
        } catch (DateTimeParseException e0) {
            try {
                return LocalDateTime.parse(dateStr);
            } catch (DateTimeParseException e1) {
                try {
                    LocalDate date = LocalDate.parse(dateStr);
                    return isEndDate ? date.atTime(LocalTime.MAX) : date.atStartOfDay();
                } catch (DateTimeParseException e2) {
                    throw new DateTimeParseException(
                            "Date string must be in ISO-8601 format (e.g., '2025-11-18T10:30:00.000Z', '2025-11-18T10:30:00' or '2025-11-18')",
                            dateStr, 0, e2);
                }
            }
        }
    }

    /**
     * Creates a new event. Accessible by Organizers and Admins.
     * @param req The event creation details.
     * @param auth Current authentication context.
     * @return Created event details or error status.
     */
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

    /**
     * Lists events with comprehensive filtering and sorting options.
     * @param status Filter by event status (e.g., APPROVED, PENDING).
     * @param category Filter by event category.
     * @param location Filter by event location.
     * @param search Search keyword for title or description.
     * @param organizerName Filter by the name of the organizer.
     * @param startDate Filter events starting after this date.
     * @param endDate Filter events starting before this date.
     * @param timeStatus Filter by time relevance (e.g., UPCOMING, PAST).
     * @param page Page index (default 0).
     * @param size Page size (default 10).
     * @param sort Sort criteria (e.g., "popularity", "recent_activity", or "field,dir").
     * @return A paginated list of event responses.
     */
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
            boolean hasAdvancedFilters = category.isPresent() || location.isPresent() ||
                    search.isPresent() || organizerName.isPresent() ||
                    startDate.isPresent() || endDate.isPresent() ||
                    (sort != null && ("popularity".equalsIgnoreCase(sort) || "recent_activity".equalsIgnoreCase(sort)));

            Sort sortObj = Sort.unsorted();
            if (sort != null && !sort.isEmpty()) {
                if ("popularity".equalsIgnoreCase(sort)) {
                    sortObj = Sort.by("popularity");
                } else if ("recent_activity".equalsIgnoreCase(sort)) {
                    sortObj = Sort.by("recent_activity");
                } else {
                    String[] parts = sort.split(",");
                    String prop = parts[0];
                    if (!prop.isEmpty()) {
                        String dir = parts.length > 1 ? parts[1] : "asc";
                        sortObj = Sort.by(org.springframework.data.domain.Sort.Direction.fromString(dir), prop);
                    }
                }
            }

            PageRequest pageRequest = PageRequest.of(page, size, sortObj);

            if (hasAdvancedFilters) {
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
                Page<EventResponse> p = svc.listEvents(status, timeStatus, pageRequest);
                return ResponseEntity.ok(p);
            }
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Invalid filter parameters: " + ex.getMessage()));
        }
    }

    /**
     * Retrieves a list of trending events.
     * @param limit Number of events to retrieve (default 5).
     * @return List of trending event responses.
     */
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

    /**
     * Retrieves detailed information about a specific event.
     * @param id The ID of the event.
     * @return Event details or 404 if not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        try {
            EventResponse resp = svc.getEvent(id);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Updates an existing event. Checks for permissions before updating.
     * @param id The ID of the event to update.
     * @param req The updated event details.
     * @param auth Current authentication context.
     * @return Updated event details.
     */
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

    /**
     * Approves a pending event. Admin role required.
     * @param id ID of the event to approve.
     * @param auth Current authentication context.
     * @return Approved event details.
     */
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

    /**
     * Rejects a pending event with a reason. Admin role required.
     * @param id ID of the event to reject.
     * @param request Contains the rejection reason.
     * @param auth Current authentication context.
     * @return Rejected event details.
     */
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

    /**
     * Cancels an event. Can be performed by the organizer or an admin.
     * @param id ID of the event to cancel.
     * @param auth Current authentication context.
     * @return Cancelled event details.
     */
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

    /**
     * Deletes an event from the system.
     * @param id ID of the event to delete.
     * @param auth Current authentication context.
     * @return 204 No Content on success.
     */
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

    /**
     * Retrieves events created/managed by the currently authenticated organizer.
     * @param status Optional status filter.
     * @param category Optional category filter.
     * @param location Optional location filter.
     * @param search Optional keyword search.
     * @param startDate Optional start date filter.
     * @param endDate Optional end date filter.
     * @param page Page index.
     * @param size Page size.
     * @param auth Current authentication context.
     * @return Paginated list of events belonging to the organizer.
     */
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