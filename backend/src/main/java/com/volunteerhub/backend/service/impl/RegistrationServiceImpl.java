package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.RegistrationCreateRequest;
import com.volunteerhub.backend.dto.RegistrationResponse;
import com.volunteerhub.backend.entity.EventEntity;
import com.volunteerhub.backend.entity.RegistrationEntity;
import com.volunteerhub.backend.repository.RegistrationRepository;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.mapper.RegistrationMapper;
import com.volunteerhub.backend.service.IAuditService;
import com.volunteerhub.backend.service.IRegistrationService;
import com.volunteerhub.backend.entity.UserEntity;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.security.CustomUserDetails;
import com.volunteerhub.backend.service.INotificationService;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegistrationServiceImpl implements IRegistrationService {

    private final RegistrationRepository regRepo;
    private final EventRepository eventRepo;
    private final UserRepository userRepo;
    private final RegistrationMapper mapper;
    private final INotificationService notificationService;
    private final IAuditService auditService;

    public RegistrationServiceImpl(RegistrationRepository regRepo,
                                   EventRepository eventRepo,
                                   UserRepository userRepo,
                                   RegistrationMapper mapper,
                                   INotificationService notificationService,
                                   IAuditService auditService) {
        this.regRepo = regRepo;
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
        this.mapper = mapper;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    private UserEntity currentUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new IllegalArgumentException("Authentication required");
        }
        CustomUserDetails cud = (CustomUserDetails) auth.getPrincipal();
        return userRepo.findById(cud.getUserEntity().getId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    @Transactional
    public RegistrationResponse register(Long eventId, RegistrationCreateRequest req, Authentication auth) {
        UserEntity volunteer = currentUser(auth);
        EventEntity event = eventRepo.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));

        // Check event status
        if (event.getStatus() == null || !"approved".equalsIgnoreCase(event.getStatus().name()) && !"pending".equalsIgnoreCase(event.getStatus().name())) {
            // allow register when pending as per business? We'll allow pending (organizer will review)
            // but block if cancelled or completed
            if ("cancelled".equalsIgnoreCase(event.getStatus().name()) || "completed".equalsIgnoreCase(event.getStatus().name())) {
                throw new IllegalArgumentException("Cannot register for this event");
            }
        }

        // prevent duplicate
        var existing = regRepo.findByEventAndVolunteer(event, volunteer);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Already registered for this event");
        }

        RegistrationEntity r = mapper.toEntity(req);
        r.setEvent(event);
        r.setVolunteer(volunteer);
        r.setStatus(RegistrationEntity.RegistrationStatus.pending);
        r.setRegisteredAt(LocalDateTime.now());

        RegistrationEntity saved = regRepo.save(r);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RegistrationResponse cancel(Long eventId, Long registrationId, Authentication auth) {
        UserEntity user = currentUser(auth);
        RegistrationEntity reg = regRepo.findById(registrationId).orElseThrow(() -> new IllegalArgumentException("Registration not found"));

        if (!reg.getVolunteer().getId().equals(user.getId())) {
            throw new SecurityException("Not allowed to cancel this registration");
        }

        EventEntity event = reg.getEvent();
        // only before event start
        if (event.getStartDate() != null && LocalDateTime.now().isAfter(event.getStartDate())) {
            throw new IllegalArgumentException("Cannot cancel after event start");
        }

        // if previously approved, decrement currentVolunteers
        if (reg.getStatus() == RegistrationEntity.RegistrationStatus.approved) {
            int cur = event.getCurrentVolunteers() != null ? event.getCurrentVolunteers() : 0;
            event.setCurrentVolunteers(Math.max(0, cur - 1));
            eventRepo.save(event);
        }

        reg.setStatus(RegistrationEntity.RegistrationStatus.cancelled);
        reg.setCancelledAt(LocalDateTime.now());
        RegistrationEntity saved = regRepo.save(reg);
        return mapper.toResponse(saved);
    }

    @Override
    public List<RegistrationResponse> listForEvent(Long eventId, Authentication auth) {
        // caller must be organizer or admin; check in controller (or add check here)
        EventEntity event = eventRepo.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));
        return regRepo.findByEvent(event).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponse> listForVolunteer(Authentication auth) {
        UserEntity user = currentUser(auth);
        return regRepo.findByVolunteer(user).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RegistrationResponse approve(Long eventId, Long registrationId, Authentication auth) {
        // only organizer of event or admin allowed (controller enforces)
        RegistrationEntity reg = regRepo.findById(registrationId).orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        EventEntity event = reg.getEvent();
        // Check capacity
        Integer max = event.getMaxVolunteers();
        int current = event.getCurrentVolunteers() != null ? event.getCurrentVolunteers() : 0;
        if (max != null && current >= max) {
            throw new IllegalArgumentException("Event is full");
        }

        reg.setStatus(RegistrationEntity.RegistrationStatus.approved);
        reg.setApprovedAt(LocalDateTime.now());
        RegistrationEntity saved = regRepo.save(reg);

        // update event current volunteers
        event.setCurrentVolunteers(current + 1);
        eventRepo.save(event);

        // create in-app notification for volunteer
        try {
            String title = "Đăng ký được duyệt";
            String message = "Đăng ký của bạn cho sự kiện \"" + event.getName() + "\" đã được duyệt.";
            String payload = null; // you can include JSON payload if needed (e.g. eventId)
            String link = "/events/" + event.getId();
            notificationService.createNotification(reg.getVolunteer().getId(), "registration_approved", title, message, payload, link);
            auditService.log(null, "registration:approve", java.util.Map.of(
                    "eventId", event.getId(),
                    "registrationId", reg.getId(),
                    "volunteerId", reg.getVolunteer().getId()
            ));
        } catch (Exception ex) {
            // log and ignore
        }

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RegistrationResponse reject(Long eventId, Long registrationId, Authentication auth) {
        RegistrationEntity reg = regRepo.findById(registrationId).orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        reg.setStatus(RegistrationEntity.RegistrationStatus.rejected);
        reg.setApprovedAt(LocalDateTime.now()); // set as processed
        RegistrationEntity saved = regRepo.save(reg);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RegistrationResponse markCompleted(Long eventId, Long registrationId, boolean present, String completionNote, Authentication auth) {
        RegistrationEntity reg = regRepo.findById(registrationId).orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        reg.setStatus(RegistrationEntity.RegistrationStatus.completed);
        reg.setCompletedAt(LocalDateTime.now());
        reg.setAttendanceStatus(present ? RegistrationEntity.AttendanceStatus.present : RegistrationEntity.AttendanceStatus.absent);
        reg.setCompletionNote(completionNote);
        RegistrationEntity saved = regRepo.save(reg);
        return mapper.toResponse(saved);
    }
}
