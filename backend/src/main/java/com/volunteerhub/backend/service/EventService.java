package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.EventDto;
import java.util.List;
import java.util.Optional;

public interface EventService {
    List<EventDto> findAll();
    Optional<EventDto> findById(Long id);
}
