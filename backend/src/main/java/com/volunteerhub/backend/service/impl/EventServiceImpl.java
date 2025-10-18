package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.EventStatus;
import com.volunteerhub.backend.mapper.EventMapper;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.service.IEventService;
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
public class EventServiceImpl implements IEventService {

    private final EventRepository repo;
    private final UserRepository userRepository;
    private final EventMapper mapper;

    public EventServiceImpl(EventRepository repo, UserRepository userRepository, EventMapper mapper) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    private String toSlug(String input) {
        if (!StringUtils.hasText(input)) return null;
        String nowhitespace = Pattern.compile("\\s").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w\\-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    @Override
    @Transactional
    public EventResponse createEvent(EventCreateRequest req, Authentication auth) {
        if (req.getStartDate() != null && req.getEndDate() != null && !req.getStartDate().isBefore(req.getEndDate())) {
            throw new IllegalArgumentException("startDate must be before endDate");
        }
        UserEntity organizer = currentUserEntity(auth);
        EventEntity e = mapper.toEntity(req);
        e.setOrganizer(organizer);
        e.setSlug(toSlug(req.getName()));
        e.setStatus(EventStatus.pending);
        e.setCurrentVolunteers(0);
        e.setCreatedAt(LocalDateTime.now());
        e.setUpdatedAt(LocalDateTime.now());
        EventEntity saved = repo.save(e);
        return mapper.toResponse(saved);
    }

    @Override
    public Page<EventResponse> listEvents(Optional<String> statusOpt, Pageable pageable) {
        if (statusOpt.isPresent()) {
            EventStatus st;
            try {
                st = EventStatus.valueOf(statusOpt.get());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid status");
            }
            return repo.findByStatusAndIsDeletedFalse(st, pageable).map(mapper::toResponse);
        }
        return repo.findByIsDeletedFalse(pageable).map(mapper::toResponse);
    }

    @Override
    public EventResponse getEvent(Long id) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (e.getIsDeleted()) {
            throw new IllegalArgumentException("Event not found");
        }
        return mapper.toResponse(e);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long id, EventCreateRequest req, Authentication auth) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (e.getIsDeleted()) {
            throw new IllegalArgumentException("Event not found");
        }
        UserEntity current = currentUserEntity(auth);
        boolean isOwner = e.getOrganizer() != null && e.getOrganizer().getId().equals(current.getId());
        boolean isAdmin = current.getRole() != null && "admin".equalsIgnoreCase(current.getRole().name());
        if (!isOwner && !isAdmin) throw new SecurityException("Not allowed to update this event");
        if (e.getStatus() == EventStatus.completed) {
            throw new IllegalArgumentException("Cannot update completed events");
        }
        if (req.getStartDate() != null && req.getEndDate() != null && !req.getStartDate().isBefore(req.getEndDate())) {
            throw new IllegalArgumentException("startDate must be before endDate");
        }
        // map fields from req to entity (mapper method)
        mapper.updateEntityFromDto(req, e);
        e.setSlug(toSlug(req.getName()));
        e.setUpdatedAt(LocalDateTime.now());
        EventEntity saved = repo.save(e);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse approveEvent(Long id, Authentication auth) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (e.getIsDeleted()) {
            throw new IllegalArgumentException("Event not found");
        }
        if (e.getStatus() == EventStatus.approved) {
            throw new IllegalArgumentException("Event is already approved");
        }
        UserEntity admin = currentUserEntity(auth);
        e.setStatus(EventStatus.approved);
        e.setApprovedAt(LocalDateTime.now());
        e.setApprovedBy(admin);
        EventEntity saved = repo.save(e);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse rejectEvent(Long id, Authentication auth) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (e.getIsDeleted()) {
            throw new IllegalArgumentException("Event not found");
        }
        if (e.getStatus() != EventStatus.pending) {
            throw new IllegalArgumentException("Only pending events can be rejected");
        }
        e.setStatus(EventStatus.rejected);
        EventEntity saved = repo.save(e);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse cancelEvent(Long id, Authentication auth) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (e.getIsDeleted()) {
            throw new IllegalArgumentException("Event not found");
        }
        UserEntity current = currentUserEntity(auth);
        boolean isOwner = e.getOrganizer() != null && e.getOrganizer().getId().equals(current.getId());
        boolean isAdmin = current.getRole() != null && "admin".equalsIgnoreCase(current.getRole().name());
        if (!isOwner && !isAdmin) {
            throw new SecurityException("Not allowed to cancel this event");
        }
        if (e.getStatus() == EventStatus.completed) {
            throw new IllegalArgumentException("Cannot cancel completed events");
        }
        e.setStatus(EventStatus.cancelled);
        EventEntity saved = repo.save(e);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id, Authentication auth) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (e.getIsDeleted()) {
            throw new IllegalArgumentException("Event not found");
        }
        UserEntity current = currentUserEntity(auth);
        boolean isOwner = e.getOrganizer() != null && e.getOrganizer().getId().equals(current.getId());
        boolean isAdmin = current.getRole() != null && "admin".equalsIgnoreCase(current.getRole().name());
        if (!isOwner && !isAdmin) {
            throw new SecurityException("Not allowed to delete this event");
        }
        if (e.getStatus() == EventStatus.completed) {
            throw new IllegalArgumentException("Cannot delete completed events");
        }
        e.setIsDeleted(true);
        e.setDeletedAt(LocalDateTime.now());
        repo.save(e);
    }

    @Override
    public Page<EventResponse> listOrganizerEvents(Long organizerId, Pageable pageable) {
        return repo.findByOrganizerIdAndIsDeletedFalse(organizerId, pageable).map(mapper::toResponse);
    }

    private UserEntity currentUserEntity(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new IllegalArgumentException("Authentication required");
        }
        CustomUserDetails cud = (CustomUserDetails) auth.getPrincipal();
        Long userId = cud.getUserEntity().getId();
        return userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
