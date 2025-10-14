package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.dto.EventUpdateRequest;
import com.volunteerhub.backend.exception.ForbiddenException;
import com.volunteerhub.backend.exception.NotFoundException;
import com.volunteerhub.backend.model.Event;
import com.volunteerhub.backend.model.User;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.repository.EventSpecifications;
import com.volunteerhub.backend.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public Page<EventResponse> listEvents(int page, int limit, String category, String status, String search,
                                          LocalDateTime startDateFrom, LocalDateTime startDateTo, Sort sort) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, sort);
        var spec = EventSpecifications.filters(category, status, search, startDateFrom, startDateTo);
        Page<Event> p = eventRepository.findAll(spec, pageable);
        return p.map(this::toResponse);
    }

    public EventResponse getEvent(Long id) {
        Event e = eventRepository.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
        if (Boolean.TRUE.equals(e.getIsDeleted())) throw new NotFoundException("Event not found");
        return toResponse(e);
    }

    @Transactional
    public EventResponse createEvent(EventCreateRequest req, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail).orElseThrow(() -> new NotFoundException("Creator not found"));

        // optional: only organizer/admin allowed — enforce here if desired
        if (creator.getRole() == null || creator.getRole().name().equalsIgnoreCase("volunteer")) {
            throw new ForbiddenException("Only organizers or admins can create events");
        }

        Event e = new Event();
        e.setOrganizerId(creator.getId());
        e.setName(req.getName());
        e.setSlug(req.getSlug());
        e.setDescription(req.getDescription());
        e.setCategory(req.getCategory());
        e.setLocation(req.getLocation());
        e.setAddress(req.getAddress());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setMaxVolunteers(req.getMaxVolunteers());
        e.setCurrentVolunteers(0);
        e.setStatus(Event.Status.pending);
        e.setImageUrl(req.getImageUrl());
        e.setRequirements(req.getRequirements());
        e.setBenefits(req.getBenefits());
        e.setContactInfo(req.getContactInfo());

        if (!e.getStartDate().isBefore(e.getEndDate())) {
            throw new IllegalArgumentException("startDate must be before endDate");
        }

        Event saved = eventRepository.save(e);
        return toResponse(saved);
    }

    @Transactional
    public EventResponse updateEvent(Long id, EventUpdateRequest req, String currentUserEmail) {
        Event existing = eventRepository.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
        if (Boolean.TRUE.equals(existing.getIsDeleted())) throw new NotFoundException("Event not found");

        User current = userRepository.findByEmail(currentUserEmail).orElseThrow(() -> new NotFoundException("User not found"));
        // only owner or admin
        boolean isAdmin = current.getRole() != null && current.getRole().name().equalsIgnoreCase("admin");
        if (!(isAdmin || current.getId().equals(existing.getOrganizerId()))) {
            throw new ForbiddenException("You are not allowed to update this event");
        }

        existing.setName(req.getName());
        existing.setSlug(req.getSlug());
        existing.setDescription(req.getDescription());
        existing.setCategory(req.getCategory());
        existing.setLocation(req.getLocation());
        existing.setAddress(req.getAddress());
        existing.setStartDate(req.getStartDate());
        existing.setEndDate(req.getEndDate());
        existing.setMaxVolunteers(req.getMaxVolunteers());
        existing.setImageUrl(req.getImageUrl());
        existing.setRequirements(req.getRequirements());
        existing.setBenefits(req.getBenefits());
        existing.setContactInfo(req.getContactInfo());

        if (!existing.getStartDate().isBefore(existing.getEndDate())) {
            throw new IllegalArgumentException("startDate must be before endDate");
        }

        Event saved = eventRepository.save(existing);
        return toResponse(saved);
    }

    @Transactional
    public void deleteEvent(Long id, String currentUserEmail) {
        Event existing = eventRepository.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
        if (Boolean.TRUE.equals(existing.getIsDeleted())) throw new NotFoundException("Event not found");

        User current = userRepository.findByEmail(currentUserEmail).orElseThrow(() -> new NotFoundException("User not found"));
        boolean isAdmin = current.getRole() != null && current.getRole().name().equalsIgnoreCase("admin");
        if (!(isAdmin || current.getId().equals(existing.getOrganizerId()))) {
            throw new ForbiddenException("You are not allowed to delete this event");
        }

        existing.setIsDeleted(true);
        existing.setDeletedAt(LocalDateTime.now());
        eventRepository.save(existing);
    }

    private EventResponse toResponse(Event e) {
        return new EventResponse(
                e.getId(),
                e.getOrganizerId(),
                e.getName(),
                e.getSlug(),
                e.getDescription(),
                e.getCategory(),
                e.getLocation(),
                e.getAddress(),
                e.getStartDate(),
                e.getEndDate(),
                e.getMaxVolunteers(),
                e.getCurrentVolunteers(),
                e.getStatus() == null ? null : e.getStatus().name(),
                e.getImageUrl(),
                e.getRequirements(),
                e.getBenefits(),
                e.getContactInfo(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                e.getApprovedAt(),
                e.getApprovedBy()
        );
    }
}
