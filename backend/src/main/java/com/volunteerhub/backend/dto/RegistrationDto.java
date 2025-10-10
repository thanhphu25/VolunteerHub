package com.volunteerhub.backend.dto;

import java.time.LocalDateTime;

public class RegistrationDto {
    private Long id;
    private Long eventId;
    private Long userId;
    private String status;
    private LocalDateTime registeredAt;

    public RegistrationDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}
