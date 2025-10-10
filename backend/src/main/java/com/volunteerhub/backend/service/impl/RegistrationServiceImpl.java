package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.RegistrationDto;
import com.volunteerhub.backend.dto.RegistrationRequest;
import com.volunteerhub.backend.exception.ResourceNotFoundException;
import com.volunteerhub.backend.model.Event;
import com.volunteerhub.backend.model.Registration;
import com.volunteerhub.backend.model.User;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.repository.RegistrationRepository;
import com.volunteerhub.backend.repository.UserRepository;
import com.volunteerhub.backend.service.RegistrationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RegistrationServiceImpl(RegistrationRepository registrationRepository,
                                   EventRepository eventRepository,
                                   UserRepository userRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    private RegistrationDto toDto(Registration r) {
        RegistrationDto d = new RegistrationDto();
        d.setId(r.getId());
        d.setEventId(r.getEvent().getId());
        d.setUserId(r.getUser().getId());
        d.setStatus(r.getStatus());
        d.setRegisteredAt(r.getRegisteredAt());
        return d;
    }

    @Override
    @Transactional
    public RegistrationDto register(Long eventId, RegistrationRequest req) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getUserId()));

        // Prevent duplicate registration
        if (registrationRepository.findByEventIdAndUserId(eventId, req.getUserId()).isPresent()) {
            throw new IllegalArgumentException("User already registered for this event");
        }

        // Business rule: cannot register after event end
        if (event.getEndTime() != null && event.getEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot register for past event");
        }

        Registration reg = new Registration();
        reg.setEvent(event);
        reg.setUser(user);
        reg.setStatus("PENDING");
        reg.setRegisteredAt(LocalDateTime.now());

        registrationRepository.save(reg);
        return toDto(reg);
    }

    @Override
    @Transactional
    public void unregister(Long eventId, RegistrationRequest req) {
        Registration reg = registrationRepository.findByEventIdAndUserId(eventId, req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        // business: can't unregister after completed or if event already happened
        Event event = reg.getEvent();
        if (event.getStartTime() != null && event.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot unregister after event has started");
        }
        // allow unregister if PENDING or APPROVED
        reg.setStatus("CANCELLED");
        registrationRepository.save(reg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationDto> listByEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationDto> listByUser(Long userId) {
        return registrationRepository.findByUserId(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RegistrationDto approve(Long registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        reg.setStatus("APPROVED");
        registrationRepository.save(reg);
        return toDto(reg);
    }

    @Override
    @Transactional
    public RegistrationDto cancel(Long registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        reg.setStatus("CANCELLED");
        registrationRepository.save(reg);
        return toDto(reg);
    }

    @Override
    @Transactional
    public RegistrationDto complete(Long registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        reg.setStatus("COMPLETED");
        registrationRepository.save(reg);
        return toDto(reg);
    }
}
