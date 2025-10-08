package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.dto.EventDto;
import com.volunteerhub.backend.model.Event;
import com.volunteerhub.backend.repository.EventRepository;
import com.volunteerhub.backend.service.EventService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    private EventDto toDto(Event e) {
        EventDto d = new EventDto();
        d.setId(e.getId());
        d.setTitle(e.getTitle());
        d.setDescription(e.getDescription());
        d.setCategory(e.getCategory());
        d.setLocation(e.getLocation());
        d.setStartTime(e.getStartTime());
        d.setEndTime(e.getEndTime());
        d.setStatus(e.getStatus());
        if (e.getCreatedBy() != null) {
            d.setCreatedById(e.getCreatedBy().getId());
        }
        return d;
    }

    @Override
    public List<EventDto> findAll() {
        List<Event> events = eventRepository.findAll();
        return events.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public Optional<EventDto> findById(Long id) {
        return eventRepository.findById(id).map(this::toDto);
    }
}
