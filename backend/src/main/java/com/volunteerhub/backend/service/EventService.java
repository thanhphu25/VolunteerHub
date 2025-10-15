package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.EventStatus;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class EventService {

    private final EventRepository repo;
    private final UserRepository userRepository;

    public EventService(EventRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    private String toSlug(String input) {
        if (!StringUtils.hasText(input)) return null;
        String nowhitespace = Pattern.compile("\\s").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w\\-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    public EventResponse toResponse(EventEntity e) {
        Long organizerId = e.getOrganizer() != null ? e.getOrganizer().getId() : null;
        String organizerName = e.getOrganizer() != null ? e.getOrganizer().getFullName() : null;
        Long approvedBy = e.getApprovedBy() != null ? e.getApprovedBy().getId() : null;
        return new EventResponse(
                e.getId(),
                organizerId,
                organizerName,
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
                e.getStatus() != null ? e.getStatus().name() : null,
                e.getImageUrl(),
                e.getRequirements(),
                e.getBenefits(),
                e.getContactInfo(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                e.getApprovedAt(),
                approvedBy
        );
    }

    @Transactional
    public EventResponse createEvent(EventCreateRequest req, Authentication auth) {
        // validate dates
        if (req.getStartDate() != null && req.getEndDate() != null && !req.getStartDate().isBefore(req.getEndDate())) {
            throw new IllegalArgumentException("startDate must be before endDate");
        }

        UserEntity organizer = currentUserEntity(auth);

        EventEntity e = new EventEntity();
        e.setOrganizer(organizer);
        e.setName(req.getName());
        e.setSlug(toSlug(req.getName()));
        e.setDescription(req.getDescription());
        e.setCategory(req.getCategory());
        e.setLocation(req.getLocation());
        e.setAddress(req.getAddress());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setMaxVolunteers(req.getMaxVolunteers());
        e.setImageUrl(req.getImageUrl());
        e.setRequirements(req.getRequirements());
        e.setBenefits(req.getBenefits());
        e.setContactInfo(req.getContactInfo());
        e.setStatus(EventStatus.pending);

        EventEntity saved = repo.save(e);
        return toResponse(saved);
    }

    public Page<EventResponse> listEvents(Optional<String> statusOpt, Pageable pageable) {
        if (statusOpt.isPresent()) {
            EventStatus st;
            try {
                st = EventStatus.valueOf(statusOpt.get());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid status");
            }
            return repo.findByStatus(st, pageable).map(this::toResponse);
        }
        return repo.findAll(pageable).map(this::toResponse);
    }

    public EventResponse getEvent(Long id) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        return toResponse(e);
    }

    @Transactional
    public EventResponse updateEvent(Long id, EventCreateRequest req, Authentication auth) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));

        // Only organizer owner or admin allowed (controller pre-authorize ensures auth; double-check)
        UserEntity current = currentUserEntity(auth);
        boolean isOwner = e.getOrganizer() != null && e.getOrganizer().getId().equals(current.getId());
        boolean isAdmin = current.getRole() != null && "admin".equalsIgnoreCase(current.getRole().name());

        if (!isOwner && !isAdmin) throw new SecurityException("Not allowed to update this event");

        if (req.getStartDate() != null && req.getEndDate() != null && !req.getStartDate().isBefore(req.getEndDate())) {
            throw new IllegalArgumentException("startDate must be before endDate");
        }

        e.setName(req.getName());
        e.setSlug(toSlug(req.getName()));
        e.setDescription(req.getDescription());
        e.setCategory(req.getCategory());
        e.setLocation(req.getLocation());
        e.setAddress(req.getAddress());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setMaxVolunteers(req.getMaxVolunteers());
        e.setImageUrl(req.getImageUrl());
        e.setRequirements(req.getRequirements());
        e.setBenefits(req.getBenefits());
        e.setContactInfo(req.getContactInfo());

        EventEntity saved = repo.save(e);
        return toResponse(saved);
    }

    @Transactional
    public EventResponse approveEvent(Long id, Authentication auth) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        UserEntity admin = currentUserEntity(auth);
        // Only admin should call (controller ensures role)
        e.setStatus(EventStatus.approved);
        e.setApprovedAt(LocalDateTime.now());
        e.setApprovedBy(admin);
        EventEntity saved = repo.save(e);
        return toResponse(saved);
    }

    private UserEntity currentUserEntity(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof com.volunteerhub.backend.security.CustomUserDetails)) {
            throw new IllegalArgumentException("Authentication required");
        }
        com.volunteerhub.backend.security.CustomUserDetails cud = (com.volunteerhub.backend.security.CustomUserDetails) auth.getPrincipal();
        Long userId = cud.getUserEntity().getId();
        return userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
