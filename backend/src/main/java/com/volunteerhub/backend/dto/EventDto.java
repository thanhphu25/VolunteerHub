package com.volunteerhub.backend.dto;

import java.time.LocalDateTime;

public class EventDto {
    private Long id;
    private String name;
    private String description;
    private String category;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public EventDto() {}
    public EventDto(Long id, String name, String description, String category, LocalDateTime startDate, LocalDateTime endDate) {
        this.id = id; this.name = name; this.description = description; this.category = category; this.startDate = startDate; this.endDate = endDate;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getEndDate() { return endDate; }
}
