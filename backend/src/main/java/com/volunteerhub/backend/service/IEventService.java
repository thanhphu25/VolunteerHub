package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.Optional;

public interface IEventService {
    EventResponse createEvent(EventCreateRequest req, Authentication auth);
    Page<EventResponse> listEvents(Optional<String> statusOpt, Pageable pageable);
    EventResponse getEvent(Long id);
    EventResponse updateEvent(Long id, EventCreateRequest req, Authentication auth);
    EventResponse approveEvent(Long id, Authentication auth);
}
