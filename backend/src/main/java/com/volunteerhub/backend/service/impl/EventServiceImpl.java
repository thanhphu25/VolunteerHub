package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.EventStatus;
import com.volunteerhub.backend.entity.Role;
import com.volunteerhub.backend.mapper.EventMapper;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.service.IEventService;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.CustomUserDetails;
import com.volunteerhub.backend.service.INotificationService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.data.domain.PageRequest;
import java.util.stream.Collectors;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class EventServiceImpl implements IEventService {

    private final EventRepository repo;
    private final UserRepository userRepository;
    private final EventMapper mapper;
    private final INotificationService notificationService;

    public EventServiceImpl(EventRepository repo,
                            UserRepository userRepository,
                            EventMapper mapper,
                            INotificationService notificationService) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.notificationService = notificationService;
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

        if (saved.getStatus() == EventStatus.pending) {
            notifyAdminsOfPendingEvent(saved);
        }
        return mapper.toResponse(saved);
    }

    @Override
    public Page<EventResponse> listEvents(Optional<String> statusOpt, Optional<String> timeStatusOpt, Pageable pageable) {
        EventStatus status = null;
        if (statusOpt.isPresent()) {
            try {
                status = EventStatus.valueOf(statusOpt.get());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid status");
            }
        }

        String timeStatus = normalizeTimeStatus(timeStatusOpt);

        if (timeStatus == null) {
            if (status != null) {
                return repo.findByStatusAndIsDeletedFalse(status, pageable).map(mapper::toResponse);
            }
            return repo.findByIsDeletedFalse(pageable).map(mapper::toResponse);
        }

        LocalDateTime now = LocalDateTime.now();
        return repo.findEventsWithFilters(
                status,
                null,
                null,
                null,
                null,
                null,
                null,
                timeStatus,
                now,
                pageable
        ).map(mapper::toResponse);
    }

    @Override
    public Page<EventResponse> listEventsWithFilters(Optional<String> statusOpt, Optional<String> category,
                                                    Optional<String> location, Optional<String> search,
                                                    Optional<LocalDateTime> startDate, Optional<LocalDateTime> endDate,
                                                    Optional<String> organizerNameOpt,
                                                    Optional<String> timeStatusOpt,
                                                    Pageable pageable) {
        EventStatus status = null;
        if (statusOpt.isPresent()) {
            try {
                status = EventStatus.valueOf(statusOpt.get());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid status");
            }
        }

        String timeStatus = normalizeTimeStatus(timeStatusOpt);
        LocalDateTime now = LocalDateTime.now();

        return repo.findEventsWithFilters(
            status,
            category.orElse(null),
            location.orElse(null),
            organizerNameOpt.map(String::trim).filter(StringUtils::hasText).orElse(null),
            search.orElse(null),
            startDate.orElse(null),
            endDate.orElse(null),
            timeStatus,
            now,
            pageable
        ).map(mapper::toResponse);
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

        notifyOrganizerOfApproval(saved);

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse rejectEvent(Long id, String reason, Authentication auth) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (e.getIsDeleted()) {
            throw new IllegalArgumentException("Event not found");
        }
        if (e.getStatus() != EventStatus.pending) {
            throw new IllegalArgumentException("Only pending events can be rejected");
        }
        e.setStatus(EventStatus.rejected);
        e.setApprovedAt(null);
        e.setApprovedBy(null);
        EventEntity saved = repo.save(e);

        notifyOrganizerOfRejection(saved, reason);

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

    @Override
    public List<EventResponse> getTrendingEvents(int limit) {
        // Gọi Repository lấy danh sách top trending
        // PageRequest.of(0, limit) nghĩa là lấy trang đầu tiên với số lượng 'limit' phần tử
        return repo.findTrendingEvents(PageRequest.of(0, limit))
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    private UserEntity currentUserEntity(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new IllegalArgumentException("Authentication required");
        }
        CustomUserDetails cud = (CustomUserDetails) auth.getPrincipal();
        Long userId = cud.getUserEntity().getId();
        return userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private String normalizeTimeStatus(Optional<String> timeStatusOpt) {
        if (timeStatusOpt.isEmpty() || !StringUtils.hasText(timeStatusOpt.get())) {
            return null;
        }
        String value = timeStatusOpt.get().trim().toLowerCase(Locale.ENGLISH);
        if (!value.equals("ended") && !value.equals("ongoing") && !value.equals("upcoming")) {
            throw new IllegalArgumentException("Invalid timeStatus value");
        }
        return value;
    }

    private void notifyAdminsOfPendingEvent(EventEntity event) {
        try {
            List<UserEntity> admins = userRepository.findByRole(Role.admin);
            if (admins.isEmpty()) {
                return;
            }
            String title = "Sự kiện chờ duyệt";
            String message = "Sự kiện \"" + event.getName() + "\" đang chờ duyệt.";
            String link = "/events/" + event.getId();
            String payload = buildEventPayload(event.getId(), null);
            for (UserEntity admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        "admin:event_pending",
                        title,
                        message,
                        payload,
                        link
                );
            }
        } catch (Exception ignored) {
        }
    }

    private void notifyOrganizerOfRejection(EventEntity event, String reason) {
        try {
            UserEntity organizer = event.getOrganizer();
            if (organizer == null) return;
            String message = "Sự kiện \"" + event.getName() + "\" đã bị từ chối: " + (reason != null ? reason : "");
            String payload = buildEventPayload(event.getId(), reason);

            notificationService.createNotification(
                    organizer.getId(),
                    "organizer:event_rejected",
                    "Sự kiện bị từ chối",
                    message,
                    payload,
                    "/events/" + event.getId()
            );
        } catch (Exception ignored) {}
    }

    private void notifyOrganizerOfApproval(EventEntity event) {
        try {
            UserEntity organizer = event.getOrganizer();
            if (organizer == null) return;
            String payload = buildEventPayload(event.getId(), null);
            notificationService.createNotification(
                    organizer.getId(),
                    "organizer:event_approved",
                    "Sự kiện đã được duyệt",
                    "Sự kiện \"" + event.getName() + "\" đã được duyệt.",
                    payload,
                    "/events/" + event.getId()
            );
        } catch (Exception ignored) {}
    }

    private String buildEventPayload(Long eventId, String reason) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("eventId", eventId);
            if (reason != null) {
                map.put("reason", reason);
            }
            return mapper.writeValueAsString(map);
        } catch (Exception ignored) {
            return null;
        }
    }
}
