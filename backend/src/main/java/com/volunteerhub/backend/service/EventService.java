package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.EventDto;
import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventUpdateRequest;
import java.util.List;
import java.util.Optional;

public interface EventService {
    List<EventDto> findAll();
    Optional<EventDto> findById(Long id);

    EventDto create(EventCreateRequest req);
    EventDto update(Long id, EventUpdateRequest req);
    void delete(Long id);
}
