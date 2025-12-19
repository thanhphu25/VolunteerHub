package com.volunteerhub.backend.service;

import com.volunteerhub.backend.dto.EventCreateRequest;
import com.volunteerhub.backend.dto.EventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface IEventService {
    EventResponse createEvent(EventCreateRequest req, Authentication auth);

    Page<EventResponse> listEvents(Optional<String> statusOpt, Optional<String> timeStatusOpt, Pageable pageable);

    Page<EventResponse> listEventsWithFilters(Optional<String> statusOpt, Optional<String> category,
            Optional<String> location, Optional<String> search,
            Optional<LocalDateTime> startDate, Optional<LocalDateTime> endDate,
            Optional<String> organizerNameOpt,
            Optional<String> timeStatusOpt,
            Pageable pageable);

    EventResponse getEvent(Long id);

    EventResponse updateEvent(Long id, EventCreateRequest req, Authentication auth);

    EventResponse approveEvent(Long id, Authentication auth);

    EventResponse rejectEvent(Long id, String reason, Authentication auth);

    EventResponse cancelEvent(Long id, Authentication auth);

    void deleteEvent(Long id, Authentication auth);

    Page<EventResponse> listOrganizerEvents(Long organizerId,
            Optional<String> statusOpt,
            Optional<String> category,
            Optional<String> location,
            Optional<String> search,
            Optional<LocalDateTime> startDate,
            Optional<LocalDateTime> endDate,
            Pageable pageable);

    // --- Mới thêm: Lấy danh sách sự kiện nổi bật ---
    List<EventResponse> getTrendingEvents(int limit);
}
