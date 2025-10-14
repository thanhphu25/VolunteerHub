package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.*;
import com.volunteerhub.backend.exception.ForbiddenException;
import com.volunteerhub.backend.exception.NotFoundException;
import com.volunteerhub.backend.model.Event;
import com.volunteerhub.backend.model.Registration;
import com.volunteerhub.backend.model.User;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.repository.RegistrationRepository;
import com.volunteerhub.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RegistrationService(RegistrationRepository registrationRepository,
                               EventRepository eventRepository,
                               UserRepository userRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    // Volunteer registers for event
    @Transactional
    public RegistrationResponse registerForEvent(RegistrationRequest req, String volunteerEmail) {
        User volunteer = userRepository.findByEmail(volunteerEmail).orElseThrow(() -> new NotFoundException("Volunteer not found"));
        Event event = eventRepository.findById(req.getEventId()).orElseThrow(() -> new NotFoundException("Event not found"));
        if (Boolean.TRUE.equals(event.getIsDeleted()) || event.getStatus() != Event.Status.approved) {
            throw new ForbiddenException("Cannot register for this event");
        }

        // check duplicate
        if (registrationRepository.findByEventIdAndVolunteerId(event.getId(), volunteer.getId()).isPresent()) {
            throw new DataIntegrityViolationException("Already registered");
        }

        Registration r = Registration.builder()
                .eventId(event.getId())
                .volunteerId(volunteer.getId())
                .status(Registration.Status.pending)
                .note(req.getNote())
                .build();

        try {
            Registration saved = registrationRepository.save(r);
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            // may happen due to race on unique constraint
            throw new DataIntegrityViolationException("Registration already exists");
        }
    }

    // Volunteer cancels registration (if pending or approved and before event start)
    @Transactional
    public void cancelRegistration(Long registrationId, String volunteerEmail) {
        Registration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new NotFoundException("Registration not found"));
        User volunteer = userRepository.findByEmail(volunteerEmail).orElseThrow(() -> new NotFoundException("Volunteer not found"));

        if (!reg.getVolunteerId().equals(volunteer.getId())) {
            throw new ForbiddenException("You are not owner of this registration");
        }

        // can cancel if not completed and before event start
        Event event = eventRepository.findById(reg.getEventId()).orElseThrow(() -> new NotFoundException("Event not found"));
        if (event.getStartDate().isBefore(LocalDateTime.now())) {
            throw new ForbiddenException("Cannot cancel after event start");
        }

        // If registration was approved, decrement current_volunteers
        if (reg.getStatus() == Registration.Status.approved) {
            // lock event row and decrement
            Event eLocked = eventRepository.findByIdForUpdate(event.getId()).orElseThrow();
            int curr = eLocked.getCurrentVolunteers() == null ? 0 : eLocked.getCurrentVolunteers();
            eLocked.setCurrentVolunteers(Math.max(0, curr - 1));
            eventRepository.save(eLocked);
        }

        reg.setStatus(Registration.Status.cancelled);
        reg.setCancelledAt(LocalDateTime.now());
        registrationRepository.save(reg);
    }

    // Volunteer: list own registrations
    public PagedResponse<RegistrationResponse> myRegistrations(String volunteerEmail, int page, int limit, String status) {
        User volunteer = userRepository.findByEmail(volunteerEmail).orElseThrow(() -> new NotFoundException("Volunteer not found"));
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by("registeredAt").descending());
        Page<Registration> p = registrationRepository.findByVolunteerId(volunteer.getId(), pageable);
        // optional filter by status
        var filtered = p.getContent().stream()
                .filter(r -> status == null || status.isBlank() || r.getStatus().name().equalsIgnoreCase(status))
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new PagedResponse<>(filtered, page, limit, p.getTotalElements(), p.getTotalPages(), p.hasNext(), p.hasPrevious());
    }

    // Organizer approves registration (transactional) — increments event.current_volunteers safely
    @Transactional
    public RegistrationResponse approveRegistration(Long registrationId, String organizerEmail, String organizerNote) {
        Registration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new NotFoundException("Registration not found"));
        if (reg.getStatus() != Registration.Status.pending) {
            throw new ForbiddenException("Only pending registrations can be approved");
        }

        Event event = eventRepository.findByIdForUpdate(reg.getEventId()).orElseThrow(() -> new NotFoundException("Event not found"));

        // permission: organizer must be owner of event or admin
        User organizer = userRepository.findByEmail(organizerEmail).orElseThrow(() -> new NotFoundException("Organizer not found"));
        if (!(organizer.getRole() == User.Role.admin || organizer.getId().equals(event.getOrganizerId()))) {
            throw new ForbiddenException("You are not allowed to approve for this event");
        }

        // check capacity
        Integer max = event.getMaxVolunteers();
        int curr = event.getCurrentVolunteers() == null ? 0 : event.getCurrentVolunteers();
        if (max != null && curr >= max) {
            throw new ForbiddenException("Event is full");
        }

        // approve
        reg.setStatus(Registration.Status.approved);
        reg.setApprovedAt(LocalDateTime.now());
        reg.setOrganizerNote(organizerNote);
        registrationRepository.save(reg);

        // increment event counter
        event.setCurrentVolunteers(curr + 1);
        eventRepository.save(event);

        return toResponse(reg);
    }

    @Transactional
    public RegistrationResponse rejectRegistration(Long registrationId, String organizerEmail, String organizerNote) {
        Registration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new NotFoundException("Registration not found"));
        if (reg.getStatus() != Registration.Status.pending) {
            throw new ForbiddenException("Only pending registrations can be rejected");
        }

        Event event = eventRepository.findById(reg.getEventId()).orElseThrow(() -> new NotFoundException("Event not found"));
        User organizer = userRepository.findByEmail(organizerEmail).orElseThrow(() -> new NotFoundException("Organizer not found"));
        if (!(organizer.getRole() == User.Role.admin || organizer.getId().equals(event.getOrganizerId()))) {
            throw new ForbiddenException("You are not allowed to reject for this event");
        }

        reg.setStatus(Registration.Status.rejected);
        reg.setOrganizerNote(organizerNote);
        registrationRepository.save(reg);
        return toResponse(reg);
    }

    @Transactional
    public RegistrationResponse completeRegistration(Long registrationId, String organizerEmail, CompleteRequest req) {
        Registration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new NotFoundException("Registration not found"));
        if (reg.getStatus() != Registration.Status.approved) {
            throw new ForbiddenException("Only approved registrations can be completed");
        }

        Event event = eventRepository.findById(reg.getEventId()).orElseThrow(() -> new NotFoundException("Event not found"));
        User organizer = userRepository.findByEmail(organizerEmail).orElseThrow(() -> new NotFoundException("Organizer not found"));
        if (!(organizer.getRole() == User.Role.admin || organizer.getId().equals(event.getOrganizerId()))) {
            throw new ForbiddenException("You are not allowed to complete this registration");
        }

        // set attendance and completion
        if (req.getAttendanceStatus() != null) {
            try {
                Registration.AttendanceStatus as = Registration.AttendanceStatus.valueOf(req.getAttendanceStatus());
                reg.setAttendanceStatus(as);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid attendance status");
            }
        }
        reg.setCompletionNote(req.getCompletionNote());
        reg.setStatus(Registration.Status.completed);
        reg.setCompletedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        return toResponse(reg);
    }

    private RegistrationResponse toResponse(Registration r) {
        return new RegistrationResponse(
                r.getId(),
                r.getEventId(),
                r.getVolunteerId(),
                r.getStatus() == null ? null : r.getStatus().name(),
                r.getNote(),
                r.getOrganizerNote(),
                r.getAttendanceStatus() == null ? null : r.getAttendanceStatus().name(),
                r.getCompletionNote(),
                r.getRegisteredAt(),
                r.getApprovedAt(),
                r.getCompletedAt(),
                r.getCancelledAt()
        );
    }
}
